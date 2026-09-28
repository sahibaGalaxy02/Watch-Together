import { useRef, useState } from 'react';
import useRoomStore from '../../store/roomStore.js';
import { uploadVideo, setYouTubeUrl } from '../../api/roomApi.js';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner.jsx';

/* ── YouTube URL validator (client-side) ── */
const extractYtId = (url) => {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

/* ── Tab button ── */
const Tab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
      ${active
        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
        : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
  >
    {icon}
    {label}
  </button>
);

const UploadPanel = ({ roomId, onUploaded }) => {
  const [tab, setTab] = useState('file');            // 'file' | 'youtube'
  const [dragOver, setDragOver] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const fileRef = useRef(null);

  const uploadProgress = useRoomStore((s) => s.uploadProgress);
  const isUploading    = useRoomStore((s) => s.isUploading);
  const setUploadProgress = useRoomStore((s) => s.setUploadProgress);
  const setUploading      = useRoomStore((s) => s.setUploading);

  /* ── File upload ── */
  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    if (file.size > 500 * 1024 * 1024) { toast.error('File too large. Max 500MB.'); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadVideo(roomId, file, (p) => setUploadProgress(p));
      onUploaded(result.data.videoUrl, result.data.videoTitle, 'file');
      toast.success('Video uploaded!');
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
    handleFile(e.dataTransfer.files[0]);
  };

  /* ── YouTube submit ── */
  const handleYouTube = async (e) => {
    e.preventDefault();
    const url = ytUrl.trim();
    if (!url) { toast.error('Paste a YouTube URL'); return; }
    if (!extractYtId(url)) { toast.error('Invalid YouTube URL'); return; }

    setYtLoading(true);
    try {
      const result = await setYouTubeUrl(roomId, url);
      onUploaded(result.data.videoUrl, result.data.videoTitle, 'youtube');
      toast.success('YouTube video set!');
      setYtUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set YouTube video');
    } finally {
      setYtLoading(false);
    }
  };

  const ytId = extractYtId(ytUrl);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-white text-xl mb-1">Add a Video</h2>
          <p className="text-white/35 text-sm">Upload a local file or paste a YouTube link</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 bg-surface-800/60 p-1 rounded-2xl mb-6 border border-white/8">
          <Tab
            active={tab === 'file'}
            onClick={() => setTab('file')}
            label="Upload File"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <Tab
            active={tab === 'youtube'}
            onClick={() => setTab('youtube')}
            label="YouTube URL"
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            }
          />
        </div>

        {/* ── FILE TAB ── */}
        {tab === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !isUploading && fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-white/10 hover:border-white/25 bg-surface-800/40 hover:bg-surface-800/70'}`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Spinner size="lg" className="mx-auto" />
                <p className="text-white font-display font-semibold text-lg">Uploading to Cloudinary…</p>
                <div className="w-full bg-surface-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-brand-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-brand-400 text-sm font-mono font-medium">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-400">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-display font-bold text-white text-lg mb-1">
                  {dragOver ? 'Drop it!' : 'Upload Video File'}
                </p>
                <p className="text-white/40 text-sm mb-3">Drag & drop or click to browse</p>
                <span className="inline-block text-xs text-white/25 bg-surface-700/50 rounded-full px-3 py-1">
                  MP4 · WebM · MOV · AVI — up to 500MB
                </span>
              </>
            )}
          </div>
        )}

        {/* ── YOUTUBE TAB ── */}
        {tab === 'youtube' && (
          <div className="space-y-4">
            <form onSubmit={handleYouTube} className="space-y-3">
              <div className="relative">
                {/* YT icon inside input */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg viewBox="0 0 24 24" fill="#ff0000" className="w-5 h-5">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <input
                  className="input-field pl-12"
                  placeholder="https://youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Live thumbnail preview */}
              {ytId && (
                <div className="rounded-xl overflow-hidden border border-white/10 relative group">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt="YouTube thumbnail"
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-mono opacity-70">{ytId}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={ytLoading || !ytId}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {ytLoading ? (
                  <><Spinner size="sm" /> Setting video…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play YouTube Video
                  </>
                )}
              </button>
            </form>

            {/* Supported formats note */}
            <div className="rounded-xl bg-surface-800/40 border border-white/8 p-3.5 space-y-1.5">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Supported formats</p>
              {[
                'youtube.com/watch?v=VIDEO_ID',
                'youtu.be/VIDEO_ID',
                'youtube.com/shorts/VIDEO_ID',
              ].map((fmt) => (
                <p key={fmt} className="text-white/30 text-xs font-mono">{fmt}</p>
              ))}
              <p className="text-white/25 text-[11px] pt-1">
                Note: YouTube controls sync is best-effort — play/pause works but seek may have a small delay.
              </p>
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    </div>
  );
};

export default UploadPanel;