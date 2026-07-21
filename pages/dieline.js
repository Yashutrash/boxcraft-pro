import React, { useRef, useState, useEffect } from "react";
import DielineSVG from "../src/components/DielineSVG";
import Box3DViewer from "../src/components/Box3DViewer";
import { exportSVG, exportPDF, exportDXF } from "../src/lib/exportUtils";
import { generateRTEDieline } from "../src/lib/rteDielineGenerator";
import { generateTEDielineDXF } from "../src/lib/teDielineGenerator";
import { useBoxStore } from "../src/lib/useBoxStore";

const themes = {
  dark: {
    bgApp: "#28231f",       // Warm dark charcoal
    bgCanvas: "#201c18",    // Slightly darker canvas
    bgPanel: "#28231f",     // Side panels
    border: "rgba(232, 223, 213, 0.15)", // Soft light border
    textMain: "#fdfbf7",    // Warm off-white
    textMuted: "#a89f91",   // Muted warm grey
    cyan: "#d48c70",        // Terracotta accent
    inputBg: "#3a332d",     // Slightly lighter dark
    gridColor: "rgba(212, 140, 112, 0.15)", // Terracotta dots
    activeBg: "rgba(169, 179, 150, 0.25)" // Sage green active state
  },
  light: {
    bgApp: "#fdfbf7",
    bgCanvas: "#fffcf7",
    bgPanel: "#fdfbf7",
    border: "rgba(58, 46, 38, 0.15)",
    textMain: "#3a2e26",
    textMuted: "#7a6a5f",
    cyan: "#a9b396",        // Sage green accent
    inputBg: "#ffffff",
    gridColor: "rgba(169, 179, 150, 0.15)",
    activeBg: "rgba(212, 140, 112, 0.15)"
  }
};

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={onChange} 
    style={{
      width: "36px", height: "20px", borderRadius: "10px",
      background: checked ? "#d48c70" : "#dcd3cb",
      position: "relative", cursor: "pointer", flexShrink: 0,
      transition: "background 0.2s ease"
    }}
  >
    <div style={{
      width: "16px", height: "16px", borderRadius: "50%", background: "#ffffff", 
      position: "absolute", top: "2px", left: checked ? "18px" : "2px", 
      transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(58,46,38,0.2)"
    }} />
  </div>
);

