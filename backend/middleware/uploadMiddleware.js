const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
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

/**
 * Inspects the first 8 bytes (magic bytes) of an uploaded file on disk
 * to verify its actual binary signature matches the declared extension/MIME type.
 */
const verifyFileMagicBytes = (filePath, ext) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    const bytesRead = fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // PDF: %PDF (25 50 44 46)
    if (ext === '.pdf') {
      return (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      );
    }

    // JPEG: FF D8 FF
    if (ext === '.jpg' || ext === '.jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (ext === '.png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    }

    // DOCX (ZIP container): PK\x03\x04 (50 4B 03 04)
    if (ext === '.docx') {
      return (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04
      );
    }

    return false;
  } catch (_err) {
    return false;
  }
};

const safeUnlink = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomId = crypto.randomBytes(12).toString('hex');
    cb(null, `doc-${Date.now()}-${randomId}${ext}`);
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
  if (!files || files.length === 0) return [];

  // Prevent silent fallback to ephemeral local storage in production unless explicitly permitted
  if (
    process.env.NODE_ENV === 'production' &&
    !isCloudinaryConfigured() &&
    process.env.ALLOW_LOCAL_UPLOADS_IN_PROD !== 'true'
  ) {
    files.forEach((f) => safeUnlink(f.path));
    const err = new Error(
      'File storage (Cloudinary) is not configured for production uploads.'
    );
    err.statusCode = 503;
    throw err;
  }

  const processed = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isContentValid = verifyFileMagicBytes(file.path, ext);

    if (!isContentValid) {
      files.forEach((f) => safeUnlink(f.path));
      const err = new Error(
        `File '${file.originalname}' failed binary content verification. Ensure the file is a genuine ${ext.toUpperCase()} document.`
      );
      err.statusCode = 400;
      throw err;
    }

    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(file.path, 'dynamic_it/requests');
        if (cloudResult && cloudResult.url) {
          processed.push({
            originalName: path.basename(file.originalname),
            fileName: file.filename,
            fileUrl: cloudResult.url,
            mimeType: file.mimetype,
            size: file.size,
            storageType: 'cloudinary',
          });
          safeUnlink(file.path);
          continue;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'production') {
          files.forEach((f) => safeUnlink(f.path));
          throw new Error(`Cloud file upload failed: ${err.message}`);
        }
        console.warn('[Upload] Cloudinary upload failed in dev, using local protected storage:', err.message);
      }
    }

    processed.push({
      originalName: path.basename(file.originalname),
      fileName: file.filename,
      fileUrl: `/api/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      storageType: 'local',
    });
  }

  return processed;
};

module.exports = {
  upload,
  uploadDir,
  processUploadedFiles,
  safeUnlink,
};
