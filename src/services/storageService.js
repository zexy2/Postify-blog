/**
 * Storage Service
 * 
 * Handles file uploads with Supabase Storage
 */

import { storage, requireSupabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'post-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const storageService = {
  /**
   * Upload an image
   */
  uploadImage: async (file, folder = 'posts') => {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const data = await storage.upload(BUCKET_NAME, filePath, file, {
      contentType: file.type,
    });

    // Get public URL
    const publicUrl = storage.getPublicUrl(BUCKET_NAME, filePath);

    return {
      path: filePath,
      url: publicUrl,
      ...data,
    };
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files, folder = 'posts') => {
    const uploads = await Promise.all(
      files.map((file) => storageService.uploadImage(file, folder))
    );
    return uploads;
  },

  /**
   * Delete an image
   */
  deleteImage: async (path) => {
    return storage.delete(BUCKET_NAME, [path]);
  },

  /**
   * Delete multiple images
   */
  deleteImages: async (paths) => {
    return storage.delete(BUCKET_NAME, paths);
  },

  /**
   * Get public URL for an image
   */
  getImageUrl: (path) => {
    return storage.getPublicUrl(BUCKET_NAME, path);
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file, userId) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload with upsert to replace existing
    await storage.upload('avatars', filePath, file, {
      contentType: file.type,
      upsert: true,
    });

    const publicUrl = storage.getPublicUrl('avatars', filePath);

    // Update user profile with new avatar
    const { error } = await requireSupabase()
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    if (error) throw error;

    return publicUrl;
  },

  /**
   * Get file info
   */
  getFileInfo: (file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    sizeFormatted: storageService.formatFileSize(file.size),
    isValid: ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE,
  }),

  /**
   * Format file size for display
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default storageService;
