import React, { useState, useEffect } from "react";
import Link from "next/link";
import Box3DViewer from "../src/components/Box3DViewer";
import { useBoxStore } from "../src/lib/useBoxStore";

const themes = {
  dark: {
    bgApp: "#090a0f",
    bgCanvas: "#0f1016",
    bgPanel: "#13141c",
    border: "rgba(255, 255, 255, 0.08)",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    cyan: "#06b6d4",
    inputBg: "#1c1e28",
    activeBg: "rgba(6, 182, 212, 0.12)"
  },
  light: {
    bgApp: "#f3f4f6",
    bgCanvas: "#ffffff",
    bgPanel: "#f9fafb",
    border: "rgba(0, 0, 0, 0.08)",
    textMain: "#0f172a",
    textMuted: "#64748b",
    cyan: "#0284c7",
    inputBg: "#ffffff",
    activeBg: "rgba(2, 132, 199, 0.1)"
  }
};

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={onChange} 
    style={{
      width: "36px", height: "20px", borderRadius: "10px",
      background: checked ? "#06b6d4" : "#d1d5db",
      position: "relative", cursor: "pointer", flexShrink: 0,
      transition: "background 0.2s ease"
    }}
  >
    <div style={{
      width: "16px", height: "16px", borderRadius: "50%", background: "#ffffff", 
      position: "absolute", top: "2px", left: checked ? "18px" : "2px", 
      transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
    }} />
  </div>
);

