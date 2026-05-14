import { nanoid } from 'nanoid';
import Room from '../models/Room.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '../services/cloudinaryService.js';

// POST /api/rooms/create
export const createRoom = asyncHandler(async (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ success: false, message: 'Nickname is required' });

  const roomId = nanoid(8).toUpperCase();
  // hostId is the socket ID set later; we use a temp placeholder
  const room = await Room.create({ roomId, hostId: 'pending' });

  res.status(201).json({
    success: true,
    data: { roomId: room.roomId },
  });
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
      playbackState: room.playbackState,
      messages: room.messages.slice(-50), // last 50 messages
    },
  });
});

// POST /api/rooms/:roomId/upload  (host only — enforced via socket check)
export const uploadVideo = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

  // Delete old video if exists
  if (room.videoPublicId) {
    await deleteVideoFromCloudinary(room.videoPublicId);
  }

  // Upload to Cloudinary
  const result = await uploadVideoToCloudinary(req.file.buffer, {
    public_id: `room_${roomId}_${Date.now()}`,
  });

  // Update room with new video
  room.videoUrl = result.secure_url;
  room.videoPublicId = result.public_id;
  room.videoTitle = req.file.originalname.replace(/\.[^/.]+$/, ''); // strip extension
  room.playbackState = { isPlaying: false, currentTime: 0, updatedAt: new Date() };
  await room.save();

  res.json({
    success: true,
    data: {
      videoUrl: result.secure_url,
      videoTitle: room.videoTitle,
    },
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
