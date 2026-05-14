import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/room/:roomId" element={<RoomPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
