const SIX_CORE_SERVICES = [
  {
    title: 'Meta Ads and Digital Marketing',
    slug: 'meta-ads-and-digital-marketing',
    category: 'Digital Marketing',
    shortDescription:
      'Data-driven Facebook, Instagram, and omnichannel paid ad campaigns engineered to maximize ROAS and lead generation.',
    description:
      'Our Meta Ads and Digital Marketing service helps growing businesses acquire high-intent customers through precision audience targeting, conversion-optimized ad creatives, Meta Pixel & Conversions API setup, and continuous A/B campaign optimization. We provide transparent weekly reporting and measurable ROI tracking.',
    features: [
      'Meta Pixel & Server-Side Conversions API Configuration',
      'Custom & Lookalike Audience Architecture',
      'Ad Copywriting & High-Converting Visual Creatives',
      'A/B Split Testing & Daily Bid Optimization',
      'Retargeting Funnel Setup for Warm Prospects',
      'Comprehensive Weekly ROI & Conversion Analytics Report',
    ],
    deliverables: [
      'Complete Ad Account Audit & Campaign Blueprint',
      '6–10 Ad Creative Variations & Copy Sets',
      'Live Conversion Tracking Dashboard',
      'Bi-Weekly Performance Review & Scaling Roadmap',
    ],
    startingPrice: 8500,
    pricingType: 'monthly',
    estimatedTimeline: 'Ongoing / 30-Day Cycle',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Megaphone',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Website Development',
    slug: 'website-development',
    category: 'Web Engineering',
    shortDescription:
      'Custom, responsive, full-stack business websites and web applications built with modern React, Node.js, and scalable databases.',
    description:
      'From corporate websites to custom web portals and e-commerce platforms, Dynamic IT engineers fast, secure, and mobile-responsive web solutions. Every website is crafted with clean architecture, SEO-ready markup, intuitive content management, and strong security standards tailored to your business workflow.',
    features: [
      'Custom Responsive UI/UX Across Mobile, Tablet & Desktop',
      'Full-Stack Architecture (React, Node.js, Express, MongoDB)',
      'Admin Dashboard & Dynamic Content Management',
      'Fast Core Web Vitals & Performance Optimization',
      'SSL Security, Input Validation & Role-Based Access',
      'Contact Forms, Inquiry Tracking & Third-Party Integrations',
    ],
    deliverables: [
      'Complete Responsive Multi-Page Website or Web App',
      'Admin Control Panel & Documentation',
      'Production Deployment & Server Configuration',
      '30 Days Post-Launch Technical Support',
    ],
    startingPrice: 15000,
    pricingType: 'fixed_starting',
    estimatedTimeline: '12 - 20 Days',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Code2',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Landing Page Design',
    slug: 'landing-page-design',
    category: 'UI/UX & Web Design',
    shortDescription:
      'High-converting, persuasive single-page promotional and product launch websites designed to turn visitors into customers.',
    description:
      'Launch new products, courses, or marketing campaigns with a conversion-focused landing page. We combine persuasive copywriting hierarchy, fast load speeds, clear call-to-action sections, lead capture forms, and analytics tracking so every advertising click has the highest chance of converting.',
    features: [
      'Conversion-Focused Hero & Value Proposition Layout',
      'Mobile-First Ultra-Fast Page Load Architecture',
      'Interactive Lead Capture & WhatsApp/Call Integration',
      'Social Proof, Testimonials & FAQ Accordions',
      'Analytics & Tracking Pixel Integration',
      'Cross-Browser Compatibility & SEO Meta Tags',
    ],
    deliverables: [
      'Custom Designed & Coded Responsive Landing Page',
      'Lead Form Notification & Database Storage',
      'Speed Optimization Report (90+ Lighthouse Score)',
    ],
    startingPrice: 6500,
    pricingType: 'fixed_starting',
    estimatedTimeline: '5 - 7 Days',
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Layout',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Domain and Hosting Assistance',
    slug: 'domain-and-hosting-assistance',
    category: 'Cloud & Infrastructure',
    shortDescription:
      'End-to-end domain registration, cloud VPS/shared hosting setup, SSL certificates, business email, and automated backups.',
    description:
      'Eliminate technical headaches with our managed Domain and Hosting Assistance. We help you choose and register the right domain name, configure high-uptime SSD cloud hosting, install free & commercial SSL certificates, set up custom professional business emails, and secure your website against downtime.',
    features: [
      'Domain Name Registration & DNS Zone Management',
      'High-Speed NVMe SSD Hosting & Cloud Server Setup',
      'Free Let’s Encrypt & Commercial SSL Installation',
      'Custom Business Email Configuration (e.g., info@yourcompany.com)',
      'Website Migration with Zero Scheduled Downtime',
      'Automated Weekly Backups & Uptime Monitoring',
    ],
    deliverables: [
      'Configured Domain & Live Production Hosting Environment',
      'Active HTTPS/SSL Security Certificate',
      'Professional Business Email Accounts & Access Guide',
    ],
    startingPrice: 3500,
    pricingType: 'fixed_starting',
    estimatedTimeline: '1 - 3 Days',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Server',
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Graphic Design and Branding',
    slug: 'graphic-design-and-branding',
    category: 'Creative & Branding',
    shortDescription:
      'Memorable brand identity systems, logo design, social media kits, and marketing collateral that set your business apart.',
    description:
      'Build a cohesive, trustworthy brand identity that resonates with your target audience. Our creative team designs distinctive logos, typography and color guidelines, social media post templates, business stationery, and digital brochures in full print-ready and web-optimized formats.',
    features: [
      'Original Logo Design with Multiple Concept Revisions',
      'Complete Brand Style Guide (Color Palette & Typography)',
      'Social Media Profile, Cover & Post Template Kit',
      'Business Card, Letterhead & Corporate Stationery Design',
      'Marketing Banners, Pitch Decks & Digital Brochures',
      'Full Source Files (AI, EPS, PDF, SVG, High-Res PNG)',
    ],
    deliverables: [
      'Master Logo Package in Vector & Raster Formats',
      'Brand Identity Guidelines PDF',
      '12 Editable Social Media Marketing Templates',
    ],
    startingPrice: 5000,
    pricingType: 'fixed_starting',
    estimatedTimeline: '5 - 10 Days',
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Palette',
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'SEO Services',
    slug: 'seo-services',
    category: 'Search Marketing',
    shortDescription:
      'Technical SEO, on-page optimization, keyword strategy, and local search ranking to drive sustainable organic traffic.',
    description:
      'Rank higher on Google and capture organic search traffic from customers actively looking for your products or services. Our SEO specialists perform deep technical audits, competitor keyword research, on-page content & schema optimization, Google Business Profile enhancement, and authority building.',
    features: [
      'In-Depth Technical SEO & Core Web Vitals Audit',
      'High-Intent Keyword Research & Competitor Gap Analysis',
      'On-Page Meta Tags, Headings & Internal Linking Optimization',
      'Schema.org Structured Data & XML Sitemap Configuration',
      'Local SEO & Google Business Profile Optimization',
      'Monthly Keyword Ranking & Organic Traffic Growth Reports',
    ],
    deliverables: [
      'Comprehensive Technical SEO Audit & Fix Report',
      'Target Keyword Mapping Spreadsheet',
      'Optimized On-Page Metadata & Search Console Setup',
    ],
    startingPrice: 9000,
    pricingType: 'monthly',
    estimatedTimeline: '30 - 90 Days Growth Plan',
    image:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Search',
    isActive: true,
    isFeatured: true,
  },
];

module.exports = {
  SIX_CORE_SERVICES,
};
