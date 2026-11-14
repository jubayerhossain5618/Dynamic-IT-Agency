/**
 * Automated End-to-End Verification Script for Section 11:
 * REQUIRED LIVE DEMONSTRATION (Steps 1 through 16)
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, stopLocalMongod } = require('../config/db');
const { app } = require('../server');
const ensureInitialData = require('./ensureSeed');
const User = require('../models/User');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Verification Failed: ${message}`);
  }
};

const runWorkflowVerification = async () => {
  let server = null;
  try {
    console.log('==============================================================');
    console.log(' DYNAMIC IT — 16-STEP LIVE DEMONSTRATION WORKFLOW VERIFICATION');
    console.log('==============================================================');

    await connectDB();
    await ensureInitialData(false);

    server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/api`;

    const requestJson = async (endpoint, options = {}) => {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // Step 1: Check public website health API
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
      `[PASS] Step 2: Retrieved ${servicesRes.data.services.length} services from MongoDB (found '${websiteService.title}')`
    );

    // Step 3: Register a new customer
    const demoEmail = `demo.student.${Date.now()}@university.edu.bd`;
    const regRes = await requestJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Arafat Hossain (Viva Demo)',
        email: demoEmail,
        phone: '+880 1700-998877',
        company: 'Hossain Enterprise BD',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    assert(
      regRes.status === 201 && regRes.data.user.role === 'customer',
      'Step 3: Customer registration must succeed and assign customer role'
    );
    console.log(`[PASS] Step 3: Registered new customer (${demoEmail})`);

    // Step 4: Log in as that customer
    const custLoginRes = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: demoEmail,
        password: 'Password123',
      }),
    });
    assert(
      custLoginRes.status === 200 && Boolean(custLoginRes.data.token),
      'Step 4: Customer login must return JWT token'
    );
    const customerToken = custLoginRes.data.token;
    console.log('[PASS] Step 4: Logged in as newly registered customer');

    // Step 5: Submit a Website Development service request
    const createReqRes = await requestJson('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
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

    // Step 6: Log in as Admin in separate session
    const adminLoginRes = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@dynamicit.com',
        password: 'Password123',
      }),
    });
    assert(
      adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'admin',
      'Step 6: Admin login must succeed'
    );
    const adminToken = adminLoginRes.data.token;
    console.log('[PASS] Step 6: Logged in as Administrator (admin@dynamicit.com)');

    // Step 7: Admin reviews the customer's request
    const reviewReqRes = await requestJson(`/requests/${demoRequestId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'under_review',
        adminNotes: 'Reviewed requirements during live viva demonstration. Preparing custom quotation.',
      }),
    });
    assert(
      reviewReqRes.status === 200 && reviewReqRes.data.request.status === 'under_review',
      'Step 7: Admin updates request status to under_review'
    );
    console.log('[PASS] Step 7: Admin reviewed customer service request');

    // Step 8: Admin creates a quotation (Price: ৳15,000, Estimated delivery: 15 days, Scope: Five-page responsive business website)
    const createQuoRes = await requestJson('/quotations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        requestId: demoRequestId,
        amount: 15000,
        estimatedDays: 15,
        scope: 'Five-page responsive business website',
        terms: '50% advance payment upon quotation acceptance, 50% upon project completion.',
      }),
    });
    assert(
      createQuoRes.status === 201 &&
        createQuoRes.data.quotation.amount === 15000 &&
        createQuoRes.data.quotation.estimatedDays === 15,
      'Step 8: Admin creates quotation for ৳15,000 and 15 days'
    );
    const demoQuotationId = createQuoRes.data.quotation._id;
    console.log(
      `[PASS] Step 8: Admin created quotation (৳15,000, 15 days, Scope: "Five-page responsive business website")`
    );

    // Step 9 & 10: Customer views and accepts the quotation
    const myQuotationsRes = await requestJson('/quotations/my', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      myQuotationsRes.status === 200 &&
        myQuotationsRes.data.quotations.some((q) => q._id === demoQuotationId),
      'Step 9: Customer sees quotation in My Quotations'
    );

    const acceptQuoRes = await requestJson(`/quotations/${demoQuotationId}/respond`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        status: 'accepted',
        customerNote: 'Quotation terms and ৳15,000 budget approved.',
      }),
    });
    assert(
      acceptQuoRes.status === 200 && acceptQuoRes.data.quotation.status === 'accepted',
      'Step 10: Customer accepts quotation'
    );
    console.log('[PASS] Step 9 & 10: Customer viewed and accepted the quotation');

    // Step 11: Admin creates a project from the accepted quotation
    const createProjRes = await requestJson('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
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

    // Also verify duplicate project creation is prevented (Security Rule 9)
    const duplicateProjRes = await requestJson('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        quotationId: demoQuotationId,
      }),
    });
    assert(
      duplicateProjRes.status === 400,
      'Security Rule 9: Duplicate project creation from same quotation must be rejected'
    );
    console.log(
      `[PASS] Step 11: Admin created project (ID: ${demoProjectId}) & duplicate guard verified`
    );

    // Step 12: Admin updates project progress to 40%, then 65%
    const prog40Res = await requestJson(`/projects/${demoProjectId}/progress`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ progress: 40 }),
    });
    assert(
      prog40Res.status === 200 && prog40Res.data.project.progress === 40,
      'Step 12a: Progress updated to 40%'
    );

    const prog65Res = await requestJson(`/projects/${demoProjectId}/progress`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ progress: 65 }),
    });
    assert(
      prog65Res.status === 200 && prog65Res.data.project.progress === 65,
      'Step 12b: Progress updated to 65%'
    );
    console.log('[PASS] Step 12: Admin updated project progress to 40%, then 65%');

    // Step 13: Customer refreshes dashboard / projects and sees updated 65% progress
    const custProjRes = await requestJson(`/projects/${demoProjectId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custProjRes.status === 200 && custProjRes.data.project.progress === 65,
      'Step 13: Customer sees updated 65% progress'
    );
    console.log('[PASS] Step 13: Customer verified 65% progress on project tracker');

    // Step 14: Admin records a partial payment (e.g., ৳7,500 out of ৳15,000)
    const paymentRes = await requestJson('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        projectId: demoProjectId,
        paidAmount: 7500,
        paymentMethod: 'bKash',
        transactionReference: 'BKASH-DEMO-7500',
        notes: '50% advance payment recorded during live demo.',
      }),
    });
    assert(
      paymentRes.status === 201 &&
        paymentRes.data.payment.paidAmount === 7500 &&
        paymentRes.data.payment.remainingAmount === 7500 &&
        paymentRes.data.payment.status === 'partial',
      'Step 14: Admin records partial payment of ৳7,500'
    );
    console.log('[PASS] Step 14: Admin recorded partial payment of ৳7,500 (Remaining: ৳7,500)');

    // Step 15: Customer sees payment information and remaining balance
    const custPayRes = await requestJson('/payments/my', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custPayRes.status === 200 &&
        custPayRes.data.summary.totalPaid === 7500 &&
        custPayRes.data.summary.totalRemaining === 7500,
      'Step 15: Customer views payment information and remaining balance'
    );
    console.log('[PASS] Step 15: Customer verified payment history and ৳7,500 remaining balance');

    // Step 16: Admin and customer exchange a project-related message
    const custMsgRes = await requestJson('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        projectId: demoProjectId,
        message: 'Hello Admin, I have sent the ৳7,500 advance via bKash and checked the 65% progress update!',
      }),
    });
    assert(custMsgRes.status === 201, 'Step 16a: Customer sends project message');

    const adminMsgRes = await requestJson('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        projectId: demoProjectId,
        message: 'Thank you Arafat! We have recorded your payment and are now finalizing the remaining pages.',
      }),
    });
    assert(adminMsgRes.status === 201, 'Step 16b: Admin replies to project message');

    const threadRes = await requestJson(`/messages/${demoProjectId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      threadRes.status === 200 && threadRes.data.messages.length === 2,
      'Step 16c: Both project messages persisted and retrieved from MongoDB'
    );
    console.log('[PASS] Step 16: Customer and Admin exchanged project messages in MongoDB');

    // Clean up temporary demo customer records so sample database stays tidy
    const ServiceRequest = require('../models/ServiceRequest');
    const Quotation = require('../models/Quotation');
    const Project = require('../models/Project');
    const Payment = require('../models/Payment');
    const Message = require('../models/Message');

    await Promise.all([
      Message.deleteMany({ project: demoProjectId }),
      Payment.deleteMany({ project: demoProjectId }),
      Project.deleteOne({ _id: demoProjectId }),
      Quotation.deleteOne({ _id: demoQuotationId }),
      ServiceRequest.deleteOne({ _id: demoRequestId }),
      User.deleteOne({ email: demoEmail }),
    ]);

    console.log('==============================================================');
    console.log(' ALL 16 LIVE DEMONSTRATION STEPS PASSED SUCCESSFULLY!');
    console.log('==============================================================');

    server.close();
    stopLocalMongod();
    process.exit(0);
  } catch (error) {
    console.error('[FAIL] Workflow verification failed:', error.message);
    if (server) server.close();
    stopLocalMongod();
    process.exit(1);
  }
};

runWorkflowVerification();
