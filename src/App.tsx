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
 * Deze component maakt alle routes aan voor de site.
 * Zo blijft de structuur (routering = HTML) apart van de opmaak (CSS) → criterium 6.1.
 * De router laadt ook de responsive navigatie → criterium 6.2.
 * De skiplink en scroll-reset zorgen voor toetsenbordtoegankelijkheid → criterium 6.3.
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Anchor for Back to Top button */}
      <div
        id="site-top"
        tabIndex={-1}
        style={{ position: "absolute", top: 0, left: 0, width: "1px", height: "1px" }}
        aria-hidden="true"
      />

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
