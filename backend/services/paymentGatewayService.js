const crypto = require('crypto');
const { getJwtSecret } = require('../utils/jwt');

/**
 * Official bKash Tokenized Checkout & Nagad PGW Integration Layer
 *
 * Security Rules Enforced:
 * 1. Merchant credentials live strictly in backend environment variables.
 * 2. Never trusts frontend payment success messages; every payment is verified server-side.
 * 3. In production (`NODE_ENV === 'production'`), live merchant credentials are required;
 *    fake/sandbox responses are strictly disabled in production.
 * 4. In development/test (`NODE_ENV !== 'production'`), if live merchant keys are not set,
 *    a cryptographically signed server-side sandbox handshake is used so initiation,
 *    verification, failure/cancellation, and duplicate transaction prevention can be tested.
 */

const isBkashMerchantConfigured = () => {
  return Boolean(
    process.env.BKASH_BASE_URL &&
      process.env.BKASH_APP_KEY &&
      process.env.BKASH_APP_SECRET &&
      process.env.BKASH_USERNAME &&
      process.env.BKASH_PASSWORD
  );
};

const isNagadMerchantConfigured = () => {
  return Boolean(
    process.env.NAGAD_BASE_URL &&
      process.env.NAGAD_MERCHANT_ID &&
      process.env.NAGAD_PUBLIC_KEY &&
      process.env.NAGAD_PRIVATE_KEY
  );
};

const signSandboxSession = (payload) => {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', getJwtSecret()).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, hmac })).toString('base64url');
};

const verifySandboxSession = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const expectedHmac = crypto
      .createHmac('sha256', getJwtSecret())
      .update(decoded.data)
      .digest('hex');
    if (expectedHmac !== decoded.hmac) return null;
    return JSON.parse(decoded.data);
  } catch (_err) {
    return null;
  }
};

// ============================================================================
// 1. bKash Tokenized Checkout API Integration
// ============================================================================
const grantBkashToken = async () => {
  const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id_token) {
    throw new Error(data.statusMessage || 'bKash token grant failed.');
  }
  return data.id_token;
};

