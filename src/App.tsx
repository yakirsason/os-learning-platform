import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import LecturePage from '@/pages/LecturePage';
import { useLectureStore } from '@/store/useLectureStore';

export default function App() {
  const darkMode = useLectureStore((s) => s.darkMode);

  // סנכרון דגל dark mode עם שורש ה-HTML
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/lecture/:id" element={<LecturePage />} />
        <Route path="/lecture/:id/:section" element={<LecturePage />} />
      </Route>
    </Routes>
  );
}
