import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Uploads a video buffer to Cloudinary using upload_stream
 * Returns public_id and secure_url
 */
export const uploadVideoToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'watchtogether',
        chunk_size: 6000000, // 6MB chunks for large files
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Pipe the buffer into the stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a video from Cloudinary by public_id
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};
