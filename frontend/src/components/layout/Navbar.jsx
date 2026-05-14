import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 border-b border-white/[0.08] bg-surface-950/80 backdrop-blur-md">
    <Link to="/" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
          <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      </div>
      <span className="font-display font-bold text-white text-lg tracking-tight">
        Watch<span className="text-brand-500">Together</span>
      </span>
    </Link>
  </nav>
);

export default Navbar;
