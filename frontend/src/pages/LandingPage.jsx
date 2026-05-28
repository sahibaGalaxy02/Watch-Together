import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createRoom } from '../api/roomApi.js';
import useRoomStore from '../store/roomStore.js';
import Spinner from '../components/common/Spinner.jsx';
import Modal from '../components/common/Modal.jsx';

/* ─── Avatar component ─────────────────────────────────── */
const Avatar = ({ initials, gradient, size = 'sm' }) => {
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-xs';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white border-2 border-[#0b0b18] -ml-2 first:ml-0 select-none flex-shrink-0 shadow-lg`}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
};

/* ─── Chat bubble ────────────────────────────────────────── */
const ChatBubble = ({ name, nameColor, text, align = 'left', highlight }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'items-start gap-1.5'} mb-3`}>
    {align === 'left' && (
      <span className={`text-[11px] font-semibold shrink-0 mt-0.5`} style={{ color: nameColor }}>{name}</span>
    )}
    {highlight ? (
      <span className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-full backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>{text}</span>
    ) : (
      <span className="text-[11px] text-white/70 bg-white/5 px-2.5 py-1 rounded-lg backdrop-blur-sm">{text}</span>
    )}
  </div>
);

/* ─── Hero preview mockup ───────────────────────────────── */
const HeroPreview = () => (
  <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto group">
    {/* Animated gradient glow */}
    <div className="absolute inset-[-40px] -z-10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(244,63,94,0.3) 100%)' }} />

    {/* Main card with improved border */}
    <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl"
      style={{ background: 'rgba(18,14,36,0.95)' }}>

      {/* Video area */}
      <div className="relative" style={{ paddingTop: '56.25%', background: 'radial-gradient(ellipse at 30% 60%, #2d1060 0%, #1a0830 40%, #0e0520 100%)' }}>
        <div className="absolute inset-0">
          {/* animated grid pattern */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* center warm glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(180,60,20,0.45) 0%, transparent 60%)' }} />
        </div>

        {/* Animated Play button */}
        <div className="absolute inset-0 flex items-center justify-center group/play">
          <div className="w-14 h-14 rounded-full border-2 border-white/50 flex items-center justify-center group-hover/play:border-white/80 transition-colors duration-300 group-hover/play:bg-white/10">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5 opacity-80 group-hover/play:opacity-100 transition-opacity">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Live chat panel — top right */}
        <div className="absolute top-3 right-3 w-36 rounded-xl overflow-hidden border border-white/15 backdrop-blur-md shadow-lg"
          style={{ background: 'rgba(10,8,22,0.9)' }}>
          <div className="px-2.5 py-1.5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <span className="text-[9px] font-bold tracking-[0.15em] text-white/50 uppercase">Live Chat</span>
          </div>
          <div className="p-2.5 space-y-0">
            <ChatBubble name="Mira" nameColor="#c084fc" text="this scene 🔥" />
            <ChatBubble name="you" nameColor="#f472b6" text="agreed!" align="right" highlight />
            <ChatBubble name="Kai" nameColor="#60a5fa" text="popcorn ready" />
          </div>
        </div>
      </div>

      {/* Avatar row at bottom of card */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center">
          <Avatar initials="AM" gradient="linear-gradient(135deg,#f97316,#ec4899)" />
          <Avatar initials="KO" gradient="linear-gradient(135deg,#8b5cf6,#6366f1)" />
          <Avatar initials="JP" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" />
          <Avatar initials="SR" gradient="linear-gradient(135deg,#10b981,#14b8a6)" />
          <div className="w-8 h-8 rounded-full -ml-2 border-2 border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
            +8
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-lg" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
          <span className="text-[10px] text-white/40 font-medium">12 watching</span>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Feature card ──────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc }) => (
  <div className="group rounded-2xl border border-white/10 p-6 hover:border-white/25 transition-all duration-300 backdrop-blur-sm hover:bg-white/5 hover:shadow-lg"
    style={{ background: 'rgba(18,14,36,0.5)' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
      style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
      <div className="group-hover:brightness-125 transition-all duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-white font-bold text-sm mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">{title}</h3>
    <p className="text-white/50 text-[13px] leading-relaxed group-hover:text-white/70 transition-colors duration-300">{desc}</p>
  </div>
);

/* ─── Start party modal ──────────────────────────────────── */
const StartModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const setNicknameStore = useRoomStore((s) => s.setNickname);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) { toast.error('Enter your nickname'); return; }
    setLoading(true);
    try {
      const res = await createRoom(nickname.trim());
      setNicknameStore(nickname.trim());
      navigate(`/room/${res.data.roomId}`);
    } catch { toast.error('Failed to create room'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a watch party" size="sm">
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Your nickname</label>
          <input className="input-field w-full px-4 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-colors" placeholder="e.g. Naved" value={nickname}
            onChange={(e) => setNickname(e.target.value)} maxLength={24} autoFocus />
        </div>
        <p className="text-white/40 text-xs leading-relaxed">
          You'll become the host. Upload a video, then share your room code with friends — no accounts needed.
        </p>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ff3366, #e0002a)', boxShadow: '0 8px 20px rgba(255, 51, 102, 0.3)' }}>
          {loading ? <><Spinner size="sm" /> Creating…</> : (
            <>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M8 5v14l11-7z" /></svg>
              Start Party
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};

/* ─── Join modal ─────────────────────────────────────────── */
const JoinModal = ({ isOpen, onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const setNicknameStore = useRoomStore((s) => s.setNickname);
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) { toast.error('Enter your nickname'); return; }
    if (!roomCode.trim()) { toast.error('Enter a room code'); return; }
    setNicknameStore(nickname.trim());
    navigate(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join with a code" size="sm">
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Your nickname</label>
          <input className="input-field w-full px-4 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-colors" placeholder="e.g. Naved" value={nickname}
            onChange={(e) => setNickname(e.target.value)} maxLength={24} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Room code</label>
          <input className="input-field w-full font-mono tracking-[0.25em] uppercase text-center text-base px-4 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="AB12CD34" value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={8} />
        </div>
        <button type="submit"
          className="w-full py-3 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/15 active:scale-95 border border-white/20 shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Join Party
        </button>
      </form>
    </Modal>
  );
};

/* ─── Main landing page ──────────────────────────────────── */
const LandingPage = () => {
  const [showStart, setShowStart] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#0b0b18' }}>

      {/* ── Animated background elements ──────────────────── */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{ background: 'radial-gradient(ellipse, rgba(244,63,94,0.3) 0%, transparent 70%)', animationDelay: '2s' }} />
      </div>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="border-b border-white/8 relative z-40" style={{ background: 'rgba(11,11,24,0.8)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg,#ff3366,#e0002a)' }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              Watch<span style={{ color: '#f43f5e' }}>Together</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-10 text-sm font-medium">
            <a href="#features" className="text-white/50 hover:text-white transition-colors duration-200">How it works</a>
            <a href="https://github.com/sahibaGalaxy02/Watch-Together" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white transition-colors duration-200">Source</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left column */}
          <div className="flex-1 min-w-0 text-center lg:text-left">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-4 py-2 text-[12px] font-medium text-white/60 mb-8 backdrop-blur-sm hover:border-white/40 hover:text-white/80 transition-all duration-300"
              style={{ background: 'rgba(139,92,246,0.1)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Synchronised. Social. Cinematic.
            </div>

            {/* Headline with gradient */}
            <h1 className="font-black leading-[1.08] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              Watch movies with your<br />
              friends —<br />
              <span style={{
                background: 'linear-gradient(135deg, #c084fc 0%, #e879f9 50%, #fb7185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                perfectly in sync.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-white/50 leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0"
              style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)' }}>
              Upload any local video, share a 6-character room code and host a private watch party.
              Real-time playback sync, live chat, host controls — no signup required.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={() => setShowStart(true)}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg font-bold text-white text-sm transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg group"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#e0002a)', boxShadow: '0 8px 24px rgba(244,63,94,0.4)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"><path d="M8 5v14l11-7z" /></svg>
                Start a watch party
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg font-bold text-white text-sm border border-white/30 transition-all duration-300 hover:border-white/50 hover:bg-white/10 active:scale-95 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
                  <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" strokeLinecap="round" />
                </svg>
                Join with a code
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center lg:justify-start text-[13px] text-white/40 font-medium">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="10" style={{ fill: 'rgba(74,222,128,0.8)' }} /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" /></svg>No accounts
              </span>
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="10" style={{ fill: 'rgba(74,222,128,0.8)' }} /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" /></svg>End-to-room private
              </span>
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="10" style={{ fill: 'rgba(74,222,128,0.8)' }} /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" /></svg>Up to 50 viewers
              </span>
            </div>
          </div>

          {/* Right column: hero preview */}
          <div className="w-full lg:w-[500px] flex-shrink-0">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────── */}
      <section id="features" className="relative max-w-7xl mx-auto px-5 sm:px-8 pb-32">
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Everything you need
          </h2>
          <p className="text-white/50">Powerful features to make your watch parties unforgettable</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" className="w-6 h-6">
                <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Upload any video"
            desc="Drop a local file — we stream it to everyone in the room with progress feedback."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="w-6 h-6">
                <path d="M12 8v8m-4-4h8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Synced playback"
            desc="Host controls play, pause and seek. Drift correction keeps everyone within a second."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" className="w-6 h-6">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Live chat & reactions"
            desc="React to every twist together with a built-in sidebar chat — no extra apps needed."
          />
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="rounded-2xl border border-white/20 p-12 text-center backdrop-blur-sm overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(244,63,94,0.1) 100%)' }}>
          <div className="absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to watch together?</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">No sign-up required. Just create a room or join with a code. Start streaming with your friends in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowStart(true)}
              className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get started
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="px-8 py-3 rounded-lg font-bold text-white border border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Join now
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <StartModal isOpen={showStart} onClose={() => setShowStart(false)} />
      <JoinModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
};

export default LandingPage;