export default function ModelViewer() {
  const store = useBoxStore();
  const t = themes[store.theme];
  
  const [foldProgress, setFoldProgress] = useState(0.85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [materialPreset, setMaterialPreset] = useState("white-kraft");
  const [lightingPreset, setLightingPreset] = useState("studio");

  // --- MATHEMATICAL COMPOSITIONS ---
  const { L, W, H, T, sizeMode } = store;
  let manuL = L, manuW = W, manuH = H;
  let innerL = L, innerW = W, innerH = H;
  let outerL = L, outerW = W, outerH = H;

  if (sizeMode === 'manufacture') {
    innerL = L - 2*T; innerW = W - 2*T; innerH = H - 2*T;
    outerL = L + 2*T; outerW = W + 2*T; outerH = H + 2*T;
  } else if (sizeMode === 'inner') {
    manuL = L + 2*T; manuW = W + 2*T; manuH = H + 2*T;
    outerL = L + 4*T; outerW = W + 4*T; outerH = H + 4*T;
  } else if (sizeMode === 'outer') {
    manuL = L - 2*T; manuW = W - 2*T; manuH = H - 2*T;
    innerL = L - 4*T; innerW = W - 4*T; innerH = H - 4*T;
  }

  // Auto-play folding animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let direction = 1;
    let animationFrameId;

    const tick = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setFoldProgress((prev) => {
        let next = prev + direction * delta * 0.22 * playSpeed;
        if (next >= 1.0) {
          next = 1.0;
          direction = -1;
        } else if (next <= 0.0) {
          next = 0.0;
          direction = 1;
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playSpeed]);

  const handleExportMockup = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Please ensure the 3D viewport is ready.");
      return;
    }
    const dataURL = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = "boxcraft_3d_mockup.png";
    downloadLink.href = dataURL;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body, html, #__next { 
          margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; 
          overflow: hidden !important; background-color: ${t.bgApp}; color: ${t.textMain}; font-family: 'Outfit', 'Inter', system-ui, sans-serif; 
        }
        * { box-sizing: border-box; }
        
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${store.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.cyan}; }

        input[type=number], select { 
          background: ${t.inputBg}; border: 1px solid ${t.border}; color: ${t.textMain}; 
          padding: 10px 12px; border-radius: 8px; width: 100%; outline: none; font-size: 13px; 
          transition: all 0.2s ease; font-weight: 500; appearance: none;
        }
        input[type=number]:focus, select:focus { border-color: ${t.cyan}; box-shadow: 0 0 0 2px ${t.cyan}25; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

        .view-slider {
          -webkit-appearance: none; appearance: none; flex: 1; height: 4px; border-radius: 2px;
          background: #27272a; outline: none; cursor: pointer;
        }
        .view-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: ${t.cyan}; cursor: pointer; transition: transform 0.15s ease; box-shadow: 0 0 8px ${t.cyan}80;
        }
        .view-slider::-webkit-slider-thumb:hover { transform: scale(1.3); }
        
        .format-btn { 
          background: ${t.inputBg}; border: 1px solid ${t.border}; color: ${t.textMain}; 
          padding: 12px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; 
          display: flex; align-items: center; gap: 8px; justify-content: flex-start; transition: all 0.2s; 
        }
        .format-btn:hover { border-color: ${t.cyan}; background: ${t.activeBg}; transform: translateY(-1px); }
      `}} />

      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        
        {/* --- HEADER --- */}
        <div style={{ height: "64px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: t.bgPanel, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Back to Dieline</span>
            </Link>
            <div style={{ width: 1, height: 24, background: t.border }} />
            <span style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.3px" }}>3D Model Viewer</span>
          </div>
          
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button onClick={store.toggleTheme} style={{ background: "transparent", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: 4 }}>
              {store.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              onClick={handleExportMockup}
              style={{
                background: `linear-gradient(135deg, ${t.cyan}, #0284c7)`, color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 4px 12px ${t.cyan}30`
              }}
            >
              <span style={{ fontSize: "11px" }}>📸</span> Snapshot
            </button>
          </div>
        </div>

        {/* --- MAIN WORKSPACE --- */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* --- CENTER AREA: 3D CANVAS --- */}
          <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #e5dec9, #dcd6cd)" }}>
            <Box3DViewer 
              L={manuL} 
              W={manuW} 
              H={manuH} 
              T={T} 
              progress={foldProgress}
              materialPreset={materialPreset}
              lightingPreset={lightingPreset}
            />
            
            {/* FLOATING ANIMATION TOOLBAR AT BOTTOM CENTER */}
            <div style={{
              position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px", display: "flex", padding: "12px 20px", gap: "20px", alignItems: "center", zIndex: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)", width: "400px"
            }}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                style={{ background: isPlaying ? t.cyan : "transparent", border: `1px solid \${isPlaying ? t.cyan : "rgba(255,255,255,0.2)"}`, color: "#fff", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "0.2s" }}
              >
                {isPlaying ? "⏸️ Pause" : "▶️ Play"}
              </button>
              <input 
                type="range" min="0" max="1" step="0.001" 
                value={foldProgress} 
                onChange={(e) => setFoldProgress(parseFloat(e.target.value))} 
                className="view-slider"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 11, fontWeight: "600" }}>
                <span>Speed</span>
                <select value={playSpeed} onChange={(e) => setPlaySpeed(parseFloat(e.target.value))} style={{ width: "auto", padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 4 }}>
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- RIGHT PANEL: 3D SETTINGS --- */}
          <div style={{ width: "320px", borderLeft: `1px solid \${t.border}`, padding: "24px", overflowY: "auto", background: t.bgPanel, display: "flex", flexDirection: "column", gap: 24, zIndex: 5, flexShrink: 0 }}>
            
            {/* Dimensions */}
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Dimensions (in)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "600" }}>Length</label>
                  <input type="number" step="0.01" defaultValue={store.L} key={`L-\${store.L}`} onBlur={(e) => store.setDim("L", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "600" }}>Width</label>
                  <input type="number" step="0.01" defaultValue={store.W} key={`W-\${store.W}`} onBlur={(e) => store.setDim("W", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "600" }}>Height</label>
                <input type="number" step="0.01" defaultValue={store.H} key={`H-\${store.H}`} onBlur={(e) => store.setDim("H", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: 0 }} />

            {/* Render Settings */}
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                Render Settings
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "600" }}>Material Preset</label>
                  <select value={materialPreset} onChange={(e) => setMaterialPreset(e.target.value)}>
                    <option value="white-kraft">⚪ White Paperboard</option>
                    <option value="natural-kraft">🟤 Natural Kraft</option>
                    <option value="corrugated-kraft">📦 Corrugated E-Flute</option>
                    <option value="matte-black">⚫ Matte Black Card</option>
                    <option value="gold-foil">✨ Gold Foil Board</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "600" }}>Lighting Setup</label>
                  <select value={lightingPreset} onChange={(e) => setLightingPreset(e.target.value)}>
                    <option value="studio">💡 Studio Bright</option>
                    <option value="warm">🌅 Warm Sunset</option>
                    <option value="tech">🔷 Tech Neon</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: "600", color: t.textMain }}>Highlight Print Zone</span>
                  <ToggleSwitch checked={store.showMaterialZone} onChange={store.toggleMaterialZone} />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: 0 }} />

            {/* Fold Kinematics */}
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Folding Stages
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: t.inputBg, padding: "14px", borderRadius: "12px", border: `1px solid \${t.border}` }}>
                {[
                  { label: "1. Sleeve tube", maxProg: 0.2 },
                  { label: "2. Bottom dust flaps", maxProg: 0.4 },
                  { label: "3. Bottom tuck", maxProg: 0.6 },
                  { label: "4. Top dust flaps", maxProg: 0.8 },
                  { label: "5. Top tuck", maxProg: 1.0 }
                ].map((step, idx) => {
                  const isActive = (foldProgress > step.maxProg - 0.2) && (foldProgress <= step.maxProg);
                  const isDone = foldProgress >= step.maxProg;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: isActive ? t.cyan : isDone ? t.textMain : t.textMuted }}>
                      <span style={{ fontWeight: isActive ? "700" : "500" }}>{step.label}</span>
                      <span style={{ fontSize: "11px" }}>
                        {isDone ? "✅" : isActive ? "⚡" : "⏳"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    </>
  );
}
