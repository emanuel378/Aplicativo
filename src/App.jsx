import { Routes, Route } from 'react-router-dom';
import ETo from './pages/eto.jsx';
import ETCC from './pages/etcc.jsx';
import Ko from './pages/ko.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ETo />} />
      <Route path="/eto" element={<ETo />} />
      <Route path="/etcc" element={<ETCC />} />
      <Route path="/ko" element={<Ko />} />
      <Route path="/dashboard" element={<div>Dashboard - Em desenvolvimento</div>} />
    </Routes>
  );
}

export default App;
