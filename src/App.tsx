import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SkipLink from "./components/common/SkipLink";
import ScrollToTop from "./components/common/ScrollToTop";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Me from "./pages/Me";
import HalloBuur from "./pages/HalloBuur";
import HalloBuur2 from "./pages/HalloBuur2";
import Nieuwsbegrip from "./pages/Nieuwsbegrip";
import PECZwolle from "./pages/PECZwolle";

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

/**
 * Top-level router that wires global behaviour once and keeps each page focused
 * on its own structure. This organisation highlights the separation between
 * structure (routing/landmarks for 6.1), responsive navigation (6.2) and
 * accessibility helpers such as the skip link (6.3).
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SkipLink />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/me" element={<Me />} />
        <Route path="/hallo-buur" element={<HalloBuur />} />
        <Route path="/hallo-buur-2" element={<HalloBuur2 />} />
        <Route path="/nieuwsbegrip" element={<Nieuwsbegrip />} />
        <Route path="/pec-zwolle" element={<PECZwolle />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  );
};

export default App;
