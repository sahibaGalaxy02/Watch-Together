import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
    <p className="font-display font-extrabold text-9xl text-white/10 mb-4">404</p>
    <h1 className="font-display font-bold text-2xl text-white mb-3">Page not found</h1>
    <p className="text-white/40 mb-8">This room or page doesn't exist.</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage;
