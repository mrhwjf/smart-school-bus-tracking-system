// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GDChinh from "./GDChinh";
import RouteHistory from "./RouteHistory";
import GD_Map from "./GD_Map";
import GDHoSoCuaToi from "./GDHoSoCuaToi";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/GDChinh" element={<GDChinh />} />
        <Route path="/history" element={<RouteHistory />} />
        <Route path="/map" element={<GD_Map />} />
        <Route path="/HoSoCuaToi" element={<GDHoSoCuaToi />} />
      </Routes>
    </BrowserRouter>
  );
}
