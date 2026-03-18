import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import StoneGamePage from '../pages/StoneGamePage';
import StoneGame2Page from '../pages/StoneGame2Page';
import StoneGame3Page from '../pages/StoneGame3Page';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/stone-game" element={<StoneGamePage />} />
        <Route path="/games/stone-game-2" element={<StoneGame2Page />} />
        <Route path="/games/stone-game-3" element={<StoneGame3Page />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
