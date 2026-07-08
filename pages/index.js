import React, { useRef, useState } from "react";
import DielineSVG from "../src/components/DielineSVG";
import Box3DViewer from "../src/components/Box3DViewer";
import { exportSVG, exportPDF } from "../src/lib/exportUtils";
import { useBoxStore } from "../src/lib/useBoxStore";

const themes = {
  dark: {
    bgApp: "#111113",    
    bgCanvas: "#222222", 
    bgPanel: "#18181b",  
    border: "#27272a",
    textMain: "#ffffff",
    textMuted: "#a1a1aa",
    cyan: "#06b6d4",
    inputBg: "#27272a"
  },
  light: {
    bgApp: "#ffffff",    
    bgCanvas: "#f1f5f9", 
    bgPanel: "#f8fafc",  
    border: "#e2e8f0",
    textMain: "#0f172a",
    textMuted: "#64748b",
    cyan: "#0284c7",
    inputBg: "#f1f5f9"
  }
};

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={onChange} 
    style={{
      width: "36px", height: "20px", borderRadius: "10px",
      background: checked ? "#3b82f6" : "#d1d5db",
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

export default function Home() {
  const store = useBoxStore();
  const svgRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const t = themes[store.theme];

  // --- THE PACDORA 2T MATH REVEALED IN THE VIDEO ---
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body, html, #__next { 
          margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; 
          overflow: hidden !important; background-color: ${t.bgApp}; color: ${t.textMain}; font-family: 'Inter', system-ui, sans-serif; 
        }
        * { box-sizing: border-box; }
        input[type=number] { 
          background: ${t.inputBg}; border: 1px solid ${t.border}; color: ${t.textMain}; 
          padding: 10px 12px; border-radius: 6px; width: 100%; outline: none; font-size: 14px; 
        }
        input[type=number]:focus { border-color: ${t.cyan}; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .format-btn { 
          background: ${t.bgApp}; border: 1px solid ${t.border}; color: ${t.textMain}; 
          padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; justify-content: center; transition: all 0.2s; 
        }
        .format-btn:hover { border-color: ${t.cyan}; }
        .size-mode-btn { 
          flex: 1; background: transparent; border: 1px solid ${t.border}; color: ${t.textMuted}; padding: 12px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .size-mode-btn.active { border-color: ${t.cyan}; color: ${t.cyan}; background: ${store.theme === 'dark' ? '#06b6d411' : '#e0f2fe'}; }
        .toolbar-btn { 
          background: transparent; border: none; color: ${t.textMain}; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; 
        }
        .toolbar-btn:hover { background: ${t.inputBg}; }
      `}} />
      
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        
        <div style={{ height: "60px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: t.bgApp }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: "bold", letterSpacing: "-0.5px" }}>
              <div style={{ width: 28, height: 28, background: t.cyan, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>B</div>
              BoxCraft Pro
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: "500" }}>
              <span style={{ color: t.textMuted, cursor: "pointer" }}>Workspace</span>
              <span style={{ color: t.cyan, cursor: "pointer" }}>Dielines</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={store.toggleTheme} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.textMain, padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: "600", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
              {store.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button style={{ background: t.cyan, border: "none", color: "#ffffff", padding: "8px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: "700" }}>Export</button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          <div style={{ width: "300px", borderRight: `1px solid ${t.border}`, padding: "24px", overflow: "visible", overflowY: "auto", background: t.bgPanel }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: "600" }}>Custom size</h3>
              <div style={{ background: t.inputBg, borderRadius: 6, display: "flex", overflow: "hidden", border: `1px solid ${t.border}` }}>
                <span style={{ padding: "4px 10px", fontSize: 11, color: t.textMuted, cursor: "pointer" }}>mm</span>
                <span style={{ padding: "4px 10px", fontSize: 11, background: t.cyan, color: "#fff", fontWeight: "bold", cursor: "pointer" }}>in</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "500" }}>Length</label>
                <div style={{ position: "relative" }}>
                  <input type="number" step="0.01" defaultValue={store.L} key={`L-${store.L}`} onBlur={(e) => store.setDim("L", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                  <span style={{ position: "absolute", right: 12, top: 11, color: t.textMuted, fontSize: 12 }}>in</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "500" }}>Width</label>
                <div style={{ position: "relative" }}>
                  <input type="number" step="0.01" defaultValue={store.W} key={`W-${store.W}`} onBlur={(e) => store.setDim("W", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                  <span style={{ position: "absolute", right: 12, top: 11, color: t.textMuted, fontSize: 12 }}>in</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: "500" }}>Height</label>
              <div style={{ position: "relative" }}>
                <input type="number" step="0.01" defaultValue={store.H} key={`H-${store.H}`} onBlur={(e) => store.setDim("H", e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
                <span style={{ position: "absolute", right: 12, top: 11, color: t.textMuted, fontSize: 12 }}>in</span>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: "0 0 24px 0" }} />

            <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: "600", display: "flex", alignItems: "center", gap: 6 }}>
              Choose material <span style={{ color: t.textMuted, fontSize: 14, cursor: "help" }}>ⓘ</span>
            </h3>
            
            <select 
              onChange={(e) => {
                const type = e.target.value;
                const defaultT = type === "paperboard" ? 0.0197 : 0.0591;
                store.setMaterialType(type, defaultT);
              }} 
              value={store.materialType || "paperboard"} 
              style={{ width: "100%", padding: "12px", background: t.inputBg, border: `1px solid ${t.border}`, color: t.textMain, borderRadius: 6, fontSize: 13, fontWeight: "500", appearance: "none", cursor: "pointer", outline: "none" }}
            >
              <option value="paperboard">⚪ Custom white paperboard</option>
              <option value="corrugated">🟤 Custom corrugated board</option>
            </select>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: "600" }}>Custom thickness</h3>
              <span style={{ display: "block", marginBottom: 12, fontSize: 13, color: t.textMuted }}>
                {store.materialType === 'paperboard' ? '(0.0079~0.0315in)' : '(0.0315~0.1182in)'}
              </span>
              
              <div style={{ display: "flex", alignItems: "center", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, overflow: "hidden" }}>
                <button 
                  onClick={() => {
                    const min = store.materialType === 'paperboard' ? 0.0079 : 0.0315;
                    store.setMaterial(Math.max(min, store.T - 0.0001));
                  }} 
                  style={{ width: "36px", padding: "10px 0", background: "transparent", border: "none", borderRight: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
                >
                  −
                </button>
                <input 
                  type="number" 
                  step="0.0001"
                  defaultValue={store.T} 
                  key={`T-${store.T}`} // Detaches typing from render loop, re-syncs when bounds are enforced
                  onBlur={(e) => {
                    const min = store.materialType === 'paperboard' ? 0.0079 : 0.0315;
                    const max = store.materialType === 'paperboard' ? 0.0315 : 0.1182;
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = store.T;
                    // Mathematically clamp to exact bounds for both materials upon blur/enter
                    store.setMaterial(Math.min(max, Math.max(min, val)));
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  style={{ flex: 1, background: "transparent", border: "none", color: t.textMain, textAlign: "center", fontSize: 13, outline: "none", padding: 0 }} 
                />
                <button 
                  onClick={() => {
                    const max = store.materialType === 'paperboard' ? 0.0315 : 0.1182;
                    store.setMaterial(Math.min(max, store.T + 0.0001));
                  }} 
                  style={{ width: "36px", padding: "10px 0", background: "transparent", border: "none", borderLeft: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
                >
                  +
                </button>
              </div>
            </div>

            <hr style={{ borderColor: t.border, margin: "24px 0" }} />

            <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: "600", display: "flex", alignItems: "center", gap: 6 }}>
              Size mode <span style={{ color: t.textMuted, fontSize: 14, cursor: "help" }}>ⓘ</span>
            </h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <button className={`size-mode-btn ${store.sizeMode === 'manufacture' ? 'active' : ''}`} onClick={() => store.setSizeMode("manufacture")}>Manufacture<br/>dimensions</button>
              <button className={`size-mode-btn ${store.sizeMode === 'inner' ? 'active' : ''}`} onClick={() => store.setSizeMode("inner")}>Inner<br/>dimensions</button>
            </div>
            <button className={`size-mode-btn ${store.sizeMode === 'outer' ? 'active' : ''}`} style={{ width: "100%", padding: "12px" }} onClick={() => store.setSizeMode("outer")}>Outer dimensions</button>
          </div>

          <div style={{ flex: 1, position: "relative", background: t.bgCanvas }}>
            
            <div style={{ position: "absolute", top: 24, left: 24, display: "flex", gap: 16, zIndex: 10, fontSize: 12, fontWeight: "600", color: t.textMain }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, background: store.bleedColor }}></div> Bleed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, background: store.trimColor }}></div> Trim</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, borderBottom: `2px dashed ${store.creaseColor}` }}></div> Crease</span>
            </div>

            <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, fontSize: 11, textAlign: "right", color: t.textMuted, display: "flex", flexDirection: "column", gap: 12 }}>
              <div><strong style={{ color: t.textMain, display: "block", marginBottom: 2 }}>Manufacture dimensions</strong>{manuL.toFixed(4)} × {manuW.toFixed(4)} × {manuH.toFixed(4)} in</div>
              <div><strong style={{ color: t.textMain, display: "block", marginBottom: 2 }}>Inner dimensions</strong>{innerL.toFixed(4)} × {innerW.toFixed(4)} × {innerH.toFixed(4)} in</div>
              <div><strong style={{ color: t.textMain, display: "block", marginBottom: 2 }}>Outer dimensions</strong>{outerL.toFixed(4)} × {outerW.toFixed(4)} × {outerH.toFixed(4)} in</div>
            </div>

            <DielineSVG ref={svgRef} />

            <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", background: t.bgPanel, border: `1px solid ${t.border}`, borderRadius: "8px", display: "flex", alignItems: "center", padding: "6px", gap: "4px", zIndex: 40, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
              <div style={{ position: "relative" }}>
                <button className="toolbar-btn" onClick={() => setActiveMenu(activeMenu === 'colors' ? null : 'colors')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2-14a2 2 0 100-4 2 2 0 000 4zm-4 4a2 2 0 100-4 2 2 0 000 4zm8 8a2 2 0 100-4 2 2 0 000 4zm4-4a2 2 0 100-4 2 2 0 000 4z"/></svg>
                </button>
                {activeMenu === 'colors' && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 12px)", left: "0%", background: t.bgPanel, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", display: "flex", gap: "16px", zIndex: 50 }}>
                    <div style={{ textAlign: "center" }}><input type="color" value={store.trimColor} onChange={(e) => store.setColor("trimColor", e.target.value)} style={{ width: 32, height: 32, padding: 0, border: "none", cursor: "pointer", background: "transparent" }} /><span style={{ fontSize: 11, display: "block", color: t.textMuted, marginTop: 4 }}>Trim</span></div>
                    <div style={{ textAlign: "center" }}><input type="color" value={store.creaseColor} onChange={(e) => store.setColor("creaseColor", e.target.value)} style={{ width: 32, height: 32, padding: 0, border: "none", cursor: "pointer", background: "transparent" }} /><span style={{ fontSize: 11, display: "block", color: t.textMuted, marginTop: 4 }}>Crease</span></div>
                    <div style={{ textAlign: "center" }}><input type="color" value={store.bleedColor} onChange={(e) => store.setColor("bleedColor", e.target.value)} style={{ width: 32, height: 32, padding: 0, border: "none", cursor: "pointer", background: "transparent" }} /><span style={{ fontSize: 11, display: "block", color: t.textMuted, marginTop: 4 }}>Bleed</span></div>
                  </div>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <button className="toolbar-btn" onClick={() => setActiveMenu(activeMenu === 'views' ? null : 'views')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/></svg>
                </button>
                {activeMenu === 'views' && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 12px)", left: "-20px", background: t.bgPanel, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: "16px", width: "240px", zIndex: 50 }}>
                    <div style={{ position: "absolute", bottom: "-6px", left: "26px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${t.bgPanel}` }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ToggleSwitch checked={store.showOverallDims} onChange={() => store.toggleView("showOverallDims")} /> <span style={{ fontSize: 13, color: t.textMain }}>Show overall dimensions</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ToggleSwitch checked={store.showBasicDims} onChange={() => store.toggleView("showBasicDims")} /> <span style={{ fontSize: 13, color: t.textMain }}>Show basic dimensions</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ToggleSwitch checked={store.showBleedLine} onChange={() => store.toggleView("showBleedLine")} /> <span style={{ fontSize: 13, color: t.textMain }}>Show bleed line</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ToggleSwitch checked={store.showAnnotations} onChange={() => store.toggleView("showAnnotations")} /> <span style={{ fontSize: 13, color: t.textMain }}>Show annotation information</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ width: "320px", padding: "24px", background: t.bgPanel, borderLeft: `1px solid ${t.border}`, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: t.bgApp, borderRadius: 8, border: `1px solid ${t.border}`, height: "220px", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "absolute", top: 12, right: 12, background: t.bgPanel, border: `1px solid ${t.border}`, padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: "600", zIndex: 10 }}>3D Preview</div>
              <div style={{ width: "100%", height: "100%" }}><Box3DViewer L={manuL} W={manuW} H={manuH} /></div>
            </div>
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: "600" }}>File formats</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                <button className="format-btn"><span style={{ color: "#f97316", background: store.theme === 'dark' ? "#f9731622" : "#ffedd5", padding: "2px 4px", borderRadius: 4 }}>Ai</span> Dieline</button>
                <button className="format-btn"><span style={{ color: "#ef4444", background: store.theme === 'dark' ? "#ef444422" : "#fee2e2", padding: "2px 4px", borderRadius: 4 }}>PDF</span> Dieline</button>
                <button className="format-btn"><span style={{ color: "#a1a1aa", background: store.theme === 'dark' ? "#a1a1aa22" : "#f4f4f5", padding: "2px 4px", borderRadius: 4 }}>DXF</span> Dieline</button>
                <button className="format-btn"><span style={{ color: "#10b981", background: store.theme === 'dark' ? "#10b98122" : "#d1fae5", padding: "2px 4px", borderRadius: 4 }}>3D</span> Mockup</button>
              </div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: "600" }}>You will get</h3>
              <ul style={{ margin: 0, paddingLeft: 16, color: t.textMuted, fontSize: 11, lineHeight: "1.6", marginBottom: 32 }}>
                <li style={{ marginBottom: 8 }}>All dieline files can be generated and downloaded within a few minutes.</li>
                <li>All dieline files are rigorously structurally inspected. Dimensions, thickness, and material descriptions are included. Ready for printing.</li>
              </ul>
              <button onClick={() => exportSVG(svgRef.current, "boxcraft_production_dieline.svg")} style={{ width: "100%", background: t.cyan, color: "#ffffff", border: "none", padding: "14px", borderRadius: 6, fontSize: 14, fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={(e) => e.target.style.opacity = 0.9} onMouseOut={(e) => e.target.style.opacity = 1}>Download SVG Dieline</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}