import { Route, Routes } from 'react-router-dom';

import Store from './pages/Store';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Store />} />
      <Route path="*" element={<Store />} />
    </Routes>
  );
}
