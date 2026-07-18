import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Box3DViewer from "../src/components/Box3DViewer";
import { useBoxStore } from "../src/lib/useBoxStore";

const themes = {
  dark: {
    bgApp: "#28231f",       
    bgCanvas: "#201c18",    
    bgPanel: "#28231f",     
    border: "rgba(232, 223, 213, 0.15)", 
    textMain: "#fdfbf7",    
    textMuted: "#a89f91",   
    cyan: "#d48c70",        
    inputBg: "#3a332d",     
    gridColor: "rgba(212, 140, 112, 0.15)", 
    activeBg: "rgba(169, 179, 150, 0.25)" 
  },
  light: {
    bgApp: "#fdfbf7",
    bgCanvas: "#fffcf7",
    bgPanel: "#fdfbf7",
    border: "rgba(58, 46, 38, 0.15)",
    textMain: "#3a2e26",
    textMuted: "#7a6a5f",
    cyan: "#a9b396",        
    inputBg: "#ffffff",
    gridColor: "rgba(169, 179, 150, 0.15)",
    activeBg: "rgba(212, 140, 112, 0.15)"
  }
};

const IconNav = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const IconCloud = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.78-3.5-3.5-3.5a5.5 5.5 0 0 0-5.38 4.41c-2 .19-3.62 1.63-3.62 3.59A3.5 3.5 0 0 0 7 19Z"/></svg>;

