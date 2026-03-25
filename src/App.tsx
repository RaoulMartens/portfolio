// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";

const Home = React.lazy(() => import("./pages/Home"));
const Play = React.lazy(() => import("./pages/Play"));
const Me = React.lazy(() => import("./pages/Me"));
const HalloBuur = React.lazy(() => import("./pages/HalloBuur"));
const HalloBuur2 = React.lazy(() => import("./pages/HalloBuur2"));
const Nieuwsbegrip = React.lazy(() => import("./pages/Nieuwsbegrip"));
const PECZwolle = React.lazy(() => import("./pages/PECZwolle"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

/**
 * Router voor alle pagina's.
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

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/me" element={<Me />} />
          <Route path="/hallo-buur" element={<HalloBuur />} />
          <Route path="/hallo-buur-2" element={<HalloBuur2 />} />
          <Route path="/nieuwsbegrip" element={<Nieuwsbegrip />} />
          <Route path="/pec-zwolle" element={<PECZwolle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  );
};

export default App;
