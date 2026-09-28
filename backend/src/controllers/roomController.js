import { nanoid } from 'nanoid';
import Room from '../models/Room.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '../services/cloudinaryService.js';
import { extractYouTubeId, buildEmbedUrl } from '../utils/youtube.js';

// POST /api/rooms/create
export const createRoom = asyncHandler(async (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ success: false, message: 'Nickname is required' });

  const roomId = nanoid(8).toUpperCase();
  const room = await Room.create({ roomId, hostId: 'pending' });

  res.status(201).json({ success: true, data: { roomId: room.roomId } });
});

// GET /api/rooms/:roomId
export const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId, isActive: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found or inactive' });

  res.json({
    success: true,
    data: {
      roomId: room.roomId,
      hostId: room.hostId,
      videoUrl: room.videoUrl,
      videoTitle: room.videoTitle,
      videoType: room.videoType,
      playbackState: room.playbackState,
      messages: room.messages.slice(-50),
    },
  });
});

// POST /api/rooms/:roomId/upload  — file upload via Cloudinary
export const uploadVideo = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

  if (room.videoPublicId) await deleteVideoFromCloudinary(room.videoPublicId);

  const result = await uploadVideoToCloudinary(req.file.buffer, {
    public_id: `room_${roomId}_${Date.now()}`,
  });

  room.videoUrl = result.secure_url;
  room.videoPublicId = result.public_id;
  room.videoTitle = req.file.originalname.replace(/\.[^/.]+$/, '');
  room.videoType = 'file';
  room.playbackState = { isPlaying: false, currentTime: 0, updatedAt: new Date() };
  await room.save();

  res.json({ success: true, data: { videoUrl: result.secure_url, videoTitle: room.videoTitle, videoType: 'file' } });
});

// POST /api/rooms/:roomId/set-youtube  — set a YouTube video URL
export const setYouTubeVideo = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { youtubeUrl } = req.body;

  if (!youtubeUrl) return res.status(400).json({ success: false, message: 'YouTube URL is required' });

  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });

  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  // If switching from a file upload, clean up Cloudinary
  if (room.videoPublicId) {
    await deleteVideoFromCloudinary(room.videoPublicId);
    room.videoPublicId = null;
  }

  const embedUrl = buildEmbedUrl(videoId);
  room.videoUrl = embedUrl;
  room.videoTitle = `YouTube: ${videoId}`;
  room.videoType = 'youtube';
  room.playbackState = { isPlaying: false, currentTime: 0, updatedAt: new Date() };
  await room.save();

  res.json({
    success: true,
    data: { videoUrl: embedUrl, videoTitle: room.videoTitle, videoType: 'youtube', videoId },
  });
});

// DELETE /api/rooms/:roomId
export const closeRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOneAndUpdate(
    { roomId: req.params.roomId },
    { isActive: false },
    { new: true }
  );
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.json({ success: true, message: 'Room closed' });
});