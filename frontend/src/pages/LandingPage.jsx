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
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white border-2 border-[#0b0b18] -ml-2 first:ml-0 select-none flex-shrink-0`}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
};

/* ─── Chat bubble ────────────────────────────────────────── */
const ChatBubble = ({ name, nameColor, text, align = 'left', highlight }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'items-start gap-1.5'} mb-2`}>
    {align === 'left' && (
      <span className={`text-[11px] font-semibold shrink-0 mt-0.5`} style={{ color: nameColor }}>{name}</span>
    )}
    {highlight ? (
      <span className="text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full" style={{ background: '#7c3aed' }}>{text}</span>
    ) : (
      <span className="text-[11px] text-white/70">{text}</span>
    )}
  </div>
);

/* ─── Hero preview mockup ───────────────────────────────── */
const HeroPreview = () => (
  <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
    {/* Ambient glow behind the card */}
    <div className="absolute inset-[-30px] -z-10 rounded-3xl"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.35) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)' }} />

    {/* Main card */}
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: 'rgba(18,14,36,0.9)', backdropFilter: 'blur(12px)' }}>

      {/* Video area */}
      <div className="relative" style={{ paddingTop: '56.25%', background: 'radial-gradient(ellipse at 30% 60%, #2d1060 0%, #1a0830 40%, #0e0520 100%)' }}>
        <div className="absolute inset-0">
          {/* subtle noise-like dots */}
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {/* center warm glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(180,60,20,0.45) 0%, transparent 60%)' }} />
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-white/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5 opacity-80">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Live chat panel — top right */}
        <div className="absolute top-3 right-3 w-36 rounded-xl overflow-hidden border border-white/10"
          style={{ background: 'rgba(10,8,22,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="px-2.5 py-1.5 border-b border-white/8">
            <span className="text-[9px] font-bold tracking-[0.15em] text-white/40 uppercase">Live Chat</span>
          </div>
          <div className="p-2.5">
            <ChatBubble name="Mira" nameColor="#c084fc" text="this scene 🔥" />
            <ChatBubble name="you" nameColor="#f472b6" text="agreed!" align="right" highlight />
            <ChatBubble name="Kai" nameColor="#60a5fa" text="popcorn ready" />
          </div>
        </div>
      </div>

      {/* Avatar row at bottom of card */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/8">
        <div className="flex items-center">
          <Avatar initials="AM" gradient="linear-gradient(135deg,#f97316,#ec4899)" />
          <Avatar initials="KO" gradient="linear-gradient(135deg,#8b5cf6,#6366f1)" />
          <Avatar initials="JP" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" />
          <Avatar initials="SR" gradient="linear-gradient(135deg,#10b981,#14b8a6)" />
          <div className="w-8 h-8 rounded-full -ml-2 border-2 border-[#0b0b18] bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
            +8
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-white/35 font-medium">12 watching</span>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Feature card ──────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc }) => (
  <div className="rounded-2xl border border-white/8 p-5 hover:border-white/15 transition-colors duration-200"
    style={{ background: '#100e1f' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
      {icon}
    </div>
    <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
    <p className="text-white/40 text-[13px] leading-relaxed">{desc}</p>
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
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Your nickname</label>
          <input className="input-field" placeholder="e.g. Naved" value={nickname}
            onChange={(e) => setNickname(e.target.value)} maxLength={24} autoFocus />
        </div>
        <p className="text-white/30 text-xs leading-relaxed">
          You'll become the host. Upload a video, then share your room code with friends — no accounts needed.
        </p>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ff3366, #e0002a)' }}>
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
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Your nickname</label>
          <input className="input-field" placeholder="e.g. Naved" value={nickname}
            onChange={(e) => setNickname(e.target.value)} maxLength={24} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Room code</label>
          <input className="input-field font-mono tracking-[0.25em] uppercase text-center text-base"
            placeholder="AB12CD34" value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={8} />
        </div>
        <button type="submit"
          className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 border border-white/20"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
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

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="border-b border-white/8" style={{ background: 'rgba(11,11,24,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ff3366,#e0002a)' }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <span className="font-bold text-white text-[15px] tracking-tight">
              Watch<span style={{ color: '#f43f5e' }}>Together</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-white/45">
            <a href="#features" className="hover:text-white transition-colors duration-150">How it works</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-150">Source</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 lg:pt-20 lg:pb-24">
        {/* bg radial purple glow — top left */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[500px] -z-10 opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(88,28,220,0.3) 0%, transparent 65%)' }} />

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left column */}
          <div className="flex-1 min-w-0 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-1 text-[12px] font-medium text-white/50 mb-8"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Synchronised. Social. Cinematic.
            </div>

            {/* Headline */}
            <h1 className="font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)' }}>
              Watch movies with your<br />
              friends —<br />
              <span style={{
                background: 'linear-gradient(90deg, #c084fc 0%, #e879f9 50%, #fb7185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                perfectly in sync.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-white/45 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
              style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
              Upload any local video, share a 6-character room code and host a private watch party.
              Real-time playback sync, live chat, host controls — no signup required.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-9">
              <button
                onClick={() => setShowStart(true)}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#e0002a)', boxShadow: '0 4px 24px rgba(244,63,94,0.35)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 shrink-0"><path d="M8 5v14l11-7z" /></svg>
                Start a watch party
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white/80 text-sm border border-white/15 transition-all duration-200 hover:bg-white/8 hover:border-white/25 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {/* Hash icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
                  <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" strokeLinecap="round" />
                </svg>
                Join with a code
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 justify-center lg:justify-start text-[12px] text-white/30 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />No accounts
              </span>
              <span>End-to-room private</span>
              <span>Up to 50 viewers</span>
            </div>
          </div>

          {/* Right column: hero preview */}
          <div className="w-full lg:w-[460px] flex-shrink-0">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <div className="grid sm:grid-cols-3 gap-3">
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" className="w-5 h-5">
                <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Upload any video"
            desc="Drop a local file — we stream it to everyone in the room with progress feedback."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" className="w-5 h-5">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Synced playback"
            desc="Host controls play, pause and seek. Drift correction keeps everyone within a second."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" className="w-5 h-5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Live chat & reactions"
            desc="React to every twist together with a built-in sidebar chat — no extra apps needed."
          />
        </div>
      </section>

      {/* Modals */}
      <StartModal isOpen={showStart} onClose={() => setShowStart(false)} />
      <JoinModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
};

export default LandingPage;