const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF, JPG, PNG, and DOCX reference files are permitted.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB per file
    files: 5,
  },
});

const processUploadedFiles = async (files = []) => {
  const processed = [];

  for (const file of files) {
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(file.path, 'dynamic_it/requests');
        if (cloudResult && cloudResult.url) {
          processed.push({
            originalName: file.originalname,
            fileName: file.filename,
            fileUrl: cloudResult.url,
            mimeType: file.mimetype,
            size: file.size,
            storageType: 'cloudinary',
          });
          fs.unlink(file.path, () => {});
          continue;
        }
      } catch (err) {
        console.warn('[Upload] Cloudinary upload failed, falling back to local storage:', err.message);
      }
    }

    processed.push({
      originalName: file.originalname,
      fileName: file.filename,
      fileUrl: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      storageType: 'local',
    });
  }

  return processed;
};

module.exports = {
  upload,
  processUploadedFiles,
};
