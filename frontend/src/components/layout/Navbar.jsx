import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 border-b border-white/[0.08] bg-surface-950/80 backdrop-blur-md">
    <Link to="/" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C92.7 128 64 156.7 64 192L64 448C64 483.3 92.7 512 128 512L384 512C419.3 512 448 483.3 448 448L448 192C448 156.7 419.3 128 384 128L128 128zM496 400L569.5 458.8C573.7 462.2 578.9 464 584.3 464C597.4 464 608 453.4 608 440.3L608 199.7C608 186.6 597.4 176 584.3 176C578.9 176 573.7 177.8 569.5 181.2L496 240L496 400z"/></svg>
      </div>
      <span className="font-display font-bold text-white text-lg tracking-tight">
        Watch<span className="text-brand-500">Together</span>
      </span>
    </Link>
  </nav>
);

export default Navbar;
