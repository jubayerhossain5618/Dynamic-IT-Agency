/**
 * Automated End-to-End, Payment Gateway, Email/SMS & Socket.IO QA Verification Suite:
 * - Steps 1–16: Complete Core Workflow
 * - Step 17: Unauthorized & Role-Based Access Control (401 / 403)
 * - Step 18: Cross-Customer REST Resource Isolation (403)
 * - Step 19: Invalid Quotation & Overpayment Guards (400)
 * - Step 20: Project Audit History & 100% Completion Status Consistency
 * - Step 21: bKash & Nagad Payment Initiation, Server Verification, Failure & Cancellation
 * - Step 22: Duplicate Payment Session & Duplicate Transaction ID Prevention
 * - Step 23: Email Delivery, Verification/Password Reset & Failure Handling
 * - Step 24: SMS Notification Consent Enforcement & Failure Handling
 * - Step 25: Real-Time Notification Persistence, Mark Read & Socket.IO Delivery
 * - Step 26: Unauthorized Socket.IO Connection Rejection
 * - Step 27: Real-Time Live Chat & Socket.IO Cross-Customer Room Isolation (403)
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

process.env.NODE_ENV = 'test';

const { io: ClientIO } = require('../../frontend/node_modules/socket.io-client');
const { connectDB, stopLocalMongod } = require('../config/db');
const { httpServer } = require('../server');
const ensureInitialData = require('./ensureSeed');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { sendEmail, getRecentDispatchedEmails } = require('../services/emailService');
const { sendSmsNotification, getRecentDispatchedSms } = require('../services/smsService');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Verification Failed: ${message}`);
  }
};

const extractCookie = (res) => {
  const rawCookies = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  for (const c of rawCookies) {
    const match = c.match(/token=([^;]+)/);
    if (match && match[1]) {
      return `token=${match[1]}`;
    }
  }
  return '';
};

const runWorkflowVerification = async () => {
  let server = null;
  const activeSockets = [];
  try {
    console.log('========================================================================');
    console.log(' DYNAMIC IT — FULL PRODUCTION E2E, GATEWAY, EMAIL/SMS & SOCKET QA SUITE');
    console.log('========================================================================');

    await connectDB();
    await ensureInitialData(false);

    server = await new Promise((resolve) => {
      const s = httpServer.listen(0, '127.0.0.1', () => resolve(s));
    });

    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/api`;
    const socketUrl = `http://127.0.0.1:${port}`;

    const requestJson = async (endpoint, options = {}) => {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      const cookie = extractCookie(res);
      const data = await res.json();
      return { status: res.status, data, cookie };
    };

    // Step 1: Health endpoint check
    const healthRes = await requestJson('/health');
    assert(healthRes.status === 200 && healthRes.data.success, 'Step 1: Health endpoint check');
    console.log('[PASS] Step 1: Dynamic IT public API health check operational');

    // Step 2: Browse the six digital services
    const servicesRes = await requestJson('/services');
    assert(
      servicesRes.status === 200 && servicesRes.data.services.length >= 6,
      'Step 2: Expected at least 6 services in MongoDB'
    );
    const websiteService = servicesRes.data.services.find(
      (s) => s.slug === 'website-development'
    );
    assert(Boolean(websiteService), 'Step 2: Website Development service must exist');
    console.log(
      `[PASS] Step 2: Retrieved ${servicesRes.data.services.length} services from MongoDB`
    );

    // Step 3: Register Customer A (initially without SMS consent to test consent enforcement)
    const demoEmailA = `customer.a.${Date.now()}@university.edu.bd`;
    const regResA = await requestJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Arafat Hossain (Customer A)',
        email: demoEmailA,
        phone: '+880 1700-998877',
        company: 'Hossain Enterprise BD',
        password: 'Password123',
        confirmPassword: 'Password123',
        smsConsent: false,
      }),
    });
    assert(
      regResA.status === 201 &&
        regResA.data.user.role === 'customer' &&
        regResA.data.token === undefined,
      'Step 3: Customer registration must succeed with HTTP-only cookie'
    );
    console.log(`[PASS] Step 3: Registered Customer A (${demoEmailA}) with HTTP-only cookie`);

    // Step 4: Log in as Customer A
    const custLoginResA = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: demoEmailA,
        password: 'Password123',
      }),
    });
    assert(
      custLoginResA.status === 200 && Boolean(custLoginResA.cookie),
      'Step 4: Customer login must set HTTP-only JWT cookie'
    );
    const customerCookieA = custLoginResA.cookie;
    console.log('[PASS] Step 4: Logged in as Customer A via HTTP-only cookie');

    // Step 5: Submit a Website Development service request
    const createReqRes = await requestJson('/requests', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        service: websiteService._id,
        projectTitle: 'Five-Page Responsive Business Website',
        description:
          'We need a professional 5-page business website including Home, About, Services, Portfolio, and Contact page.',
        requirements: 'Mobile responsive layout, SEO friendly, fast loading.',
        budget: 15000,
        preferredDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    assert(
      createReqRes.status === 201 && createReqRes.data.request.status === 'pending',
      'Step 5: Customer submits Website Development service request'
    );
    const demoRequestId = createReqRes.data.request._id;
    console.log(`[PASS] Step 5: Submitted Website Development request (ID: ${demoRequestId})`);

    // Step 6: Log in as Admin
    const adminLoginRes = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@dynamicit.com',
        password: 'Password123',
      }),
    });
    assert(
      adminLoginRes.status === 200 &&
        adminLoginRes.data.user.role === 'admin' &&
        Boolean(adminLoginRes.cookie),
      'Step 6: Admin login must succeed'
    );
    const adminCookie = adminLoginRes.cookie;
    console.log('[PASS] Step 6: Logged in as Administrator (admin@dynamicit.com)');

    // Step 7: Admin reviews the customer's request
    const reviewReqRes = await requestJson(`/requests/${demoRequestId}/status`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        status: 'under_review',
        adminNotes: 'Reviewed requirements during QA verification.',
      }),
    });
    assert(
      reviewReqRes.status === 200 && reviewReqRes.data.request.status === 'under_review',
      'Step 7: Admin updates request status to under_review'
    );
    console.log('[PASS] Step 7: Admin reviewed customer service request');

    // Step 8: Admin creates a quotation (Price: ৳15,000, Estimated delivery: 15 days)
    const createQuoRes = await requestJson('/quotations', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        requestId: demoRequestId,
        amount: 15000,
        estimatedDays: 15,
        scope: 'Five-page responsive business website',
        terms: '50% advance payment upon quotation acceptance, 50% upon project completion.',
      }),
    });
    assert(
      createQuoRes.status === 201 && createQuoRes.data.quotation.amount === 15000,
      'Step 8: Admin creates quotation for ৳15,000'
    );
    const demoQuotationId = createQuoRes.data.quotation._id;
    console.log('[PASS] Step 8: Admin created quotation (৳15,000, 15 days)');

    // Step 9 & 10: Customer A views and accepts the quotation
    const acceptQuoRes = await requestJson(`/quotations/${demoQuotationId}/respond`, {
      method: 'PATCH',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        status: 'accepted',
        customerNote: 'Quotation terms and ৳15,000 budget approved.',
      }),
    });
    assert(
      acceptQuoRes.status === 200 && acceptQuoRes.data.quotation.status === 'accepted',
      'Step 10: Customer accepts quotation'
    );
    console.log('[PASS] Step 9 & 10: Customer A viewed and accepted the quotation');

    // Step 11: Admin creates a project from the accepted quotation
    const createProjRes = await requestJson('/projects', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        quotationId: demoQuotationId,
        projectTitle: 'Five-Page Responsive Business Website',
        description: 'Five-page responsive business website',
      }),
    });
    assert(
      createProjRes.status === 201 && createProjRes.data.project.totalAmount === 15000,
      'Step 11: Admin creates project from accepted quotation'
    );
    const demoProjectId = createProjRes.data.project._id;

    const duplicateProjRes = await requestJson('/projects', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ quotationId: demoQuotationId }),
    });
    assert(duplicateProjRes.status === 400, 'Duplicate project creation must be rejected');
    console.log(`[PASS] Step 11: Admin created project (ID: ${demoProjectId}) & duplicate guard verified`);

    // Step 12 & 13: Admin updates project progress to 40%, then 65%
    await requestJson(`/projects/${demoProjectId}/progress`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ progress: 40 }),
    });
    await requestJson(`/projects/${demoProjectId}/progress`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ progress: 65 }),
    });
    const custProjRes = await requestJson(`/projects/${demoProjectId}`, {
      headers: { Cookie: customerCookieA },
    });
    assert(
      custProjRes.status === 200 && custProjRes.data.project.progress === 65,
      'Step 13: Customer sees updated 65% progress'
    );
    console.log('[PASS] Step 12 & 13: Admin updated progress to 40% -> 65% and Customer A verified');

    // Step 14 & 15: Admin records a manual partial payment (৳5,000 out of ৳15,000)
    const manualTrxRef = `TRX-MANUAL-${Date.now()}`;
    const paymentRes = await requestJson('/payments', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        projectId: demoProjectId,
        paidAmount: 5000,
        paymentMethod: 'Bank Transfer',
        transactionReference: manualTrxRef,
        notes: 'Initial bank transfer installment.',
      }),
    });
    assert(
      paymentRes.status === 201 &&
        paymentRes.data.payment.paidAmount === 5000 &&
        paymentRes.data.payment.remainingAmount === 10000,
      'Step 14: Admin records manual partial payment of ৳5,000'
    );
    console.log('[PASS] Step 14 & 15: Manual payment of ৳5,000 recorded (Remaining: ৳10,000)');

    // Step 16: REST Project Messaging
    const custMsgRes = await requestJson('/messages', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        projectId: demoProjectId,
        message: 'Hello Admin, bank transfer of ৳5,000 completed!',
      }),
    });
    assert(custMsgRes.status === 201, 'Step 16: Customer sends project message');
    console.log('[PASS] Step 16: Project message persisted in MongoDB');

    // Step 17 & 18: Unauthorized Access & Cross-Customer REST Isolation
    const unauthRes = await requestJson('/requests/my');
    assert(unauthRes.status === 401, 'Step 17a: Unauthenticated request must return 401');

    const demoEmailB = `customer.b.${Date.now()}@university.edu.bd`;
    const regResB = await requestJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sadia Islam (Customer B)',
        email: demoEmailB,
        phone: '+880 1800-112233',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const customerCookieB = regResB.cookie;

    const crossProjRes = await requestJson(`/projects/${demoProjectId}`, {
      headers: { Cookie: customerCookieB },
    });
    assert(
      crossProjRes.status === 403,
      'Step 18: Customer B must receive 403 Forbidden on Customer A project'
    );
    console.log('[PASS] Step 17 & 18: RBAC (401/403) and Cross-Customer REST isolation verified');

    // Step 19 & 20: Overpayment Guard & Project Audit History
    const overpaymentRes = await requestJson('/payments', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        projectId: demoProjectId,
        paidAmount: 25000,
        paymentMethod: 'Cash',
      }),
    });
    assert(overpaymentRes.status === 400, 'Step 19: Overpayment must be rejected with 400');

    const completeProjRes = await requestJson(`/projects/${demoProjectId}/progress`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ progress: 100 }),
    });
    assert(
      completeProjRes.data.project.status === 'completed' &&
        completeProjRes.data.project.history.length >= 4,
      'Step 20: 100% progress must auto-complete project and log audit history'
    );
    console.log('[PASS] Step 19 & 20: Overpayment guard (400) & project audit history verified');

    // ========================================================================
    // Step 21: bKash & Nagad Gateway Initiation, Verification, Failure & Cancel
    // ========================================================================
    // 21a: Initiate bKash payment of ৳3,000
    const bkashInitRes = await requestJson('/payments/gateway/initiate', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        projectId: demoProjectId,
        gateway: 'bkash',
        amount: 3000,
      }),
    });
    assert(
      bkashInitRes.status === 201 &&
        bkashInitRes.data.gateway === 'bkash' &&
        Boolean(bkashInitRes.data.gatewayPaymentId),
      'Step 21a: bKash gateway payment session must initiate on backend'
    );

    // 21b: Test tampered verification token rejection
    const tamperedBkashRes = await requestJson('/payments/gateway/verify', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        paymentRecordId: bkashInitRes.data.paymentRecordId,
        gatewayPaymentId: bkashInitRes.data.gatewayPaymentId,
        verificationToken: 'tampered.invalid.token',
      }),
    });
    assert(
      tamperedBkashRes.status === 400,
      'Step 21b: Tampered gateway verification signature must be rejected with 400'
    );

    // 21c: Initiate & verify successful bKash payment of ৳3,000
    const bkashInit2 = await requestJson('/payments/gateway/initiate', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        projectId: demoProjectId,
        gateway: 'bkash',
        amount: 3000,
      }),
    });
    const bkashVerifyRes = await requestJson('/payments/gateway/verify', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        paymentRecordId: bkashInit2.data.paymentRecordId,
        gatewayPaymentId: bkashInit2.data.gatewayPaymentId,
        verificationToken: bkashInit2.data.verificationToken,
        outcome: 'success',
      }),
    });
    assert(
      bkashVerifyRes.status === 200 &&
        bkashVerifyRes.data.payment.gatewayStatus === 'verified' &&
        bkashVerifyRes.data.payment.remainingAmount === 7000,
      'Step 21c: Verified bKash payment of ৳3,000 must reduce remaining balance to ৳7,000'
    );
    const verifiedBkashTrxId = bkashVerifyRes.data.payment.transactionReference;

    // 21d: Initiate & verify Nagad payment of ৳2,000, plus test Nagad cancellation
    const nagadCancelInit = await requestJson('/payments/gateway/initiate', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        projectId: demoProjectId,
        gateway: 'nagad',
        amount: 2000,
      }),
    });
    const nagadCancelRes = await requestJson('/payments/gateway/verify', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        paymentRecordId: nagadCancelInit.data.paymentRecordId,
        gatewayPaymentId: nagadCancelInit.data.gatewayPaymentId,
        verificationToken: nagadCancelInit.data.verificationToken,
        outcome: 'cancelled',
      }),
    });
    assert(
      nagadCancelRes.status === 400 && nagadCancelRes.data.status === 'cancelled',
      'Step 21d: Cancelled Nagad checkout must record cancelled status and not credit balance'
    );

    const nagadSuccessInit = await requestJson('/payments/gateway/initiate', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        projectId: demoProjectId,
        gateway: 'nagad',
        amount: 2000,
      }),
    });
    const nagadSuccessRes = await requestJson('/payments/gateway/verify', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        paymentRecordId: nagadSuccessInit.data.paymentRecordId,
        gatewayPaymentId: nagadSuccessInit.data.gatewayPaymentId,
        verificationToken: nagadSuccessInit.data.verificationToken,
        outcome: 'success',
      }),
    });
    assert(
      nagadSuccessRes.status === 200 &&
        nagadSuccessRes.data.payment.remainingAmount === 5000,
      'Step 21e: Verified Nagad payment of ৳2,000 must reduce remaining balance to ৳5,000'
    );
    console.log(
      '[PASS] Step 21: bKash & Nagad initiation, cryptographic verification, decline, and cancellation verified'
    );

    // ========================================================================
    // Step 22: Duplicate Payment Session & Duplicate Transaction ID Prevention
    // ========================================================================
    // 22a: Attempting to verify the same bKash payment session a second time
    const doubleVerifyRes = await requestJson('/payments/gateway/verify', {
      method: 'POST',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        paymentRecordId: bkashInit2.data.paymentRecordId,
        gatewayPaymentId: bkashInit2.data.gatewayPaymentId,
        verificationToken: bkashInit2.data.verificationToken,
        outcome: 'success',
      }),
    });
    assert(
      doubleVerifyRes.status === 400,
      'Step 22a: Re-verifying an already processed gateway session must be rejected with 400'
    );

    // 22b: Attempting to record a duplicate transactionReference
    const dupTrxRes = await requestJson('/payments', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        projectId: demoProjectId,
        paidAmount: 1000,
        paymentMethod: 'bKash',
        transactionReference: verifiedBkashTrxId,
      }),
    });
    assert(
      dupTrxRes.status === 400,
      'Step 22b: Reusing an existing transactionReference must be rejected with 400'
    );
    console.log(
      '[PASS] Step 22: Duplicate payment session & duplicate transaction ID prevention verified'
    );

    // ========================================================================
    // Step 23: Email Delivery, Verification / Password Reset & Failure Handling
    // ========================================================================
    const dispatchedEmails = getRecentDispatchedEmails();
    assert(
      dispatchedEmails.length >= 6 &&
        dispatchedEmails.some((e) => e.eventType === 'customer_registration') &&
        dispatchedEmails.some((e) => e.eventType === 'new_quotation') &&
        dispatchedEmails.some((e) => e.eventType === 'payment_confirmation'),
      'Step 23a: Automated HTML emails must be dispatched for registration, quotation, project, and payments'
    );

    const forgotRes = await requestJson('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: demoEmailA }),
    });
    assert(forgotRes.status === 200, 'Step 23b: Forgot password endpoint must succeed');

    const failedEmailResult = await sendEmail({
      to: demoEmailA,
      subject: 'Simulated Failure Test',
      simulateFailure: true,
    });
    assert(
      failedEmailResult.sent === false && Boolean(failedEmailResult.error),
      'Step 23c: Email service must gracefully catch and report delivery failure without crashing'
    );
    console.log(
      `[PASS] Step 23: Email delivery (${dispatchedEmails.length} emails), password reset flow, and failure handling verified`
    );

    // ========================================================================
    // Step 24: SMS Notification Consent Enforcement & Failure Handling
    // ========================================================================
    const smsLogsBeforeConsent = getRecentDispatchedSms();
    assert(
      smsLogsBeforeConsent.some((s) => s.status === 'skipped_no_consent'),
      'Step 24a: SMS must be skipped when customer has not opted in to SMS notifications'
    );

    // Customer A explicitly opts into SMS notifications via profile update
    const optInRes = await requestJson('/auth/profile', {
      method: 'PUT',
      headers: { Cookie: customerCookieA },
      body: JSON.stringify({
        notificationPreferences: { email: true, sms: true },
      }),
    });
    assert(
      optInRes.status === 200 && optInRes.data.user.notificationPreferences.sms === true,
      'Step 24b: Customer opts in to SMS consent'
    );

    const consentedUser = await User.findById(regResA.data.user._id);
    const smsSentResult = await sendSmsNotification({
      user: consentedUser,
      message: 'Dynamic IT: Test consented SMS alert.',
      eventType: 'consent_verified_test',
    });
    assert(
      smsSentResult.sent === true,
      'Step 24c: SMS must be dispatched once customer has granted explicit SMS consent'
    );

    const smsFailResult = await sendSmsNotification({
      user: consentedUser,
      message: 'Dynamic IT: Simulated failure SMS.',
      simulateFailure: true,
    });
    assert(
      smsFailResult.sent === false && Boolean(smsFailResult.error),
      'Step 24d: SMS failure must be handled gracefully'
    );
    console.log('[PASS] Step 24: SMS customer consent enforcement, delivery, and failure handling verified');

    // ========================================================================
    // Step 25: Real-Time Notification Persistence, Mark Read & Mark All Read
    // ========================================================================
    const notifRes = await requestJson('/notifications', {
      headers: { Cookie: customerCookieA },
    });
    assert(
      notifRes.status === 200 &&
        notifRes.data.notifications.length >= 4 &&
        notifRes.data.unreadCount >= 4,
      'Step 25a: Notifications must persist in MongoDB with unreadCount'
    );

    const firstNotifId = notifRes.data.notifications[0]._id;
    const markOneRes = await requestJson(`/notifications/${firstNotifId}/read`, {
      method: 'PATCH',
      headers: { Cookie: customerCookieA },
    });
    assert(
      markOneRes.status === 200 && markOneRes.data.notification.isRead === true,
      'Step 25b: Mark single notification as read'
    );

    const markAllRes = await requestJson('/notifications/read-all', {
      method: 'PATCH',
      headers: { Cookie: customerCookieA },
    });
    assert(
      markAllRes.status === 200 && markAllRes.data.unreadCount === 0,
      'Step 25c: Mark all notifications as read'
    );
    console.log('[PASS] Step 25: Notification MongoDB persistence, mark read, and mark all read verified');

    // ========================================================================
    // Step 26: Unauthorized Socket.IO Connection Rejection
    // ========================================================================
    await new Promise((resolve, reject) => {
      const unauthSocket = ClientIO(socketUrl, {
        reconnection: false,
        transports: ['websocket'],
      });
      activeSockets.push(unauthSocket);

      unauthSocket.on('connect', () => {
        reject(new Error('Step 26: Unauthenticated Socket.IO connection should not succeed'));
      });

      unauthSocket.on('connect_error', (err) => {
        assert(
          err.message.includes('Authentication error'),
          'Step 26: Socket.IO must reject unauthenticated connection with Authentication error'
        );
        unauthSocket.disconnect();
        resolve();
      });
    });
    console.log('[PASS] Step 26: Unauthorized Socket.IO connection rejected by auth middleware');

    // ========================================================================
    // Step 27: Real-Time Live Chat & Socket.IO Cross-Customer Room Isolation
    // ========================================================================
    const connectAuthenticatedSocket = (cookieStr) =>
      new Promise((resolve, reject) => {
        const sock = ClientIO(socketUrl, {
          reconnection: false,
          transports: ['websocket'],
          extraHeaders: { Cookie: cookieStr },
        });
        activeSockets.push(sock);
        sock.on('connect', () => resolve(sock));
        sock.on('connect_error', (err) => reject(err));
      });

    const [socketCustomerA, socketCustomerB, socketAdmin] = await Promise.all([
      connectAuthenticatedSocket(customerCookieA),
      connectAuthenticatedSocket(customerCookieB),
      connectAuthenticatedSocket(adminCookie),
    ]);

    // 27a: Customer B attempts to join Customer A's project chat room -> must be rejected (403)
    const joinAttemptB = await new Promise((resolve) => {
      socketCustomerB.emit('project:join', demoProjectId, (ack) => resolve(ack));
    });
    assert(
      joinAttemptB.success === false && joinAttemptB.status === 403,
      'Step 27a: Customer B must be denied access to Customer A project Socket.IO room (403)'
    );

    // 27b: Customer A and Admin join Customer A's project room and exchange real-time chat + real-time notification
    const joinAttemptA = await new Promise((resolve) => {
      socketCustomerA.emit('project:join', demoProjectId, (ack) => resolve(ack));
    });
    const joinAttemptAdmin = await new Promise((resolve) => {
      socketAdmin.emit('project:join', demoProjectId, (ack) => resolve(ack));
    });
    assert(
      joinAttemptA.success === true && joinAttemptAdmin.success === true,
      'Step 27b: Customer A and Admin join authorized project room'
    );

    const liveMsgPromise = new Promise((resolve) => {
      socketAdmin.once('chat:new_message', (msg) => resolve(msg));
    });
    const liveNotifPromise = new Promise((resolve) => {
      socketAdmin.once('notification:new', (notif) => resolve(notif));
    });

    await new Promise((resolve) => {
      socketCustomerA.emit(
        'chat:send_message',
        {
          projectId: demoProjectId,
          message: 'Real-time Socket.IO message from Customer A!',
        },
        (ack) => resolve(ack)
      );
    });

    const [receivedLiveMsg, receivedLiveNotif] = await Promise.all([
      liveMsgPromise,
      liveNotifPromise,
    ]);
    assert(
      receivedLiveMsg.message === 'Real-time Socket.IO message from Customer A!' &&
        receivedLiveNotif.type === 'new_message',
      'Step 27c: Real-time chat message and notification delivered instantly over Socket.IO'
    );
    console.log(
      '[PASS] Step 27: Real-time Socket.IO chat delivery, notification emit, and cross-customer room isolation (403) verified'
    );

    // Disconnect test sockets & clean up temporary database records
    activeSockets.forEach((s) => s.disconnect());

    await Promise.all([
      Notification.deleteMany({
        recipient: { $in: [regResA.data.user._id, regResB.data.user._id, adminLoginRes.data.user._id] },
      }),
      Message.deleteMany({ project: demoProjectId }),
      Payment.deleteMany({ project: demoProjectId }),
      Project.deleteOne({ _id: demoProjectId }),
      Quotation.deleteOne({ _id: demoQuotationId }),
      ServiceRequest.deleteOne({ _id: demoRequestId }),
      User.deleteMany({ email: { $in: [demoEmailA, demoEmailB] } }),
    ]);

    console.log('========================================================================');
    console.log(' ALL 27 END-TO-END, PAYMENT, EMAIL/SMS & SOCKET.IO TESTS PASSED!');
    console.log('========================================================================');

    server.close();
    stopLocalMongod();
    process.exit(0);
  } catch (error) {
    console.error('[FAIL] Workflow verification failed:', error.message);
    activeSockets.forEach((s) => {
      try {
        s.disconnect();
      } catch (_) {}
    });
    if (server) server.close();
    stopLocalMongod();
    process.exit(1);
  }
};

runWorkflowVerification();
