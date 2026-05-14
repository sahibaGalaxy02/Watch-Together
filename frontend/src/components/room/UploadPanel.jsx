import { useRef, useState } from 'react';
import useRoomStore from '../../store/roomStore.js';
import { uploadVideo } from '../../api/roomApi.js';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner.jsx';

const UploadPanel = ({ roomId, onUploaded }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const uploadProgress = useRoomStore((s) => s.uploadProgress);
  const isUploading = useRoomStore((s) => s.isUploading);
  const setUploadProgress = useRoomStore((s) => s.setUploadProgress);
  const setUploading = useRoomStore((s) => s.setUploading);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File too large. Max 500MB.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadVideo(roomId, file, (p) => setUploadProgress(p));
      onUploaded(result.data.videoUrl, result.data.videoTitle);
      toast.success('Video uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && fileRef.current.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${dragOver ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/30 bg-surface-800/50'}`}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-white font-display font-semibold text-lg">Uploading…</p>
            <div className="w-full bg-surface-700 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-white/50 text-sm font-mono">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-400">
                <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-display font-bold text-white text-lg mb-1">
              {dragOver ? 'Drop to upload' : 'Upload Video'}
            </p>
            <p className="text-white/40 text-sm">Drag & drop or click to browse</p>
            <p className="text-white/25 text-xs mt-2">MP4, WebM, MOV — up to 500MB</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
};

export default UploadPanel;
