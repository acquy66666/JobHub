import multer from 'multer';

const MB5 = 5 * 1024 * 1024;

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MB5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'), { status: 400 }) as unknown as null, false);
  },
});

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MB5 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(Object.assign(new Error('Chỉ chấp nhận file PDF'), { status: 400 }) as unknown as null, false);
  },
});
