import React from "react"
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Analyze from "./pages/Analyze"
import Simulate from "./pages/Simulate"
import Density from "./pages/Density"
import Diff from "./pages/Diff"
import Strike from "./pages/Strike"

export default function App() {
  return (
    <BrowserRouter>
      <div style={s.layout}>
        <nav style={s.nav}>
          <span style={s.logo}>🛰 DisasterAI</span>
          <div style={s.links}>
            {[
              { to: "/", label: "Analyze" },
              { to: "/simulate", label: "Simulate" },
              { to: "/density", label: "Density" },
              { to: "/diff", label: "Before/After" },
              { to: "/strike", label: "Strike" },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} end style={({ isActive }) => ({ ...s.link, ...(isActive ? s.activeLink : {}) })}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <main style={s.main}>
          <Routes>
            <Route path="/" element={<Analyze />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/density" element={<Density />} />
            <Route path="/diff" element={<Diff />} />
            <Route path="/strike" element={<Strike />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

const s: Record<string, React.CSSProperties> = {
  layout: { minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: 32, padding: "0 32px", height: 56, background: "#1e293b", borderBottom: "1px solid #334155", position: "sticky", top: 0, zIndex: 100 },
  logo: { fontSize: 18, fontWeight: 700, color: "#38bdf8", marginRight: 16 },
  links: { display: "flex", gap: 4 },
  link: { padding: "6px 14px", borderRadius: 6, color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 },
  activeLink: { background: "#0f172a", color: "#38bdf8" },
  main: { padding: "32px 24px", maxWidth: 1000, margin: "0 auto" },
}
