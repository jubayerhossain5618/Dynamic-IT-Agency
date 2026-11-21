const recentSmsLog = [];
const MAX_SMS_LOG = 100;

const isSmsProviderConfigured = () => {
  return Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY);
};

/**
 * Dispatches an SMS notification through the configured SMS gateway
 * ONLY when the customer has explicitly granted SMS notification consent
 * (`user.notificationPreferences.sms === true`).
 */
const sendSmsNotification = async ({
  user,
  phone,
  message,
  eventType = 'general',
  simulateFailure = false,
}) => {
  try {
    const targetPhone = phone || user?.phone;

    // Strict Customer Consent Requirement (Section 3)
    const hasConsent = Boolean(
      user &&
        user.notificationPreferences &&
        user.notificationPreferences.sms === true
    );

    if (!hasConsent) {
      const skippedRecord = {
        phone: targetPhone || 'unknown',
        eventType,
        status: 'skipped_no_consent',
        reason: 'Customer has not opted in to SMS notifications.',
        timestamp: new Date().toISOString(),
      };
      recentSmsLog.unshift(skippedRecord);
      if (recentSmsLog.length > MAX_SMS_LOG) recentSmsLog.pop();
      return { sent: false, skipped: true, reason: skippedRecord.reason };
    }

    if (!targetPhone || !message) {
      return { sent: false, error: 'Recipient phone number and message are required.' };
    }

    if (simulateFailure || process.env.SMS_SIMULATE_FAILURE === 'true') {
      throw new Error('Simulated SMS gateway provider timeout.');
    }

    let providerMode = 'sandbox_log';

    if (isSmsProviderConfigured()) {
      providerMode = process.env.SMS_PROVIDER || 'http_gateway';
      const response = await fetch(process.env.SMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SMS_API_KEY}`,
        },
        body: JSON.stringify({
          api_key: process.env.SMS_API_KEY,
          senderid: process.env.SMS_SENDER_ID || 'DynamicIT',
          number: targetPhone,
          message: message.trim().slice(0, 320),
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS provider responded with HTTP ${response.status}`);
      }
    }

    const record = {
      phone: targetPhone,
      message: message.trim().slice(0, 320),
      eventType,
      mode: providerMode,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };
    recentSmsLog.unshift(record);
    if (recentSmsLog.length > MAX_SMS_LOG) recentSmsLog.pop();

    return { sent: true, ...record };
  } catch (error) {
    const failRecord = {
      phone: phone || user?.phone || 'unknown',
      eventType,
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    recentSmsLog.unshift(failRecord);
    if (recentSmsLog.length > MAX_SMS_LOG) recentSmsLog.pop();

    console.warn(`[SmsService] SMS failed for '${eventType}': ${error.message}`);
    return { sent: false, error: error.message };
  }
};

const getRecentDispatchedSms = () => recentSmsLog;

module.exports = {
  isSmsProviderConfigured,
  sendSmsNotification,
  getRecentDispatchedSms,
};