export default function Home() {
  const store = useBoxStore();
  const svgRef = useRef(null);
  
  // Custom interactive dashboard states
  const [layoutMode, setLayoutMode] = useState("split"); // "split" | "2d" | "3d"
  const [materialPreset, setMaterialPreset] = useState("white-kraft");
  const [lightingPreset, setLightingPreset] = useState("studio");
  const [foldProgress, setFoldProgress] = useState(0.85); // 85% folded as engaging default
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const t = themes[store.theme];

  // --- MATHEMATICAL COMPOSITIONS ---
  const { L, W, H, T, sizeMode } = store;
  let manuL = L, manuW = W, manuH = H;
  let innerL = L, innerW = W, innerH = H;
  let outerL = L, outerW = W, outerH = H;

  // Real-time thickness boundary math
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
    let direction = 1; // 1 = folding, -1 = unfolding
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

  // Export handlers
  const handleExportDXF = () => {
    let dieline;
    if (store.boxModel === 'te') {
      dieline = generateTEDielineDXF({
        L: manuL, W: manuW, H: manuH, T: store.T,
        glueFlapWidth: store.glueFlapWidth, bleed: store.bleed
      });
    } else {
      dieline = generateRTEDieline({
        L: manuL, W: manuW, H: manuH, T: store.T,
        glueFlapWidth: store.glueFlapWidth, bleed: store.bleed,
        method: store.generatorMethod
      });
    }
    exportDXF(dieline, `boxcraft_${store.boxModel}_dieline.dxf`);
  };

  const handleExportMockup = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Please ensure the 3D viewport is open to export screenshots.");
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

  const handleCopySVG = () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true);
    svgClone.removeAttribute("class");
    svgClone.style.background = "transparent";
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svgClone);
    navigator.clipboard.writeText(str).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body, html, #__next { 
          margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; 
          overflow: hidden !important; background-color: ${t.bgApp}; color: ${t.textMain}; font-family: 'Inter', system-ui, sans-serif; 
        }
        * { box-sizing: border-box; }
        
        /* Premium Custom Scrollbars */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(58,46,38,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.cyan}; }

        /* Dot Grid Infinite Canvas */
        .cad-grid-bg {
          background-color: ${t.bgCanvas};
          background-image: radial-gradient(${t.gridColor} 1.5px, transparent 1.5px);
          background-size: 32px 32px;
          background-position: center;
        }

        /* Number Inputs */
        input[type=number] { 
          background: ${t.inputBg}; border: 2px solid ${t.border}; color: ${t.textMain}; 
          padding: 10px 12px; border-radius: 12px 8px 10px 14px; width: 100%; outline: none; font-size: 13px; 
          transition: all 0.2s ease; font-weight: 500;
        }
        input[type=number]:focus { border-color: ${t.cyan}; box-shadow: 2px 3px 0px rgba(58,46,38,0.1); }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

        /* Hand-crafted Buttons */
        .format-btn { 
          background: ${t.inputBg}; border: 2px solid ${t.border}; color: ${t.textMain}; 
          padding: 12px 10px; border-radius: 14px 10px 12px 16px; font-size: 13px; font-weight: 600; cursor: pointer; 
          display: flex; align-items: center; gap: 8px; justify-content: flex-start; transition: all 0.2s; 
          box-shadow: 2px 3px 0px rgba(58,46,38,0.05);
        }
        .format-btn:hover { border-color: ${t.cyan}; background: ${t.activeBg}; transform: translateY(-1px); box-shadow: 3px 4px 0px rgba(58,46,38,0.1); }

        .size-mode-btn { 
          flex: 1; background: transparent; border: 2px solid transparent; color: ${t.textMuted}; padding: 10px 6px; border-radius: 10px 14px 8px 12px; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .size-mode-btn.active { border-color: ${t.cyan}; color: ${t.textMain}; background: ${t.activeBg}; }

        .toolbar-btn { 
          background: ${t.inputBg}; border: 2px solid ${t.border}; color: ${t.textMain}; padding: 10px; border-radius: 12px 8px 14px 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; 
          box-shadow: 2px 3px 0px rgba(58,46,38,0.05);
        }
        .toolbar-btn:hover { border-color: ${t.cyan}; background: ${t.activeBg}; transform: translateY(-1px); }

        .view-slider {
          -webkit-appearance: none; appearance: none; flex: 1; height: 6px; border-radius: 3px; background: #e5dfd5; outline: none; cursor: pointer;
        }
        .view-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${t.cyan}; cursor: pointer; transition: transform 0.15s ease; box-shadow: 1px 2px 0px rgba(58,46,38,0.2);
        }
        .view-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
      `}} />

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: t.bgApp }}>
        
        {/* --- HEADER --- */}
        <div style={{ height: "64px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: t.bgPanel, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <span style={{ fontSize: "18px", fontWeight: "400", letterSpacing: "-0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}>Dieline generator</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: t.textMuted, opacity: 0.8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.78-3.5-3.5-3.5a5.5 5.5 0 0 0-5.38 4.41c-2 .19-3.62 1.63-3.62 3.59A3.5 3.5 0 0 0 7 19Z"/></svg>
            </div>
          
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button onClick={store.toggleTheme} style={{ background: "transparent", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: 4 }}>
              {store.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button 
              onClick={() => window.location.href = '/editor'}
              style={{
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              color: t.textMain,
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              Design Online
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>

            <button style={{
              background: "transparent",
              border: "none",
              color: t.textMain,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>

            <button 
              onClick={() => exportSVG(svgRef.current, "boxcraft_dieline.svg")}
              style={{
                background: `linear-gradient(135deg, ${t.cyan}, #0284c7)`,
                color: "#ffffff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: `0 4px 12px ${t.cyan}30`
              }}
            >
              <span style={{ fontSize: "11px" }}>👑</span> Download the dieline
            </button>
          </div>
        </div>

        {/* --- MAIN WORKSPACE --- */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* --- FAR LEFT: NARROW VERTICAL NAV BAR --- */}
          <div style={{
            width: "72px",
            borderRight: `1px solid ${t.border}`,
            background: t.bgPanel,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 0",
            zIndex: 10,
            flexShrink: 0
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.textMuted, fontSize: "11px", gap: "6px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span>Models</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.cyan, fontSize: "11px", gap: "6px", fontWeight: "700" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                <span>Basic</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.textMuted, fontSize: "11px", gap: "6px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Advanced</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.textMuted, fontSize: "11px", gap: "6px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                <span>More</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: t.textMuted }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
          </div>

          {/* --- LEFT PANEL: SETTINGS PANEL --- */}
          <div style={{ width: "260px", borderRight: `1px solid ${t.border}`, padding: "20px", overflowY: "auto", background: t.bgPanel, display: "flex", flexDirection: "column", gap: 20, zIndex: 5, flexShrink: 0 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "400", letterSpacing: "0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}>Custom size</h3>
                <div style={{ background: t.inputBg, borderRadius: 6, display: "flex", overflow: "hidden", border: `1px solid ${t.border}`, padding: 2 }}>
                  <span style={{ padding: "2px 6px", fontSize: 10, color: t.textMuted, cursor: "pointer" }}>mm</span>
                  <span style={{ padding: "2px 6px", fontSize: 10, background: t.cyan, color: "#fff", fontWeight: "700", borderRadius: 4, cursor: "pointer" }}>in</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: "600" }}>Length</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" step="0.01" defaultValue={store.L} key={`L-${store.L}`} onBlur={(e) => store.setDim("L", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                    <span style={{ position: "absolute", right: 8, top: 10, color: t.textMuted, fontSize: 11, fontWeight: "600" }}>in</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: "600" }}>Width</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" step="0.01" defaultValue={store.W} key={`W-${store.W}`} onBlur={(e) => store.setDim("W", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                    <span style={{ position: "absolute", right: 8, top: 10, color: t.textMuted, fontSize: 11, fontWeight: "600" }}>in</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: "600" }}>Height</label>
                <div style={{ position: "relative" }}>
                  <input type="number" step="0.01" defaultValue={store.H} key={`H-${store.H}`} onBlur={(e) => store.setDim("H", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                  <span style={{ position: "absolute", right: 8, top: 10, color: t.textMuted, fontSize: 11, fontWeight: "600" }}>in</span>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: 0 }} />

            {/* --- MATERIAL & THICKNESS --- */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "400", fontFamily: "Georgia, 'Times New Roman', serif" }}>Choose material</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <select 
                    onChange={(e) => {
                      const type = e.target.value;
                      const defaultT = type === "paperboard" ? 0.0181 : 0.0591;
                      store.setMaterialType(type, defaultT);
                    }} 
                    value={store.materialType || "paperboard"} 
                    style={{ width: "100%", padding: "10px", background: t.inputBg, border: `1px solid ${t.border}`, color: t.textMain, borderRadius: 8, fontSize: 12, fontWeight: "600", appearance: "none", cursor: "pointer", outline: "none" }}
                  >
                    <option value="paperboard">⚪ 350g kraft paperboard</option>
                    <option value="corrugated">🟤 Corrugated E-flute board</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: t.textMuted, fontWeight: "600" }}>Thickness</label>
                    <span style={{ fontSize: 11, color: t.cyan, fontWeight: "700" }}>{store.T.toFixed(4)} in</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, overflow: "hidden" }}>
                    <button 
                      onClick={() => {
                        const min = store.materialType === 'paperboard' ? 0.0079 : 0.0315;
                        store.setMaterial(Math.max(min, store.T - 0.001));
                      }} 
                      style={{ width: "32px", padding: "8px 0", background: "transparent", border: "none", borderRight: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={store.T} 
                      onChange={(e) => store.setMaterial(e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", color: t.textMain, textAlign: "center", fontSize: 12, fontWeight: "700", outline: "none", padding: 0 }} 
                    />
                    <button 
                      onClick={() => {
                        const max = store.materialType === 'paperboard' ? 0.0315 : 0.1182;
                        store.setMaterial(Math.min(max, store.T + 0.001));
                      }} 
                      style={{ width: "32px", padding: "8px 0", background: "transparent", border: "none", borderLeft: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: 0 }} />

            {/* --- SIZE CALCULATOR MODE --- */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "400", fontFamily: "Georgia, 'Times New Roman', serif" }}>Size mode</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className={`size-mode-btn ${store.sizeMode === 'manufacture' ? 'active' : ''}`} style={{ width: "100%", textAlign: "left", padding: "8px 12px" }} onClick={() => store.setSizeMode("manufacture")}>Manufacture dimensions</button>
                <button className={`size-mode-btn ${store.sizeMode === 'inner' ? 'active' : ''}`} style={{ width: "100%", textAlign: "left", padding: "8px 12px" }} onClick={() => store.setSizeMode("inner")}>Inner dimensions</button>
                <button className={`size-mode-btn ${store.sizeMode === 'outer' ? 'active' : ''}`} style={{ width: "100%", textAlign: "left", padding: "8px 12px" }} onClick={() => store.setSizeMode("outer")}>Outer dimensions</button>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: 0 }} />

            {/* --- DISPLAY OPTIONS --- */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "400", fontFamily: "Georgia, 'Times New Roman', serif" }}>Display options</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: "600" }}>Overall dimensions</span>
                  <ToggleSwitch checked={store.showOverallDims} onChange={() => store.toggleView("showOverallDims")} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: "600" }}>Basic dimensions</span>
                  <ToggleSwitch checked={store.showBasicDims} onChange={() => store.toggleView("showBasicDims")} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: "600" }}>Bleed contours</span>
                  <ToggleSwitch checked={store.showBleedLine} onChange={() => store.toggleView("showBleedLine")} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: "600" }}>Annotations</span>
                  <ToggleSwitch checked={store.showAnnotations} onChange={() => store.toggleView("showAnnotations")} />
                </div>
              </div>
            </div>

          </div>

          {/* --- CENTER AREA: CAD CANVAS --- */}
          <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: t.bgCanvas }}>
            
            <div className="cad-grid-bg" style={{ flex: 1, position: "relative" }}>
              
              {/* Dieline Canvas Floating Legend */}
              <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 14, zIndex: 10, fontSize: 11, fontWeight: "700" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 14, height: 2, background: store.trimColor }}></div> Trim</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 14, height: 2, borderBottom: `2px dashed ${store.creaseColor}` }}></div> Crease</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 14, height: 2, background: store.bleedColor }}></div> Bleed</span>
              </div>

              <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                <button className="toolbar-btn" onClick={() => setResetKey(k => k + 1)} title="Center Dieline" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "700" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  Reset View
                </button>
              </div>

              {/* Render Dieline 2D SVG */}
              <DielineSVG ref={svgRef} key={resetKey} />

              {/* FLOATING CAD TOOLBAR AT BOTTOM CENTER */}
              <div style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#18181b",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                display: "flex",
                padding: "6px 10px",
                gap: "12px",
                alignItems: "center",
                zIndex: 10,
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
              }}>
                {/* Select Tool (Cursor) */}
                <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", padding: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
                </button>
                {/* Pan Tool (Hand) */}
                <button style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px", border: "none", color: "#fff", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6.5"/><path d="M6 15V12a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6c0 4.42 3.58 8 8 8h3a8 8 0 0 0 8-8v-3.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V12"/></svg>
                </button>
                
                <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.15)" }}></div>
                
                {/* Zoom In */}
                <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", padding: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                {/* Zoom Out */}
                <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", padding: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                
                <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.15)" }}></div>
                
                {/* Pen Tool */}
                <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", padding: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                {/* Measure Tool */}
                <button style={{ background: "transparent", border: "none", color: t.textMain, cursor: "pointer", padding: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/></svg>
                </button>
              </div>

            </div>

          </div>

          {/* --- SIDEBAR RIGHT: 3D MODEL VIEW AND INFO CARDS --- */}
          <div style={{ width: "340px", borderLeft: `1px solid ${t.border}`, padding: "20px", overflowY: "auto", background: t.bgPanel, display: "flex", flexDirection: "column", gap: 20, zIndex: 5, flexShrink: 0 }}>
            
            {/* 3D BOX VIEWER CARD */}
            <div style={{
              background: t.inputBg,
              border: `2px solid ${t.border}`,
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "400", letterSpacing: "0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}>3D box preview</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    style={{ background: isPlaying ? t.activeBg : t.inputBg, border: `1px solid ${t.border}`, color: isPlaying ? t.cyan : t.textMain, padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
                  >
                    {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                  </button>
                </div>
              </div>

              {/* 3D Canvas Subcard */}
              <div style={{
                width: "100%",
                height: "190px",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(145deg, #e8e4de, #d6d1ca)"
              }}>
                <Box3DViewer 
                  L={manuL} 
                  W={manuW} 
                  H={manuH} 
                  T={T} 
                  progress={foldProgress}
                  materialPreset={
                    (store.materialType || "").toLowerCase().includes("corrugated") ? "corrugated-kraft" :
                    (store.materialType || "").toLowerCase().includes("kraft")      ? "natural-kraft" :
                    "white-kraft"
                  }
                  lightingPreset={lightingPreset}
                />
                
                {/* 3D badge */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#333",
                  fontSize: "10px",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  3D
                </div>
              </div>

              {/* Slider Controls */}
              <div style={{
                background: t.bgApp,
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#a1a1aa" }}>Open</span>
                <input 
                  type="range" min="0" max="1" step="0.001" 
                  value={foldProgress} 
                  onChange={(e) => {
                    setFoldProgress(parseFloat(e.target.value));
                  }} 
                  className="view-slider"
                />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#a1a1aa" }}>Close</span>
              </div>
            </div>

            {/* FILE FORMATS CARD */}
            <div style={{
              background: t.inputBg,
              border: `2px solid ${t.border}`,
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "400", letterSpacing: "0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}>File formats</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button onClick={() => exportSVG(svgRef.current, 'boxcraft_illustrator_dieline.svg')} className="format-btn">
                  <span style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.12)", padding: "4px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>AI</span>
                  <span>AI dieline</span>
                </button>
                <button onClick={() => exportPDF(svgRef.current, 'boxcraft_print_ready.pdf')} className="format-btn">
                  <span style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", padding: "4px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>PDF</span>
                  <span>PDF dieline</span>
                </button>
                <button onClick={handleExportDXF} className="format-btn">
                  <span style={{ color: "#3b82f6", background: "rgba(59, 130, 246, 0.12)", padding: "4px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>DXF</span>
                  <span>DXF dieline</span>
                </button>
                <button onClick={handleExportMockup} className="format-btn">
                  <span style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "4px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>3D</span>
                  <span>3D mockup</span>
                </button>
              </div>
            </div>

            {/* YOU WILL GET CARD */}
            <div style={{
              background: t.inputBg,
              border: `2px solid ${t.border}`,
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "400", letterSpacing: "0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}>You will get</h3>
              
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: t.textMuted, display: "flex", flexDirection: "column", gap: "10px", lineHeight: "1.5" }}>
                <li>
                  All dieline files can be generated and downloaded within a few minutes.
                </li>
                <li>
                  All dieline files are rigorously structurally inspected. Dimensions, thickness, and material descriptions are included. Ready for printing.
                </li>
                <li>
                  All dieline files are without watermarks and can be locally edited using Adobe Illustrator.
                </li>
              </ul>
            </div>

            {/* DYNAMIC MATHEMATICAL REVEAL (Collapsed/integrated cleanly at bottom) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: t.inputBg, padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}` }}>
                <div>
                  <strong style={{ display: "block", fontSize: 9, color: t.textMuted }}>MANUFACTURE CUT SIZE</strong>
                  <span>{manuL.toFixed(3)} × {manuW.toFixed(3)} × {manuH.toFixed(3)} in</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: t.inputBg, padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}` }}>
                <div>
                  <strong style={{ display: "block", fontSize: 9, color: t.cyan }}>INNER CAVITY SIZE</strong>
                  <span>{innerL.toFixed(3)} × {innerW.toFixed(3)} × {innerH.toFixed(3)} in</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: t.inputBg, padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}` }}>
                <div>
                  <strong style={{ display: "block", fontSize: 9, color: t.textMuted }}>OUTER BOUNDING BOX</strong>
                  <span>{outerL.toFixed(3)} × {outerW.toFixed(3)} × {outerH.toFixed(3)} in</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* --- COPY SVG TOAST NOTIFICATION --- */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          background: "#10b981", color: "#ffffff", padding: "12px 24px",
          borderRadius: "8px", fontSize: "12px", fontWeight: "700", zIndex: 1000,
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: 8,
          animation: "slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          SVG code copied to clipboard!
        </div>
      )}

      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    </>
  );
}