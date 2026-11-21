const nodemailer = require('nodemailer');

const recentEmailsLog = [];
const MAX_LOG_SIZE = 100;

const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback structured JSON transport when SMTP credentials are not yet configured
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const buildEmailHtml = ({ heading, greeting, bodyParagraphs = [], ctaLabel, ctaUrl, footerNote }) => {
  const paragraphsHtml = bodyParagraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;color:#20242C;font-size:14px;line-height:1.6;">${p}</p>`
    )
    .join('');

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<div style="margin:24px 0;">
          <a href="${ctaUrl}" style="display:inline-block;background-color:#2563EB;color:#FFFFFF;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;">${ctaLabel}</a>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:24px;background-color:#F8F7F4;font-family:'Inter',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:#101828;padding:20px 28px;color:#FFFFFF;">
          <strong style="font-size:18px;letter-spacing:-0.02em;">Dynamic <span style="color:#60A5FA;">IT</span></strong>
          <span style="display:block;font-size:11px;color:#94A3B8;margin-top:2px;">Digital Agency Service Management & Project Tracking</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <h2 style="margin:0 0 16px 0;color:#101828;font-size:20px;">${heading}</h2>
          <p style="margin:0 0 14px 0;color:#20242C;font-size:14px;font-weight:600;">${greeting}</p>
          ${paragraphsHtml}
          ${ctaHtml}
          <p style="margin:24px 0 0 0;padding-top:16px;border-top:1px solid #F1F5F9;color:#667085;font-size:12px;">
            ${footerNote || 'Thank you for working with Dynamic IT.'}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendEmail = async ({
  to,
  subject,
  heading,
  greeting,
  bodyParagraphs = [],
  ctaLabel,
  ctaUrl,
  eventType = 'general',
  respectPreference = true,
  recipientUser = null,
  simulateFailure = false,
}) => {
  try {
    if (!to || !subject) {
      return { sent: false, error: 'Recipient email and subject are required.' };
    }

    if (
      respectPreference &&
      recipientUser &&
      recipientUser.notificationPreferences &&
      recipientUser.notificationPreferences.email === false
    ) {
      return {
        sent: false,
        skipped: true,
        reason: 'Recipient opted out of email notifications.',
      };
    }

    if (simulateFailure || process.env.EMAIL_SIMULATE_FAILURE === 'true') {
      throw new Error('Simulated SMTP transport delivery failure.');
    }

    const transporter = createTransporter();
    const fromAddress =
      process.env.SMTP_FROM || '"Dynamic IT Studio" <no-reply@dynamicit.com>';
    const html = buildEmailHtml({
      heading: heading || subject,
      greeting: greeting || 'Hello,',
      bodyParagraphs,
      ctaLabel,
      ctaUrl,
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    const record = {
      to,
      subject,
      eventType,
      mode: isSmtpConfigured() ? 'smtp' : 'sandbox_json_transport',
      messageId: info.messageId,
      sentAt: new Date().toISOString(),
      status: 'delivered',
    };

    recentEmailsLog.unshift(record);
    if (recentEmailsLog.length > MAX_LOG_SIZE) recentEmailsLog.pop();

    return { sent: true, ...record };
  } catch (error) {
    const failRecord = {
      to,
      subject,
      eventType,
      mode: isSmtpConfigured() ? 'smtp' : 'sandbox_json_transport',
      error: error.message,
      sentAt: new Date().toISOString(),
      status: 'failed',
    };
    recentEmailsLog.unshift(failRecord);
    if (recentEmailsLog.length > MAX_LOG_SIZE) recentEmailsLog.pop();

    console.warn(`[EmailService] Delivery failed for '${eventType}' to ${to}: ${error.message}`);
    return { sent: false, error: error.message };
  }
};

// 10 Domain Event Email Helpers
const sendRegistrationEmail = (user, verificationUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Dynamic IT — Your Client Portal Account is Ready',
    heading: 'Welcome to Dynamic IT',
    greeting: `Hello ${user.name},`,
    bodyParagraphs: [
      'Your customer account on the Dynamic IT Digital Agency Platform has been created.',
      'You can now submit service requests, review custom quotations, track project milestones, and view payment records inside your client workspace.',
    ],
    ctaLabel: verificationUrl ? 'Verify Email Address' : 'Open Client Portal',
    ctaUrl: verificationUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/dashboard`,
    eventType: 'customer_registration',
    respectPreference: false,
  });

const sendVerificationEmail = (user, verificationToken) => {
  const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Dynamic IT Email Address',
    heading: 'Verify Your Email Address',
    greeting: `Hello ${user.name},`,
    bodyParagraphs: [
      `Please verify your email address using token: <strong>${verificationToken}</strong>`,
    ],
    ctaLabel: 'Verify Email in Portal',
    ctaUrl: `${clientBase}/login?verifyToken=${verificationToken}`,
    eventType: 'email_verification',
    respectPreference: false,
  });
};

const sendPasswordResetEmail = (user, resetToken) => {
  const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  return sendEmail({
    to: user.email,
    subject: 'Dynamic IT — Password Reset Instructions',
    heading: 'Password Reset Request',
    greeting: `Hello ${user.name},`,
    bodyParagraphs: [
      'We received a request to reset the password for your Dynamic IT account.',
      `Your one-time password reset token is: <strong>${resetToken}</strong> (valid for 30 minutes).`,
    ],
    ctaLabel: 'Reset Password',
    ctaUrl: `${clientBase}/login?resetToken=${resetToken}`,
    eventType: 'password_reset',
    respectPreference: false,
  });
};

const sendNewRequestEmail = (customer, serviceRequest, serviceTitle) =>
  sendEmail({
    to: customer.email,
    recipientUser: customer,
    subject: `Service Request Received: ${serviceRequest.projectTitle}`,
    heading: 'We Have Received Your Service Request',
    greeting: `Hello ${customer.name},`,
    bodyParagraphs: [
      `Your request for <strong>${serviceTitle}</strong> ("${serviceRequest.projectTitle}") has been logged in our system.`,
      'Our engineering and marketing team will review your requirements and issue a custom quotation shortly.',
    ],
    eventType: 'new_service_request',
  });

const sendNewQuotationEmail = (customer, quotation, projectTitle) =>
  sendEmail({
    to: customer.email,
    recipientUser: customer,
    subject: `New Custom Quotation Ready: ${projectTitle}`,
    heading: 'Your Custom Quotation is Ready for Review',
    greeting: `Hello ${customer.name},`,
    bodyParagraphs: [
      `Dynamic IT has prepared a custom quotation for <strong>${projectTitle}</strong>.`,
      `Proposed Investment: <strong>৳${Number(quotation.amount).toLocaleString()}</strong> • Estimated Delivery: <strong>${quotation.estimatedDays} Days</strong>.`,
      `Scope: ${quotation.scope}`,
    ],
    eventType: 'new_quotation',
  });

const sendQuotationResponseEmail = (adminEmail, customer, quotation, projectTitle) =>
  sendEmail({
    to: adminEmail,
    subject: `Quotation ${quotation.status.toUpperCase()}: ${projectTitle}`,
    heading: `Customer ${quotation.status === 'accepted' ? 'Accepted' : 'Declined'} Quotation`,
    greeting: 'Hello Administrator,',
    bodyParagraphs: [
      `Customer <strong>${customer.name}</strong> (${customer.email}) has <strong>${quotation.status}</strong> quotation #${quotation._id.toString().slice(-6).toUpperCase()} for "${projectTitle}".`,
      `Quoted Amount: ৳${Number(quotation.amount).toLocaleString()}.`,
    ],
    eventType: 'quotation_response',
  });

