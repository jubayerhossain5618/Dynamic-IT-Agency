const User = require('../models/User');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const ContactMessage = require('../models/ContactMessage');
const { SIX_CORE_SERVICES } = require('./seedData');

const ensureInitialData = async (forceReset = false) => {
  if (forceReset) {
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      ServiceRequest.deleteMany({}),
      Quotation.deleteMany({}),
      Project.deleteMany({}),
      Payment.deleteMany({}),
      Message.deleteMany({}),
      ContactMessage.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections cleared.');
  }

  // 1. Ensure the 6 core services exist
  const existingServicesCount = await Service.countDocuments();
  let servicesMap = {};

  if (existingServicesCount === 0) {
    const createdServices = await Service.insertMany(SIX_CORE_SERVICES);
    createdServices.forEach((s) => {
      servicesMap[s.slug] = s;
    });
    console.log(`[Seed] Inserted ${createdServices.length} digital agency services.`);
  } else {
    const allServices = await Service.find();
    allServices.forEach((s) => {
      servicesMap[s.slug] = s;
    });
  }

  // 2. Ensure default Admin account exists
  let admin = await User.findOne({ email: 'admin@dynamicit.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Dynamic IT Administrator',
      email: 'admin@dynamicit.com',
      phone: '+880 1711-000111',
      company: 'Dynamic IT Agency HQ',
      password: 'Password123',
      role: 'admin',
      isActive: true,
    });
    console.log('[Seed] Created default admin account: admin@dynamicit.com / Password123');
  }

  // 3. Ensure sample customers exist for rich demonstration
  let customer1 = await User.findOne({ email: 'rahim@technova.bd' });
  if (!customer1) {
    customer1 = await User.create({
      name: 'Tanvir Rahim',
      email: 'rahim@technova.bd',
      phone: '+880 1819-223344',
      company: 'TechNova Solutions Ltd.',
      password: 'Password123',
      role: 'customer',
      isActive: true,
    });
    console.log('[Seed] Created sample customer: rahim@technova.bd / Password123');
  }

  let customer2 = await User.findOne({ email: 'nusrat@greenleaf.com.bd' });
  if (!customer2) {
    customer2 = await User.create({
      name: 'Nusrat Jahan',
      email: 'nusrat@greenleaf.com.bd',
      phone: '+880 1912-556677',
      company: 'GreenLeaf Organics BD',
      password: 'Password123',
      role: 'customer',
      isActive: true,
    });
  }

  // 4. Ensure sample workflow records exist if database has no requests yet
  const requestCount = await ServiceRequest.countDocuments();
  if (requestCount === 0 && servicesMap['website-development']) {
    const webService = servicesMap['website-development'];
    const metaService = servicesMap['meta-ads-and-digital-marketing'];
    const seoService = servicesMap['seo-services'];

    // Request 1: Accepted & Active Project with partial payment
    const req1 = await ServiceRequest.create({
      customer: customer1._id,
      service: webService._id,
      projectTitle: 'TechNova Corporate Website & Client Portal',
      description:
        'We need a modern 5-page responsive business website with service showcase, case studies, and client inquiry management.',
      requirements:
        'Clean modern corporate design, mobile-first layout, fast page load speed, SEO-friendly structure, and admin dashboard.',
      budget: 18000,
      preferredDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'project_created',
      adminNotes: 'High priority corporate client. Quotation accepted and project initialized.',
    });

    const quo1 = await Quotation.create({
      request: req1._id,
      customer: customer1._id,
      createdBy: admin._id,
      amount: 16500,
      currency: 'BDT',
      estimatedDays: 15,
      scope:
        'Complete 5-page responsive corporate website (Home, About, Services, Portfolio, Contact) with admin inquiry panel and SEO configuration.',
      terms:
        '50% advance payment upon quotation acceptance, remaining 50% upon final staging review and deployment.',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'accepted',
      respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const proj1 = await Project.create({
      quotation: quo1._id,
      request: req1._id,
      customer: customer1._id,
      projectTitle: 'TechNova Corporate Website & Client Portal',
      description: quo1.scope,
      totalAmount: 16500,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      progress: 65,
      status: 'in_progress',
      milestones: [
        {
          title: 'UI/UX Wireframes & Brand Design System',
          description: 'Figma layout approval and responsive design tokens.',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'completed',
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Frontend & Backend API Integration',
          description: 'Develop responsive React pages and Express/MongoDB endpoints.',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'in_progress',
        },
        {
          title: 'QA Testing, SEO Setup & Live Deployment',
          description: 'Final performance optimization and production deployment.',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          status: 'pending',
        },
      ],
    });

    await Payment.create({
      project: proj1._id,
      customer: customer1._id,
      totalAmount: 16500,
      paidAmount: 8500,
      remainingAmount: 8000,
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      transactionReference: 'TRX-CITY-904821',
      status: 'partial',
      notes: 'Advance installment received via City Bank transfer.',
    });

    await Message.create([
      {
        sender: admin._id,
        receiver: customer1._id,
        project: proj1._id,
        request: req1._id,
        message:
          'Welcome to Dynamic IT! We have completed the UI wireframes and reached 65% on your corporate portal build.',
        isRead: true,
      },
      {
        sender: customer1._id,
        receiver: admin._id,
        project: proj1._id,
        request: req1._id,
        message:
          'Thank you! The progress looks great. Looking forward to reviewing the staging link this week.',
        isRead: false,
      },
    ]);

    // Request 2: Pending Quotation waiting for Customer 1's response
    if (seoService) {
      const req2 = await ServiceRequest.create({
        customer: customer1._id,
        service: seoService._id,
        projectTitle: 'Technical SEO & Local Search Ranking Campaign',
        description:
          'Optimize our new corporate domain for software consultancy keywords in Dhaka and Bangladesh.',
        requirements: 'Technical audit, Search Console setup, and 20 target keywords.',
        budget: 10000,
        preferredDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'quoted',
        adminNotes: 'Sent monthly SEO starter quotation.',
      });

      await Quotation.create({
        request: req2._id,
        customer: customer1._id,
        createdBy: admin._id,
        amount: 9500,
        currency: 'BDT',
        estimatedDays: 30,
        scope:
          'Complete Technical SEO Audit, Core Web Vitals optimization, on-page meta schema setup for 10 pages, and Google Business Profile optimization.',
        terms: '100% upfront for 30-day optimization sprint.',
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'pending',
      });
    }

    // Request 3: Newly submitted pending request from Customer 2
    if (metaService) {
      await ServiceRequest.create({
        customer: customer2._id,
        service: metaService._id,
        projectTitle: 'Eid Collection Meta Ads & Retargeting Funnel',
        description:
          'Need high-converting Facebook and Instagram ad campaigns for our organic skincare and food gift boxes.',
        requirements: 'Pixel setup, 6 carousel ad designs, and conversion campaign management.',
        budget: 12000,
        preferredDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'pending',
      });
    }

    await ContactMessage.create({
      name: 'Farhan Ahmed',
      email: 'farhan@apexretail.com',
      phone: '+880 1715-889900',
      subject: 'Inquiry about E-Commerce Website + Meta Ads Package',
      message:
        'Hello Dynamic IT team, we are planning to launch our retail brand online next month. Can we schedule a consultation call?',
      status: 'new',
    });

    console.log('[Seed] Sample requests, quotations, active project, payment, and messages created.');
  }
};

module.exports = ensureInitialData;
