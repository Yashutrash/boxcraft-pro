import React, { useState, useRef } from "react";
import Link from "next/link";
import Box3DViewer from "../src/components/Box3DViewer";
import DielineSVG from "../src/components/DielineSVG";
import { useBoxStore } from "../src/lib/useBoxStore";
import { generateRTEDieline } from "../src/lib/rteDielineGenerator";

// --- Simple SVG Icons ---
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconLayers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconSparkles = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18"/><path d="M3 12h18"/><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>;
const IconLayout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;

const IconPointer = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>;
const IconHand = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-4 0v4"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V5a2 2 0 0 0-4 0v9"/><path d="M6 14v1a6 6 0 0 0 6 6h1a6 6 0 0 0 6-6V9a2 2 0 0 0-4 0v2"/></svg>;
const IconUndo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const IconRedo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>;

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

export default function Editor() {
  const store = useBoxStore();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Uploads");
  const [foldProgress, setFoldProgress] = useState(1);
  const [galleryImages, setGalleryImages] = useState([]);
  const decals = store.decalsByModel[store.boxModel] || [];
  const setDecals = store.setDecals;
  const [activeSurface, setActiveSurface] = useState("Outside");
  const t = themes[store.theme || 'light'];

  // Toolbar State
  const [activeTool, setActiveTool] = useState("pointer"); 
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = (newDecals) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDecals);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setDecals(newDecals);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDecals(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setDecals([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDecals(history[historyIndex + 1]);
    }
  };

  const handlePointerDown = (e) => {
    if (activeTool === "hand") {
      setIsPanning(true);
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning && activeTool === "hand") {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handlePointerUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const activeColor = activeSurface === "Outside" ? store.packageColor : store.insideColor;
  const handleColorSelect = (color) => {
    if (activeSurface === "Outside") store.setPackageColor(color);
    else store.setInsideColor(color);
  };

  const packageColors = [
    { type: "picker" },
    { type: "transparent" },
    { type: "color", value: "#ffffff" },
    { type: "color", value: "#f1e5d6" },
    { type: "color", value: "#ecc950" },
    { type: "color", value: "#f6dbe6" },
    { type: "color", value: "#8d5e35" },
    { type: "color", value: "#146814" },
  ];

  const handleAddDecal = (url) => {
    const newDecals = [...decals, { 
      id: Date.now().toString(), 
      type: 'image',
      url, 
      x: 0, 
      y: 0, 
      width: 5, 
      height: 5,
      surface: activeSurface 
    }];
    pushHistory(newDecals);
  };

  const handleAddTextDecal = () => {
    const newDecals = [...decals, { 
      id: Date.now().toString(), 
      type: 'text',
      content: 'Your text here',
      fontFamily: 'Inter',
      fontSize: 0.8,
      color: '#000000',
      bold: false,
      italic: false,
      textAlign: 'center',
      x: 0, 
      y: 0, 
      width: 5, 
      height: 2, 
      surface: activeSurface 
    }];
    pushHistory(newDecals);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target.result;
      setGalleryImages(prev => [...prev, url]);
      handleAddDecal(url);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body, html, #__next { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; }
        * { box-sizing: border-box; }
      `}} />
      <div style={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: t.bgCanvas, color: t.textMain, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      
      <div style={{ width: "80px", backgroundColor: t.bgPanel, borderRight: `2px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
        {[
          { name: "Uploads", icon: <IconUpload /> },
          { name: "Elements", icon: <IconLayers /> },
          { name: "AI Creation", icon: <IconSparkles /> },
          { name: "Templates", icon: <IconLayout /> },
          { name: "AI Logo", icon: <IconSparkles /> },
        ].map(tab => (
          <div 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{ 
              display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", width: "100%", cursor: "pointer",
              color: activeTab === tab.name ? t.cyan : t.textMuted,
              borderLeft: activeTab === tab.name ? `3px solid ${t.cyan}` : "3px solid transparent"
            }}
          >
            {tab.icon}
            <span style={{ fontSize: "10px", marginTop: "4px", fontWeight: activeTab === tab.name ? "600" : "400", textAlign: "center" }}>{tab.name}</span>
          </div>
        ))}
      </div>

      <div style={{ width: "280px", backgroundColor: t.bgPanel, borderRight: `2px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", display: "flex", alignItems: "center", borderBottom: `2px solid ${t.border}` }}>
          <Link href="/workshop">
            <button style={{ border: "none", background: "none", cursor: "pointer", marginRight: "12px", color: t.textMuted }}>✕</button>
          </Link>
          <span style={{ fontWeight: "400", fontSize: "18px", fontFamily: "Georgia, 'Times New Roman', serif" }}>{activeTab === "Elements" ? "Elements" : "Upload & Design"}</span>
        </div>
        
        <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
          {activeTab === "Uploads" ? (
            <>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.svg" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleFileUpload} 
              />
              <button onClick={() => fileInputRef.current?.click()} style={{ width: "100%", padding: "12px", backgroundColor: t.inputBg, color: t.textMain, border: `2px solid ${t.border}`, borderRadius: "12px 8px 14px 10px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px", boxShadow: `2px 3px 0px ${t.border}` }}>
                <IconUpload /> JPG, PNG, SVG
              </button>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {galleryImages.map((url, i) => (
                  <div key={i} onClick={() => handleAddDecal(url)} style={{ aspectRatio: "1", backgroundColor: t.inputBg, borderRadius: "12px 10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", border: `2px solid ${t.border}` }}>
                    <img src={url} alt={`upload-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === "Elements" ? (
            <div>
              <div style={{ fontSize: "16px", fontWeight: "400", marginBottom: "12px", fontFamily: "Georgia, 'Times New Roman', serif" }}>Text</div>
              <div 
                onClick={handleAddTextDecal}
                style={{ width: "100px", height: "100px", backgroundColor: t.inputBg, border: `2px solid ${t.border}`, borderRadius: "14px 10px 8px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: `2px 3px 0px ${t.border}` }}
              >
                <span style={{ fontSize: "24px", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: "bold", color: t.textMain }}>T</span>
                <span style={{ fontSize: "13px", color: t.textMuted }}>Add text</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: t.textMuted, fontSize: "13px", marginTop: "20px" }}>Coming soon...</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        <div 
          style={{ flex: 1, padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: activeTool === "hand" ? (isPanning ? "grabbing" : "grab") : "default" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div style={{ width: "100%", height: "100%", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: isPanning ? "none" : "transform 0.2s ease-out" }}>
            <DielineSVG 
              L={store.L} W={store.W} H={store.H} T={store.T} 
              materialType={store.materialType} 
              isEditorMode={true} 
              activeColor={activeColor}
              activeSurface={activeSurface}
              decals={decals.filter(d => d.surface === activeSurface)}
              setDecals={pushHistory}
              onDeleteDecal={(id) => pushHistory(decals.filter(d => d.id !== id))}
              disableInteractions={activeTool === "hand"}
            />
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "16px", background: t.bgPanel, padding: "8px 16px", borderRadius: "12px 14px 10px 12px", border: `2px solid ${t.border}`, boxShadow: `2px 3px 0px rgba(58,46,38,0.1)` }}>
          <div style={{ display: "flex", gap: "12px", borderRight: `2px solid ${t.border}`, paddingRight: "16px" }}>
            <button onClick={() => setActiveTool("pointer")} style={{ background: "none", border: "none", cursor: "pointer", color: activeTool === "pointer" ? t.cyan : t.textMuted }}><IconPointer /></button>
            <button onClick={() => setActiveTool("hand")} style={{ background: "none", border: "none", cursor: "pointer", color: activeTool === "hand" ? t.cyan : t.textMuted }}><IconHand /></button>
          </div>
          <div style={{ display: "flex", gap: "12px", borderRight: `2px solid ${t.border}`, paddingRight: "16px" }}>
            <button onClick={handleUndo} style={{ background: "none", border: "none", cursor: historyIndex > -1 ? "pointer" : "default", color: t.textMuted, opacity: historyIndex > -1 ? 1 : 0.3 }}><IconUndo /></button>
            <button onClick={handleRedo} style={{ background: "none", border: "none", cursor: historyIndex < history.length - 1 ? "pointer" : "default", color: t.textMuted, opacity: historyIndex < history.length - 1 ? 1 : 0.3 }}><IconRedo /></button>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", borderRight: `2px solid ${t.border}`, paddingRight: "16px" }}>
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.2))} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>−</button>
            <span onClick={() => { setZoom(1); setPan({x:0, y:0}); }} style={{ cursor: "pointer", fontSize: "13px", fontWeight: "500", color: t.textMain }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(5, zoom + 0.2))} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>+</button>
          </div>
          <div style={{ display: "flex", gap: "12px", color: t.textMuted, alignItems: "center" }}>
            <button onClick={() => store.toggleTheme()} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
              {store.theme === 'dark' ? 
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg> :
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            </button>
            <span onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: "pointer", fontSize: "18px", color: isExpanded ? t.cyan : t.textMuted }}>⛶</span>
            <span onClick={() => setShow3D(!show3D)} style={{ cursor: "pointer", fontSize: "18px", color: show3D ? t.cyan : t.textMuted }}>👁</span>
          </div>
        </div>
      </div>

      {!isExpanded && (
      <div style={{ width: "320px", backgroundColor: t.bgPanel, borderLeft: `2px solid ${t.border}`, display: "flex", flexDirection: "column", padding: "16px", overflowY: "auto" }}>
        <button style={{ width: "100%", padding: "12px", backgroundColor: t.cyan, color: (store.theme === 'dark' ? '#3a2e26' : '#fff'), border: `2px solid ${t.border}`, borderRadius: "14px 10px 12px 16px", fontWeight: "600", cursor: "pointer", marginBottom: "20px", boxShadow: `2px 3px 0px ${t.border}` }}>
          Save
        </button>

        {/* 3D Box Preview Component */}
        {show3D && (
        <div style={{ width: "100%", height: "260px", background: t.inputBg, border: `2px solid ${t.border}`, borderRadius: "12px 14px 10px 16px", position: "relative", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ position: "absolute", top: "8px", right: "8px", background: t.bgApp, padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700", zIndex: 10, border: `1px solid ${t.border}`, color: t.textMain }}>3D</div>
          <Box3DViewer 
            L={store.L} W={store.W} H={store.H} T={store.T}
            progress={foldProgress}
            materialPreset={
              (store.materialType || "").toLowerCase().includes("corrugated") ? "corrugated-kraft" :
              (store.materialType || "").toLowerCase().includes("kraft")      ? "natural-kraft" :
              "white-kraft"
            }
            packageColor={activeColor}
            lightingPreset="studio"
            decals={decals}
          />
        </div>
        )}
        
        {/* Dimensions Box */}
        <div style={{ background: t.inputBg, border: `2px solid ${t.border}`, borderRadius: "16px 14px 18px 16px", padding: "16px", marginBottom: "16px", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)` }}>
          <div style={{ fontSize: "11px", color: t.textMuted, fontWeight: "700", marginBottom: "12px", letterSpacing: "0.5px" }}>DIMENSIONS (IN)</div>
          
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {[
              { label: 'LENGTH', key: 'L', val: store.L },
              { label: 'WIDTH', key: 'W', val: store.W },
              { label: 'HEIGHT', key: 'H', val: store.H }
            ].map((dim) => (
              <div key={dim.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input 
                  type="number" step="0.0001" value={dim.val} 
                  onChange={(e) => store.setDim(dim.key, e.target.value)}
                  style={{ 
                    width: "100%", background: store.theme === 'dark' ? t.bgApp : t.activeBg, border: `2px solid ${t.border}`, 
                    color: t.textMain, fontSize: "15px", fontWeight: "700", textAlign: "center", 
                    padding: "8px 4px", borderRadius: "8px", marginBottom: "6px", outline: "none",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onFocus={(e) => e.target.style.borderColor = t.cyan}
                  onBlur={(e) => e.target.style.borderColor = t.border}
                />
                <span style={{ fontSize: "10px", color: t.textMuted, fontWeight: "600" }}>{dim.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", background: store.theme === 'dark' ? t.bgApp : t.activeBg, padding: "12px 16px", borderRadius: "10px", border: `2px solid ${t.border}` }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", color: t.textMuted, fontWeight: "700", marginBottom: "4px" }}>VOL (IN³)</span>
              <span style={{ fontSize: "16px", color: t.cyan, fontWeight: "700" }}>{(store.L * store.W * store.H).toFixed(1)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "10px", color: t.textMuted, fontWeight: "700", marginBottom: "4px" }}>AREA (IN²)</span>
              <span style={{ fontSize: "16px", color: t.cyan, fontWeight: "700" }}>{(2 * (store.L * store.W + store.L * store.H + store.W * store.H)).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Fold Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", background: t.inputBg, border: `2px solid ${t.border}`, padding: "8px 12px", borderRadius: "14px 12px 16px 10px" }}>
          <span style={{ fontSize: "12px", color: t.textMuted }}>Open</span>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={foldProgress} onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: t.cyan }}
          />
          <span style={{ fontSize: "12px", color: t.textMuted }}>Close</span>
        </div>

        {/* Outside / Inside Toggle */}
        <div style={{ display: "flex", border: `2px solid ${t.border}`, borderRadius: "10px 14px 8px 12px", overflow: "hidden", marginBottom: "24px", background: t.inputBg }}>
          <button 
            onClick={() => setActiveSurface("Outside")}
            style={{ flex: 1, padding: "8px", border: "none", background: activeSurface === "Outside" ? t.activeBg : "transparent", fontWeight: activeSurface === "Outside" ? "600" : "400", cursor: "pointer", color: activeSurface === "Outside" ? t.textMain : t.textMuted }}
          >Outside</button>
          <div style={{ width: "2px", background: t.border }}></div>
          <button 
            onClick={() => setActiveSurface("Inside")}
            style={{ flex: 1, padding: "8px", border: "none", background: activeSurface === "Inside" ? t.activeBg : "transparent", fontWeight: activeSurface === "Inside" ? "600" : "400", cursor: "pointer", color: activeSurface === "Inside" ? t.textMain : t.textMuted }}
          >Inside</button>
        </div>

        {/* Material Selection */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "16px", fontWeight: "400", marginBottom: "12px", color: t.textMain, fontFamily: "Georgia, 'Times New Roman', serif" }}>Material</div>
          <select 
            onChange={(e) => {
              const type = e.target.value;
              const defaultT = type === "paperboard" ? 0.0181 : 0.0591;
              store.setMaterialType(type, defaultT);
            }} 
            value={store.materialType || "paperboard"} 
            style={{ 
              width: "100%", padding: "10px", background: t.inputBg, 
              border: `2px solid ${t.border}`, color: t.textMain, borderRadius: "12px 10px 14px 8px", 
              fontSize: 13, fontWeight: "500", outline: "none", cursor: "pointer",
              appearance: "none", boxShadow: `2px 3px 0px rgba(58,46,38,0.05)`
            }}
          >
            <option value="paperboard">⚪ 350g kraft paperboard</option>
            <option value="corrugated">🟤 Corrugated E-flute board</option>
          </select>
        </div>

        {/* Package Color */}
        <div>
          <div style={{ fontSize: "16px", fontWeight: "400", marginBottom: "12px", color: t.textMain, fontFamily: "Georgia, 'Times New Roman', serif" }}>Package Color</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {packageColors.map((item, idx) => {
              const isSelected = activeColor === item.value || (item.type === "transparent" && activeColor === "transparent");
              
              if (item.type === "picker") {
                return (
                  <div key={`color-${idx}`} style={{ position: "relative", width: "28px", height: "28px" }}>
                    <div style={{
                      width: "100%", height: "100%", borderRadius: "4px 10px 8px 12px", cursor: "pointer",
                      background: "linear-gradient(white, white) padding-box, conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box",
                      border: "2.5px solid transparent",
                      boxShadow: `1px 2px 0px ${t.border}`,
                      pointerEvents: "none", position: "absolute", zIndex: 2
                    }} />
                    <input 
                      type="color"
                      value={activeColor && activeColor !== "transparent" ? activeColor : "#ffffff"}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      style={{ 
                        position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                        opacity: 0, cursor: "pointer", zIndex: 3 
                      }}
                    />
                  </div>
                );
              }

              if (item.type === "transparent") {
                return (
                  <div 
                    key={`color-${idx}`}
                    onClick={() => handleColorSelect("transparent")}
                    style={{
                      width: "28px", height: "28px", borderRadius: "10px 12px 14px 8px", cursor: "pointer",
                      background: "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 50% / 10px 10px",
                      border: isSelected ? `2.5px solid ${t.cyan}` : `2px solid ${t.border}`,
                      boxShadow: isSelected ? `2px 3px 0px ${t.border}` : `1px 2px 0px rgba(58,46,38,0.05)`
                    }}
                  />
                );
              }

              return (
                <div 
                  key={`color-${idx}`}
                  onClick={() => handleColorSelect(item.value)}
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%", backgroundColor: item.value, cursor: "pointer",
                    border: isSelected ? `2.5px solid ${t.cyan}` : `2px solid ${t.border}`,
                    boxShadow: isSelected ? `0 0 0 2px ${t.bgPanel} inset, 2px 3px 0px ${t.border}` : `1px 2px 0px rgba(58,46,38,0.05)`,
                    boxSizing: "border-box"
                  }}
                />
              );
            })}
          </div>
        </div>
        
      </div>
      )}

    </div>
    </>
  );
}
