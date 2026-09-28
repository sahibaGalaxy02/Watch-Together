import { Router } from 'express';
import { createRoom, getRoom, uploadVideo, setYouTubeVideo, closeRoom } from '../controllers/roomController.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/create', createRoom);
router.get('/:roomId', getRoom);
router.post('/:roomId/upload', upload.single('video'), uploadVideo);
router.post('/:roomId/set-youtube', setYouTubeVideo);
router.delete('/:roomId', closeRoom);

export default router;