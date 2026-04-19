import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Upload avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'snapclone/avatars'
    );

    res.json({
      message: 'Avatar uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload chat attachment (image, video, document)
 */
export const uploadChatAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'snapclone/chat-attachments'
    );

    const fileType = req.file.mimetype.split('/')[0]; // 'image', 'video', 'application'

    res.json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      fileType,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Chat attachment upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload snap (image/video)
 */
export const uploadSnap = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'snapclone/snaps'
    );

    const fileType = req.file.mimetype.split('/')[0]; // 'image' or 'video'

    res.json({
      message: 'Snap uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      fileType,
      duration: req.body.duration || null
    });
  } catch (error) {
    console.error('Snap upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload story (image/video)
 */
export const uploadStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'snapclone/stories'
    );

    const fileType = req.file.mimetype.split('/')[0];

    res.json({
      message: 'Story uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      fileType
    });
  } catch (error) {
    console.error('Story upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await deleteFromCloudinary(publicId);

    res.json({
      message: 'File deleted successfully',
      result
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  uploadAvatar,
  uploadChatAttachment,
  uploadSnap,
  uploadStory,
  deleteFile
};
