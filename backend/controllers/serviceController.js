const mongoose = require('mongoose');
const Service = require('../models/Service');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { category, featured, search, includeInactive } = req.query;
    const filter = {};

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ isFeatured: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by slug or ID
// @route   GET /api/services/:slug
// @access  Public
const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let service = await Service.findOne({ slug: slug.toLowerCase() });

    if (!service && mongoose.Types.ObjectId.isValid(slug)) {
      service = await Service.findById(slug);
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Requested service was not found.',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      shortDescription,
      description,
      features,
      deliverables,
      startingPrice,
      pricingType,
      estimatedTimeline,
      image,
      iconName,
      isActive,
      isFeatured,
    } = req.body;

    if (!title || !category || !shortDescription || !description || startingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, short description, full description, and starting price.',
      });
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);
    const existingSlug = await Service.findOne({ slug: finalSlug });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: `A service with slug '${finalSlug}' already exists.`,
      });
    }

    const parsedFeatures = Array.isArray(features)
      ? features
      : typeof features === 'string'
      ? features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean)
      : [];

    const parsedDeliverables = Array.isArray(deliverables)
      ? deliverables
      : typeof deliverables === 'string'
      ? deliverables
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean)
      : [];

    const service = await Service.create({
      title: title.trim(),
      slug: finalSlug,
      category: category.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      features: parsedFeatures,
      deliverables: parsedDeliverables,
      startingPrice: Number(startingPrice),
      pricingType: pricingType || 'fixed_starting',
      estimatedTimeline: estimatedTimeline || '7 - 15 Days',
      image: image || '',
      iconName: iconName || 'Globe',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    const {
      title,
      slug,
      category,
      shortDescription,
      description,
      features,
      deliverables,
      startingPrice,
      pricingType,
      estimatedTimeline,
      image,
      iconName,
      isActive,
      isFeatured,
    } = req.body;

    if (title !== undefined) service.title = title.trim();
    if (slug !== undefined) service.slug = slugify(slug);
    if (category !== undefined) service.category = category.trim();
    if (shortDescription !== undefined) service.shortDescription = shortDescription.trim();
    if (description !== undefined) service.description = description.trim();
    if (startingPrice !== undefined) service.startingPrice = Number(startingPrice);
    if (pricingType !== undefined) service.pricingType = pricingType;
    if (estimatedTimeline !== undefined) service.estimatedTimeline = estimatedTimeline;
    if (image !== undefined) service.image = image;
    if (iconName !== undefined) service.iconName = iconName;
    if (isActive !== undefined) service.isActive = Boolean(isActive);
    if (isFeatured !== undefined) service.isFeatured = Boolean(isFeatured);

    if (features !== undefined) {
      service.features = Array.isArray(features)
        ? features
        : typeof features === 'string'
        ? features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean)
        : [];
    }

    if (deliverables !== undefined) {
      service.deliverables = Array.isArray(deliverables)
        ? deliverables
        : typeof deliverables === 'string'
        ? deliverables
            .split('\n')
            .map((d) => d.trim())
            .filter(Boolean)
        : [];
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    if (req.query.permanent === 'true') {
      await service.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Service permanently deleted.',
      });
    }

    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service deactivated successfully.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
};
