import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { tripId } = req.params;
    const tripDir = path.join(uploadsDir, `trip-${tripId}`);
    
    if (!fs.existsSync(tripDir)) {
      fs.mkdirSync(tripDir, { recursive: true });
    }
    
    cb(null, tripDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const type = file.fieldname; // 'pre-tow', 'post-tow', 'id-photo', 'signature'
    cb(null, `${type}-${timestamp}${ext}`);
  }
});

// File filter for security
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

export const getFileUrl = (tripId: string, filename: string): string => {
  return `/api/files/trip-${tripId}/${filename}`;
};

export const getFilePath = (tripId: string, filename: string): string => {
  return path.join(uploadsDir, `trip-${tripId}`, filename);
};