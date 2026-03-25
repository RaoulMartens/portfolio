// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
 * Router voor alle pagina’s.
 * - HTML-structuur los van styling (6.1)
 * - Navigatie en layout responsive (6.2)
 * - Scroll- en focusbeheer toegankelijk (6.3)
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div
        id="route-anchor"
        tabIndex={-1}
        style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, overflow: "hidden", outline: "none", border: "none" }}
        aria-hidden="true"
      />

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
