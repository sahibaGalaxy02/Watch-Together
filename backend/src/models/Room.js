import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  nickname: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    hostId: { type: String, required: true },
    videoUrl: { type: String, default: null },
    videoPublicId: { type: String, default: null },
    videoTitle: { type: String, default: null },
    // 'file' = Cloudinary upload | 'youtube' = YouTube embed
    videoType: { type: String, enum: ['file', 'youtube'], default: 'file' },
    playbackState: {
      isPlaying: { type: Boolean, default: false },
      currentTime: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    messages: [messageSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;