const sendProjectCreatedEmail = (customer, project) =>
  sendEmail({
    to: customer.email,
    recipientUser: customer,
    subject: `Project Workspace Initialized: ${project.projectTitle}`,
    heading: 'Your Project Workspace is Live',
    greeting: `Hello ${customer.name},`,
    bodyParagraphs: [
      `Your accepted quotation has been initialized into an active project: <strong>${project.projectTitle}</strong>.`,
      'You can now track real-time milestone progress, expected delivery dates, and project messages from your dashboard.',
    ],
    eventType: 'project_creation',
  });

const sendProjectProgressEmail = (customer, project) =>
  sendEmail({
    to: customer.email,
    recipientUser: customer,
    subject: `Project Progress Update (${project.progress}%): ${project.projectTitle}`,
    heading: `Project Progress Reached ${project.progress}%`,
    greeting: `Hello ${customer.name},`,
    bodyParagraphs: [
      `Your project <strong>${project.projectTitle}</strong> has been updated to <strong>${project.progress}%</strong> completion (Status: ${project.status.replace('_', ' ')}).`,
    ],
    eventType: 'project_progress_update',
  });

const sendPaymentConfirmationEmail = (customer, payment, projectTitle) =>
  sendEmail({
    to: customer.email,
    recipientUser: customer,
    subject: `Payment Confirmation (৳${Number(payment.paidAmount).toLocaleString()}): ${projectTitle}`,
    heading: 'Payment Installment Confirmed',
    greeting: `Hello ${customer.name},`,
    bodyParagraphs: [
      `We have recorded your payment of <strong>৳${Number(payment.paidAmount).toLocaleString()}</strong> via <strong>${payment.paymentMethod}</strong> for "${projectTitle}".`,
      `Transaction Reference: <strong>${payment.transactionReference || 'N/A'}</strong> • Remaining Balance: <strong>৳${Number(payment.remainingAmount).toLocaleString()}</strong>.`,
    ],
    eventType: 'payment_confirmation',
  });

const sendNewMessageEmail = (recipient, senderName, projectTitle, messageSnippet) =>
  sendEmail({
    to: recipient.email,
    recipientUser: recipient,
    subject: `New Project Message from ${senderName}: ${projectTitle}`,
    heading: 'New Message in Your Project Workspace',
    greeting: `Hello ${recipient.name},`,
    bodyParagraphs: [
      `<strong>${senderName}</strong> sent a message regarding "${projectTitle}":`,
      `<em>"${messageSnippet}"</em>`,
    ],
    eventType: 'new_customer_message',
  });

const getRecentDispatchedEmails = () => recentEmailsLog;

module.exports = {
  isSmtpConfigured,
  sendEmail,
  sendRegistrationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewRequestEmail,
  sendNewQuotationEmail,
  sendQuotationResponseEmail,
  sendProjectCreatedEmail,
  sendProjectProgressEmail,
  sendPaymentConfirmationEmail,
  sendNewMessageEmail,
  getRecentDispatchedEmails,
};
