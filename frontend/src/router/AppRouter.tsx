import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import StoneGamePage from '../pages/StoneGamePage';
import StoneGame2Page from '../pages/StoneGame2Page';
import StoneGame3Page from '../pages/StoneGame3Page';
import NimGamePage from '../pages/NimGamePage';
import TicTacToePage from '../pages/TicTacToePage';
import Connect4Page from '../pages/Connect4Page';
import ReplayPage from '../pages/ReplayPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/stone-game" element={<StoneGamePage />} />
        <Route path="/games/stone-game-2" element={<StoneGame2Page />} />
        <Route path="/games/stone-game-3" element={<StoneGame3Page />} />
        <Route path="/games/nim" element={<NimGamePage />} />
        <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
        <Route path="/games/connect-4" element={<Connect4Page />} />
        <Route path="/replay" element={<ReplayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
