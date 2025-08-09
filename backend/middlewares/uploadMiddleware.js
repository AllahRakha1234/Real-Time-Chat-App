import multer from "multer";

// Use memory storage so we can upload buffer directly to Cloudinary
const storage = multer.memoryStorage();

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
];

function fileFilter(_req, file, cb) {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB limit

export const uploadSingleImage = upload.single("pic");