const initiateBkashPayment = async ({ projectId, customerId, amount, invoiceNumber, callbackUrl }) => {
  if (isBkashMerchantConfigured()) {
    const idToken = await grantBkashToken();
    const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: customerId.toString(),
        callbackURL: callbackUrl,
        amount: String(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoiceNumber,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.paymentID) {
      throw new Error(data.statusMessage || 'bKash payment creation failed.');
    }
    return {
      mode: 'live_merchant',
      gateway: 'bkash',
      gatewayPaymentId: data.paymentID,
      checkoutUrl: data.bkashURL,
      invoiceNumber,
    };
  }

  // Strictly block simulated responses in production
  if (process.env.NODE_ENV === 'production') {
    const err = new Error(
      'bKash merchant credentials (BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD) are not configured for production.'
    );
    err.statusCode = 503;
    throw err;
  }

  // Development & QA Sandbox Handshake
  const gatewayPaymentId = `BKASH-SBX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const verificationToken = signSandboxSession({
    gateway: 'bkash',
    gatewayPaymentId,
    projectId: projectId.toString(),
    customerId: customerId.toString(),
    amount: Number(amount),
    invoiceNumber,
    issuedAt: Date.now(),
  });

  return {
    mode: 'development_sandbox',
    gateway: 'bkash',
    gatewayPaymentId,
    verificationToken,
    invoiceNumber,
    checkoutUrl: `${callbackUrl}?gateway=bkash&paymentID=${gatewayPaymentId}&status=success`,
  };
};

const verifyBkashPayment = async ({ gatewayPaymentId, verificationToken, outcome = 'success', customTrxId }) => {
  if (isBkashMerchantConfigured()) {
    const idToken = await grantBkashToken();
    const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({ paymentID: gatewayPaymentId }),
    });
    const data = await res.json();
    if (data.transactionStatus === 'Completed' && data.trxID) {
      return {
        verified: true,
        status: 'verified',
        transactionReference: data.trxID,
        amount: Number(data.amount),
        raw: data,
      };
    }
    return {
      verified: false,
      status: 'failed',
      message: data.statusMessage || 'bKash transaction verification failed.',
      raw: data,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    const err = new Error('bKash merchant credentials are required in production.');
    err.statusCode = 503;
    throw err;
  }

  const session = verifySandboxSession(verificationToken);
  if (!session || session.gateway !== 'bkash' || session.gatewayPaymentId !== gatewayPaymentId) {
    return {
      verified: false,
      status: 'failed',
      message: 'Invalid or tampered bKash payment verification signature.',
    };
  }

  if (outcome === 'cancelled') {
    return {
      verified: false,
      status: 'cancelled',
      message: 'bKash checkout was cancelled by the customer.',
    };
  }

  if (outcome === 'failed') {
    return {
      verified: false,
      status: 'failed',
      message: 'bKash sandbox payment authorization was declined.',
    };
  }

  const trxId =
    customTrxId ||
    `BKX${Date.now().toString().slice(-6)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  return {
    verified: true,
    status: 'verified',
    transactionReference: trxId,
    amount: Number(session.amount),
  };
};

// ============================================================================
// 2. Nagad Payment Gateway API Integration
// ============================================================================
const initiateNagadPayment = async ({ projectId, customerId, amount, invoiceNumber, callbackUrl }) => {
  if (isNagadMerchantConfigured()) {
    const merchantId = process.env.NAGAD_MERCHANT_ID;
    const datetime = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const challenge = crypto.randomBytes(16).toString('hex');

    const sensitiveData = JSON.stringify({
      merchantId,
      datetime,
      orderId: invoiceNumber,
      challenge,
    });

    const encryptedData = crypto
      .publicEncrypt(
        {
          key: process.env.NAGAD_PUBLIC_KEY,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(sensitiveData)
      )
      .toString('base64');

    const sign = crypto.createSign('SHA256');
    sign.update(sensitiveData);
    sign.end();
    const signature = sign.sign(process.env.NAGAD_PRIVATE_KEY, 'base64');

    const res = await fetch(
      `${process.env.NAGAD_BASE_URL}/api/dfs/check-out/initialize/${merchantId}/${invoiceNumber}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
        },
        body: JSON.stringify({
          dateTime: datetime,
          sensitiveData: encryptedData,
          signature,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.sensitiveData) {
      throw new Error(data.message || 'Nagad checkout initialization failed.');
    }

    return {
      mode: 'live_merchant',
      gateway: 'nagad',
      gatewayPaymentId: invoiceNumber,
      checkoutUrl: data.callBackUrl || callbackUrl,
      invoiceNumber,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    const err = new Error(
      'Nagad merchant credentials (NAGAD_MERCHANT_ID, NAGAD_PUBLIC_KEY, NAGAD_PRIVATE_KEY) are not configured for production.'
    );
    err.statusCode = 503;
    throw err;
  }

  const gatewayPaymentId = `NAGAD-SBX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const verificationToken = signSandboxSession({
    gateway: 'nagad',
    gatewayPaymentId,
    projectId: projectId.toString(),
    customerId: customerId.toString(),
    amount: Number(amount),
    invoiceNumber,
    issuedAt: Date.now(),
  });

  return {
    mode: 'development_sandbox',
    gateway: 'nagad',
    gatewayPaymentId,
    verificationToken,
    invoiceNumber,
    checkoutUrl: `${callbackUrl}?gateway=nagad&payment_ref_id=${gatewayPaymentId}&status=Success`,
  };
};

const verifyNagadPayment = async ({ gatewayPaymentId, verificationToken, outcome = 'success', customTrxId }) => {
  if (isNagadMerchantConfigured()) {
    const res = await fetch(
      `${process.env.NAGAD_BASE_URL}/api/dfs/verify/payment/${gatewayPaymentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
        },
      }
    );
    const data = await res.json();
    if (data.status === 'Success' && data.issuerPaymentRefNo) {
      return {
        verified: true,
        status: 'verified',
        transactionReference: data.issuerPaymentRefNo,
        amount: Number(data.amount),
        raw: data,
      };
    }
    return {
      verified: false,
      status: 'failed',
      message: data.message || 'Nagad payment verification failed.',
      raw: data,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    const err = new Error('Nagad merchant credentials are required in production.');
    err.statusCode = 503;
    throw err;
  }

  const session = verifySandboxSession(verificationToken);
  if (!session || session.gateway !== 'nagad' || session.gatewayPaymentId !== gatewayPaymentId) {
    return {
      verified: false,
      status: 'failed',
      message: 'Invalid or tampered Nagad payment verification signature.',
    };
  }

  if (outcome === 'cancelled') {
    return {
      verified: false,
      status: 'cancelled',
      message: 'Nagad checkout was cancelled by the customer.',
    };
  }

  if (outcome === 'failed') {
    return {
      verified: false,
      status: 'failed',
      message: 'Nagad sandbox payment authorization was declined.',
    };
  }

  const trxId =
    customTrxId ||
    `NGD${Date.now().toString().slice(-6)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  return {
    verified: true,
    status: 'verified',
    transactionReference: trxId,
    amount: Number(session.amount),
  };
};

module.exports = {
  isBkashMerchantConfigured,
  isNagadMerchantConfigured,
  initiateBkashPayment,
  verifyBkashPayment,
  initiateNagadPayment,
  verifyNagadPayment,
};