export default function Workshop() {
  const store = useBoxStore();
  const router = useRouter();
  const [foldProgress, setFoldProgress] = useState(1);
  const [activeSidebarTab, setActiveSidebarTab] = useState("Layout");
  const t = themes[store.theme || 'light'];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body, html, #__next { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; }
        * { box-sizing: border-box; }
      `}} />
      
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", backgroundColor: t.bgCanvas, color: t.textMain, fontFamily: "'Inter', sans-serif" }}>
        
        {/* --- TOP NAV --- */}
        <div style={{ height: "64px", background: t.bgPanel, borderBottom: `2px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", color: t.textMain }}>
               <div style={{ width: '32px', height: '32px', backgroundColor: t.cyan, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: store.theme==='dark'?'#28231f':'#fff', fontWeight: 'bold' }}>B</div>
               <span style={{ fontWeight: "400", fontSize: "20px", fontFamily: "Georgia, 'Times New Roman', serif" }}>Mockup Generator</span>
            </Link>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}><IconNav /></button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}><IconCloud /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button style={{ background: t.inputBg, border: `2px solid ${t.border}`, color: t.textMain, padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
              <span style={{ color: t.cyan }}>✦</span> 50 credits <span style={{ background: t.textMain, color: t.bgPanel, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>+</span>
            </button>
            <button style={{ background: t.inputBg, border: `2px solid ${t.border}`, color: t.textMain, padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
              3D Design ↗
            </button>
            <button onClick={() => store.toggleTheme()} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
              {store.theme === 'dark' ? 
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg> :
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            </button>
            <button style={{ background: t.cyan, color: store.theme==='dark'?'#3a2e26':'#fff', border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: `2px 3px 0px rgba(58,46,38,0.15)` }}>
              Super export
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* --- LEFT TOOLBAR --- */}
          <div style={{ width: "72px", background: t.bgPanel, borderRight: `2px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: "20px", zIndex: 10, overflowY: "auto" }}>
            {[
              { id: 'Assets', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
              { id: 'Layout', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
              { id: 'Video', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> }
            ].map((item, i) => (
              <div key={i} onClick={() => setActiveSidebarTab(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", color: activeSidebarTab === item.id ? t.cyan : t.textMuted }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: activeSidebarTab === item.id ? t.activeBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {item.icon}
                </div>
                <span style={{ fontSize: "10px", fontWeight: activeSidebarTab === item.id ? "700" : "500", textTransform: 'uppercase', letterSpacing: "0.5px" }}>{item.id}</span>
              </div>
            ))}
          </div>

          {/* --- LEFT PANEL --- */}
          <div style={{ width: "320px", background: t.bgPanel, padding: "24px", display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 10, borderRight: `2px solid ${t.border}` }}>
            
            {activeSidebarTab === "Assets" && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: t.textMuted, letterSpacing: "1px", marginBottom: "16px" }}>GRAPHICS EDITOR</div>
                <div style={{ border: `2px dashed ${t.cyan}`, borderRadius: "16px", padding: "40px", display: "flex", justifyContent: "center", marginBottom: "32px", cursor: "pointer", background: t.activeBg }} onClick={() => router.push('/editor')}>
                  <button style={{ background: t.cyan, color: '#fff', border: "none", padding: "14px 28px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: `0 4px 12px rgba(212, 140, 112, 0.3)` }}>Open Canvas</button>
                </div>

                <div style={{ fontSize: "12px", fontWeight: "700", color: t.textMuted, letterSpacing: "1px", marginBottom: "16px" }}>MATERIAL BASE</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div onClick={() => store.setMaterialType('corrugated', 0.0591)} style={{ flex: 1, cursor: "pointer", background: t.inputBg, border: store.materialType === 'corrugated' ? `2px solid ${t.cyan}` : `2px solid ${t.border}`, borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ height: "80px", background: "repeating-linear-gradient(45deg, #d4a373, #d4a373 5px, #c89565 5px, #c89565 10px)" }}></div>
                    <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: t.textMain }}>Corrugated</div>
                  </div>
                  <div onClick={() => store.setMaterialType('paperboard', 0.0181)} style={{ flex: 1, cursor: "pointer", background: t.inputBg, border: store.materialType === 'paperboard' ? `2px solid ${t.cyan}` : `2px solid ${t.border}`, borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ height: "80px", background: "#fdfbf7" }}></div>
                    <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: t.textMain }}>Paperboard</div>
                  </div>
                </div>
              </div>
            )}

            {activeSidebarTab === "Layout" && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: t.textMuted, letterSpacing: "1px", marginBottom: "16px" }}>SCENE LAYOUT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: 'single', label: 'Single', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'single' ? t.cyan : t.textMuted}><polygon points="12,8 4,12 12,16 20,12" /></svg> },
                    { id: 'stacked2', label: 'Stacked (2)', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'stacked2' ? t.cyan : t.textMuted}><polygon points="12,4 4,8 12,12 20,8" opacity="0.6"/><polygon points="12,12 4,16 12,20 20,16" /></svg> },
                    { id: 'stacked3', label: 'Stacked (3)', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'stacked3' ? t.cyan : t.textMuted}><polygon points="12,2 5,5 12,8 19,5" opacity="0.4"/><polygon points="12,9 5,12 12,15 19,12" opacity="0.7"/><polygon points="12,16 5,19 12,22 19,19" /></svg> },
                    { id: 'sidebyside', label: 'Side by Side', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'sidebyside' ? t.cyan : t.textMuted}><polygon points="8,10 2,13 8,16 14,13" /><polygon points="16,10 10,13 16,16 22,13" opacity="0.7"/></svg> },
                    { id: 'offset', label: 'Offset', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'offset' ? t.cyan : t.textMuted}><polygon points="12,6 5,10 12,14 19,10" opacity="0.6"/><polygon points="16,13 9,17 16,21 23,17" /></svg> },
                    { id: 'cascade', label: 'Cascade', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill={store.sceneLayout === 'cascade' ? t.cyan : t.textMuted}><polygon points="7,4 1,7 7,10 13,7" opacity="0.4"/><polygon points="12,9 6,12 12,15 18,12" opacity="0.7"/><polygon points="17,14 11,17 17,20 23,17" /></svg> },
                  ].map(l => (
                    <div key={l.id} onClick={() => store.setSceneLayout(l.id)} style={{ cursor: "pointer", background: t.inputBg, border: store.sceneLayout === l.id ? `2px solid ${t.cyan}` : `2px solid ${t.border}`, borderRadius: "12px", padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: store.sceneLayout === l.id ? `2px 3px 0px rgba(212, 140, 112, 0.2)` : `2px 3px 0px rgba(58,46,38,0.05)` }}>
                      {l.icon}
                      <div style={{ fontSize: "11px", fontWeight: "600", color: store.sceneLayout === l.id ? t.cyan : t.textMain, textAlign: "center" }}>{l.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSidebarTab === "Video" && (
              <div style={{ textAlign: "center", color: t.textMuted, marginTop: "40px", fontSize: "14px" }}>
                Video features coming soon...
              </div>
            )}

          </div>

          {/* --- MAIN CANVAS --- */}
          <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, backgroundImage: `radial-gradient(${t.gridColor} 1.5px, transparent 1.5px)`, backgroundSize: "32px 32px", backgroundPosition: "center" }} />

            <div style={{ flex: 1, zIndex: 2 }}>
              <Box3DViewer 
                L={store.L} W={store.W} H={store.H} T={store.T}
                progress={foldProgress}
                materialPreset={ (store.materialType || "").toLowerCase().includes("corrugated") ? "corrugated-kraft" : (store.materialType || "").toLowerCase().includes("kraft") ? "natural-kraft" : "white-kraft" }
                lightingPreset="studio"
                decals={store.decals}
                overrideLayout={activeSidebarTab === "Layout" ? null : "single"}
              />
            </div>

            {/* Bottom Toolbar */}
            <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: t.bgPanel, padding: "8px 24px", borderRadius: "12px", border: `2px solid ${t.border}`, boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>−</button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>+</button>
                <div style={{ width: "2px", height: "16px", background: t.border, margin: "0 4px" }} />
                <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: "600" }}>Open</span>
                <input type="range" min="0" max="1" step="0.01" value={foldProgress} onChange={(e) => setFoldProgress(parseFloat(e.target.value))} style={{ width: "80px", accentColor: t.cyan }} />
                <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: "600" }}>Close</span>
                <div style={{ width: "2px", height: "16px", background: t.border, margin: "0 4px" }} />
                <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4z"/></svg></button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M4 22V2l16 10L4 22z"/></svg></button>
              </div>
              <button style={{ background: t.inputBg, border: `2px solid ${t.border}`, color: t.textMain, padding: "8px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
                <span style={{ color: "#eab308" }}>👑</span> Watermark free
              </button>
            </div>
            
            {/* Help bubble bottom right */}
            <div style={{ position: "absolute", bottom: "32px", right: "32px", zIndex: 10, width: "48px", height: "48px", borderRadius: "24px", background: t.textMain, color: t.bgApp, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
          </div>

          {/* --- RIGHT TOOLBAR --- */}
          <div style={{ width: "64px", background: "transparent", position: "absolute", right: "24px", top: "24px", zIndex: 10, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: t.bgPanel, border: `2px solid ${t.border}`, borderRadius: "12px", padding: "8px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
              <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: t.activeBg, color: t.cyan, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
              </button>
              <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: "transparent", color: t.textMuted, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-4 0v4M14 10V4a2 2 0 0 0-4 0v6M10 10.5V5a2 2 0 0 0-4 0v9M6 14v1a6 6 0 0 0 6 6h1a6 6 0 0 0 6-6V9a2 2 0 0 0-4 0v2"/></svg>
              </button>
              <div style={{ width: "24px", height: "2px", background: t.border }} />
              <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: "transparent", color: t.textMuted, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l5 5M3 10l5-5"/></svg>
              </button>
              <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: "transparent", color: t.textMuted, opacity: 0.5, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10h-10a5 5 0 0 0-5 5v2M21 10l-5 5M21 10l-5-5"/></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
