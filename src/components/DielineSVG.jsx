import React, { useMemo, useRef, useState, useEffect } from "react";
import { generateRTEDieline } from "../lib/rteDielineGenerator";
import { generateTEDielineDXF } from "../lib/teDielineGenerator";
import { useBoxStore } from "../lib/useBoxStore";
import { generateCardboardCanvas } from "../lib/textureGenerator";
import { generatePanelHitboxes } from "../lib/panelHitboxes";

function createTextTextureURL(decal) {
  if (typeof window === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  
  ctx.clearRect(0, 0, 2048, 2048);
  
  const fontWeight = decal.bold ? "bold" : "normal";
  const fontStyle = decal.italic ? "italic" : "normal";
  const fontSize = 320;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${decal.fontFamily || "Inter"}`;
  ctx.fillStyle = decal.color || "#000000";
  ctx.textAlign = decal.textAlign || "center";
  ctx.textBaseline = "middle";
  
  let x = 1024;
  if (ctx.textAlign === "left") x = 128;
  if (ctx.textAlign === "right") x = 2048 - 128;
  
  const lines = (decal.content ?? "Your text here").split('\n');
  const lineH = fontSize * 1.2;
  const startY = 1024 - (lines.length - 1) * lineH / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineH);
  });
  
  return canvas.toDataURL("image/png");
}

const DielineSVG = React.forwardRef(function DielineSVG(props, forwardedRef) {
  const internalRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = forwardedRef || internalRef;

  const { isEditorMode, decals = [], setDecals, activeColor, activeSurface } = props;

  const { 
    L, W, H, T, sizeMode, glueFlapWidth, bleed, 
    trimColor, creaseColor, bleedColor, dimColor, 
    showOverallDims, showBasicDims, showBleedLine, showAnnotations, 
    theme, generatorMethod, packageColor, boxModel
  } = useBoxStore();

  // --- THE PACDORA 2T MATH REVEALED IN THE VIDEO ---
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

  // Draw the dieline using the dynamically calculated MANUFACTURE dimensions
  const dieline = useMemo(() => {
    if (boxModel === 'te') {
      return generateTEDielineDXF({ L: manuL, W: manuW, H: manuH, T, glueFlapWidth, bleed });
    }
    return generateRTEDieline({ L: manuL, W: manuW, H: manuH, T, glueFlapWidth, bleed, method: generatorMethod });
  }, [manuL, manuW, manuH, T, glueFlapWidth, bleed, generatorMethod, boxModel]);

  const { width, height, cutPaths, bleedPaths, foldLines, dimensions } = dieline;
  const { x1, x2, x3, x4, x5, yTop, yBot } = dimensions;

  const hitboxes = useMemo(() => {
    return generatePanelHitboxes(manuL, manuW, manuH, T, dimensions, glueFlapWidth);
  }, [manuL, manuW, manuH, T, dimensions, glueFlapWidth]);

  const [hoveredPanelId, setHoveredPanelId] = useState(null);
  const [toolbarPos, setToolbarPos] = useState({ top: -1000, left: -1000 });

  const pad = 1.5;
  const baseW = width + pad * 2;
  const baseH = height + pad * 2;

  // Center the view and fit to available space perfectly
  const [view, setView] = useState({ x: -pad - (baseW * 0.2), y: -pad - (baseH * 0.2), w: baseW * 1.4, h: baseH * 1.4 });
  const viewRef = useRef(view);
  viewRef.current = view;

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [activeDecalId, setActiveDecalId] = useState(null);
  const [interactionMode, setInteractionMode] = useState(null); // 'drag' or 'resize'

  React.useEffect(() => {
    if (activeDecalId) {
      const el = document.getElementById("active-decal-group");
      if (el && containerRef.current) {
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setToolbarPos({
          top: rect.top - containerRect.top - 15,
          left: rect.left - containerRect.left + rect.width / 2
        });
      }
    }
  }, [activeDecalId, decals, view, isDraggingCanvas, activeSurface]);

  // Generate ultra-realistic procedural cardboard texture data URL
  const materialPreset = props.materialType?.toLowerCase().includes("corrugated") ? "corrugated-kraft" : "white-kraft";
  const [textureDataUrl, setTextureDataUrl] = useState("");

  useEffect(() => {
    const colorToUse = activeColor !== undefined ? activeColor : packageColor;
    const canvas = generateCardboardCanvas(materialPreset, colorToUse);
    if (canvas) {
      setTextureDataUrl(canvas.toDataURL("image/jpeg", 0.6));
    }
  }, [materialPreset, packageColor, activeColor]);

  useEffect(() => {
    setView({ x: -pad - (baseW * 0.2), y: -pad - (baseH * 0.2), w: baseW * 1.4, h: baseH * 1.4 });
  }, [width, height]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); 
      const zoomSensitivity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * zoomSensitivity);
      const v = viewRef.current;
      const newW = v.w * zoomFactor;
      const newH = v.h * zoomFactor;

      if (newW > baseW * 8 || newW < baseW * 0.05) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const normalizedMouseX = activeSurface === 'Inside' ? 1 - (mouseX / rect.width) : (mouseX / rect.width);
      const svgMouseX = v.x + normalizedMouseX * v.w;
      const svgMouseY = v.y + (mouseY / rect.height) * v.h;
      
      const newX = svgMouseX - normalizedMouseX * newW;
      const newY = svgMouseY - (mouseY / rect.height) * newH;

      setView({ x: newX, y: newY, w: newW, h: newH });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [baseW, baseH]);

  const handlePointerDown = (e) => {
    setIsDraggingCanvas(true);
    setActiveDecalId(null);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.movementX / rect.width) * view.w * (activeSurface === 'Inside' ? -1 : 1);
    const dy = (e.movementY / rect.height) * view.h;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const normalizedMouseX = activeSurface === 'Inside' ? 1 - (mouseX / rect.width) : (mouseX / rect.width);
    const svgMouseX = view.x + normalizedMouseX * view.w;
    const svgMouseY = view.y + (mouseY / rect.height) * view.h;

    if (activeDecalId && setDecals && interactionMode === 'drag') {
      setDecals(prev => prev.map(d => 
        d.id === activeDecalId ? { ...d, x: d.x + dx, y: d.y + dy } : d
      ));
    } else if (activeDecalId && setDecals && interactionMode?.type === 'resize') {
      const { handle, initialDecal } = interactionMode;
      let effectiveHandle = handle;
      if (activeSurface === 'Inside') {
        if (handle.includes('e')) effectiveHandle = handle.replace('e', 'w');
        else if (handle.includes('w')) effectiveHandle = handle.replace('w', 'e');
      }

      setDecals(prev => prev.map(d => {
        if (d.id === activeDecalId) {
          let left = initialDecal.x - initialDecal.width / 2;
          let right = initialDecal.x + initialDecal.width / 2;
          let top = initialDecal.y - initialDecal.height / 2;
          let bottom = initialDecal.y + initialDecal.height / 2;

          if (effectiveHandle.includes('e')) right = svgMouseX;
          if (effectiveHandle.includes('w')) left = svgMouseX;
          if (effectiveHandle.includes('s')) bottom = svgMouseY;
          if (effectiveHandle.includes('n')) top = svgMouseY;

          if (effectiveHandle.length === 2) {
            const aspect = initialDecal.width / initialDecal.height;
            let w = Math.max(0.1, Math.abs(right - left));
            let h = Math.max(0.1, Math.abs(bottom - top));
            
            if (w / h > aspect) h = w / aspect;
            else w = h * aspect;

            if (effectiveHandle.includes('e')) right = left + w * (right > left ? 1 : -1);
            if (effectiveHandle.includes('w')) left = right - w * (right > left ? 1 : -1);
            if (effectiveHandle.includes('s')) bottom = top + h * (bottom > top ? 1 : -1);
            if (effectiveHandle.includes('n')) top = bottom - h * (bottom > top ? 1 : -1);
          }

          return {
            ...d,
            width: Math.max(0.1, Math.abs(right - left)),
            height: Math.max(0.1, Math.abs(bottom - top)),
            x: (left + right) / 2,
            y: (top + bottom) / 2
          };
        }
        return d;
      }));
    } else if (isDraggingCanvas) {
      setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
    }
  };

  const handlePointerUp = () => {
    setIsDraggingCanvas(false);
    setInteractionMode(null);
  };

  // Fixed visual weights for physical scale (inches)
  const strokeW = isEditorMode ? 0.035 : 0.025; 
  const fontSizeBasic = isEditorMode ? 0.45 : 0.4;
  
  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#0f172a";
  const textMuted = isDark ? "#a1a1aa" : "#64748b";
  const activeDimColor = isDark ? dimColor : "#0284c7"; 

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        touchAction: "none", 
        cursor: isDraggingCanvas ? "grabbing" : (activeDecalId ? "move" : "grab"), 
        background: "transparent" 
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg 
        ref={svgRef} 
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        height="100%" 
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        style={{ transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
      >
        <defs>
          <marker id="arrow-cyan-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill={activeDimColor} />
          </marker>
          <marker id="arrow-cyan-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 6 6 z" fill={activeDimColor} />
          </marker>
          <marker id="arrow-blue-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-blue-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 6 6 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-grey-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill={textMuted} />
          </marker>
          <marker id="arrow-grey-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill={textMuted} />
          </marker>
          {/* Photorealistic Canvas Texture from Generator */}
          <pattern id="kraft-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
             {textureDataUrl && (
               <image href={textureDataUrl} width="6" height="6" preserveAspectRatio="none" />
             )}
          </pattern>

          {/* Clean outer drop shadow to lift the cardboard off the background */}
          <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0.04" stdDeviation="0.06" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        {showBleedLine && (
          <g stroke={bleedColor} strokeWidth={strokeW * 0.5} fill="none" strokeLinejoin="round" opacity={0.5}>
            {bleedPaths.map((p, i) => (
              <path key={`bleed-${i}`} d={p} />
            ))}
          </g>
        )}

        {/* When in editor mode, fill the shape with the photorealistic texture and add a subtle drop shadow */}
        <g 
          stroke={isEditorMode ? "#8d7051" : trimColor} 
          strokeWidth={isEditorMode ? strokeW * 0.8 : strokeW} 
          fill={isEditorMode ? "url(#kraft-pattern)" : (packageColor && packageColor !== "transparent" ? packageColor : "none")} 
          strokeLinejoin="round" 
          strokeLinecap="round"
          style={isEditorMode ? { filter: "url(#drop-shadow)" } : {}}
        >
          {cutPaths.map((p, i) => (
            <path key={`cut-${i}`} d={p} />
          ))}
        </g>

        <g 
          stroke={isEditorMode ? "#8d7051" : creaseColor} 
          strokeWidth={isEditorMode ? strokeW * 0.8 : strokeW} 
          strokeDasharray={isEditorMode ? `${strokeW*2},${strokeW*2}` : `${strokeW*3},${strokeW*3}`} 
          fill="none" 
          opacity={1}
        >
          {foldLines.map((s, i) => (
            <line key={`fold-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </g>

        {showBasicDims && !isEditorMode && (
          <g 
            stroke={activeDimColor} 
            strokeWidth={strokeW} 
            strokeDasharray={`${strokeW*2},${strokeW*2}`} 
            fill={activeDimColor} 
            fontSize={fontSizeBasic} 
            fontFamily="sans-serif" 
            fontWeight="bold"
          >
            <line x1={x1 + 0.05} y1={yBot - manuH/2} x2={x2 - 0.05} y2={yBot - manuH/2} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text 
              x={(x1+x2)/2} y={yBot - manuH/2 - 0.1} 
              textAnchor="middle" stroke="none"
              style={{ transformOrigin: `${(x1+x2)/2}px ${yBot - manuH/2 - 0.1}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {manuL.toFixed(4)} in
            </text>
            
            <line x1={x2 + 0.05} y1={yBot - manuH/2} x2={x3 - 0.05} y2={yBot - manuH/2} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text 
              x={(x2+x3)/2} y={yBot - manuH/2 - 0.1} 
              textAnchor="middle" stroke="none"
              style={{ transformOrigin: `${(x2+x3)/2}px ${yBot - manuH/2 - 0.1}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {manuW.toFixed(4)} in
            </text>
            
            <line x1={x3 + manuL/2} y1={yTop + 0.05} x2={x3 + manuL/2} y2={yBot - 0.05} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text 
              x={x3 + manuL/2 + 0.15} y={(yTop+yBot)/2} 
              alignmentBaseline="middle" stroke="none"
              style={{ transformOrigin: `${x3 + manuL/2 + 0.15}px ${(yTop+yBot)/2}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {manuH.toFixed(4)} in
            </text>
          </g>
        )}

        {isEditorMode && (
          <g 
            stroke="#4a90e2" 
            strokeWidth={strokeW * 0.4} 
            fill="#4a90e2" 
            fontSize={fontSizeBasic * 0.55} 
            fontFamily="'Inter', sans-serif" 
            fontWeight="500"
          >
            {/* Front Panel Length (Panel 1) */}
            <line x1={x1 + 0.1} y1={yBot - manuH/1.2} x2={(x1+x2)/2 - 0.4} y2={yBot - manuH/1.2} markerStart="url(#arrow-blue-start)" />
            <line x1={(x1+x2)/2 + 0.4} y1={yBot - manuH/1.2} x2={x2 - 0.1} y2={yBot - manuH/1.2} markerEnd="url(#arrow-blue-end)" />
            <text 
              x={(x1+x2)/2} y={yBot - manuH/1.2 + 0.05} 
              alignmentBaseline="middle" textAnchor="middle" stroke="none"
              style={{ transformOrigin: `${(x1+x2)/2}px ${yBot - manuH/1.2 + 0.05}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {(manuL * 25.4).toFixed(0)} mm
            </text>
            
            {/* Side Panel Width (Panel 2) */}
            <line x1={x2 + 0.1} y1={yTop + manuH/3.5} x2={(x2+x3)/2 - 0.35} y2={yTop + manuH/3.5} markerStart="url(#arrow-blue-start)" />
            <line x1={(x2+x3)/2 + 0.35} y1={yTop + manuH/3.5} x2={x3 - 0.1} y2={yTop + manuH/3.5} markerEnd="url(#arrow-blue-end)" />
            <text 
              x={(x2+x3)/2} y={yTop + manuH/3.5 + 0.05} 
              alignmentBaseline="middle" textAnchor="middle" stroke="none"
              style={{ transformOrigin: `${(x2+x3)/2}px ${yTop + manuH/3.5 + 0.05}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {(manuW * 25.4).toFixed(0)} mm
            </text>

            {/* Height (Panel 3) */}
            <line x1={x3 + manuL/2} y1={yTop + 0.1} x2={x3 + manuL/2} y2={(yTop+yBot)/2 - 0.25} markerStart="url(#arrow-blue-start)" />
            <line x1={x3 + manuL/2} y1={(yTop+yBot)/2 + 0.25} x2={x3 + manuL/2} y2={yBot - 0.1} markerEnd="url(#arrow-blue-end)" />
            <text 
              x={x3 + manuL/2} y={(yTop+yBot)/2} 
              alignmentBaseline="middle" textAnchor="middle" stroke="none"
              style={{ transformOrigin: `${x3 + manuL/2}px ${(yTop+yBot)/2}px`, transform: activeSurface === 'Inside' ? 'scaleX(-1)' : 'none' }}
            >
              {(manuH * 25.4).toFixed(0)} mm
            </text>
          </g>
        )}

        {/* Interactive Panel Hitboxes (Pacdora-style) */}
        {isEditorMode && (
          <g>
            {hitboxes.map(panel => {
              const isHovered = hoveredPanelId === panel.id;
              return (
                <path
                  key={panel.id}
                  d={panel.path}
                  fill={isHovered ? "rgba(59, 130, 246, 0.15)" : "transparent"}
                  stroke={isHovered ? "#3b82f6" : "transparent"}
                  strokeWidth={strokeW * 1.5}
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredPanelId(panel.id)}
                  onMouseLeave={() => setHoveredPanelId(null)}
                  style={{ cursor: "pointer", transition: "all 0.1s ease" }}
                />
              );
            })}
          </g>
        )}

        {/* DECALS LAYER */}
        {isEditorMode && decals.map((decal) => (
          <g 
            key={decal.id} 
            id={activeDecalId === decal.id ? "active-decal-group" : undefined}
            transform={`translate(${decal.x}, ${decal.y}) ${activeSurface === 'Inside' ? 'scale(-1, 1)' : ''}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setActiveDecalId(decal.id);
              setInteractionMode('drag');
            }}
            style={{ cursor: 'move' }}
          >
            {decal.type === 'text' ? (
              <>
                <image 
                  href={createTextTextureURL(decal)} 
                  x={-decal.width / 2} 
                  y={-decal.height / 2} 
                  width={decal.width} 
                  height={decal.height}
                  preserveAspectRatio="none"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                />
                <rect x={-decal.width / 2} y={-decal.height / 2} width={decal.width} height={decal.height} fill="transparent" />
              </>
            ) : (
              <image 
                href={decal.url} 
                x={-decal.width / 2} 
                y={-decal.height / 2} 
                width={decal.width} 
                height={decal.height}
                preserveAspectRatio="xMidYMid slice"
              />
            )}
            {/* Selection Outline & Handles */}
            {activeDecalId === decal.id && (
              <>
                <rect 
                  x={-decal.width / 2} 
                  y={-decal.height / 2} 
                  width={decal.width} 
                  height={decal.height} 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth={strokeW * 1.5}
                  strokeDasharray={`${strokeW*3},${strokeW*3}`}
                  opacity={0.8}
                />
                
                {/* Resize Handles */}
                {[
                  { cx: decal.width / 2, cy: decal.height / 2, handle: 'se', cursor: 'nwse-resize' },
                  { cx: -decal.width / 2, cy: -decal.height / 2, handle: 'nw', cursor: 'nwse-resize' },
                  { cx: decal.width / 2, cy: -decal.height / 2, handle: 'ne', cursor: 'nesw-resize' },
                  { cx: -decal.width / 2, cy: decal.height / 2, handle: 'sw', cursor: 'nesw-resize' },
                  { cx: 0, cy: -decal.height / 2, handle: 'n', cursor: 'ns-resize' },
                  { cx: 0, cy: decal.height / 2, handle: 's', cursor: 'ns-resize' },
                  { cx: -decal.width / 2, cy: 0, handle: 'w', cursor: 'ew-resize' },
                  { cx: decal.width / 2, cy: 0, handle: 'e', cursor: 'ew-resize' }
                ].map((pos, i) => (
                  <rect 
                    key={i} 
                    x={pos.cx - 0.15} y={pos.cy - 0.15} width={0.3} height={0.3} rx={0.08}
                    fill="white" stroke="#8b5cf6" strokeWidth={0.04} 
                    style={{ cursor: pos.cursor }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setActiveDecalId(decal.id);
                      setInteractionMode({ type: 'resize', handle: pos.handle, initialDecal: decal });
                    }}
                  />
                ))}

              </>
            )}
          </g>
        ))}

        {showOverallDims && (
          <g 
            stroke={textMuted} 
            strokeWidth={strokeW} 
            fill={textMuted} 
            fontSize={0.18 * (view.w/baseW)} 
            fontFamily="sans-serif"
          >
            <line x1={0} y1={height} x2={0} y2={height + 0.5} strokeWidth={strokeW/2} />
            <line x1={width} y1={height} x2={width} y2={height + 0.5} strokeWidth={strokeW/2} />
            <line x1={0.05} y1={height + 0.35} x2={width - 0.05} y2={height + 0.35} markerStart="url(#arrow-grey-start)" markerEnd="url(#arrow-grey-end)" />
            <text x={width/2} y={height + 0.35 - 0.05 * (view.w/baseW)} textAnchor="middle" stroke="none">
              {width.toFixed(4)} in
            </text>
            
            <line x1={width} y1={0} x2={width + 0.5} y2={0} strokeWidth={strokeW/2} />
            <line x1={width} y1={height} x2={width + 0.5} y2={height} strokeWidth={strokeW/2} />
            <line x1={width + 0.35} y1={0.05} x2={width + 0.35} y2={height - 0.05} markerStart="url(#arrow-grey-start)" markerEnd="url(#arrow-grey-end)" />
            <g transform={`translate(${width + 0.35 + 0.05 * (view.w/baseW)}, ${height/2}) rotate(-90)`}>
              <text x={0} y={0} textAnchor="middle" stroke="none">
                {height.toFixed(4)} in
              </text>
            </g>
          </g>
        )}

        {showAnnotations && !isEditorMode && (
          <g 
            fill={textColor} 
            stroke="none" 
            fontSize={0.16 * (view.w/baseW)} 
            fontFamily="sans-serif"
          >
            <text x={-pad + 0.2} y={-pad + 0.8} fontWeight="bold">
              Manufacture dimensions
            </text>
            <text fill={textMuted} x={-pad + 0.2} y={-pad + 0.8 + 0.25 * (view.w/baseW)}>
              {manuL.toFixed(4)} × {manuW.toFixed(4)} × {manuH.toFixed(4)} in
            </text>
            
            <text x={-pad + 0.2} y={-pad + 0.8 + 0.60 * (view.w/baseW)} fontWeight="bold">
              Inner dimensions
            </text>
            <text fill={textMuted} x={-pad + 0.2} y={-pad + 0.8 + 0.85 * (view.w/baseW)}>
              {innerL.toFixed(4)} × {innerW.toFixed(4)} × {innerH.toFixed(4)} in
            </text>

            <text x={-pad + 0.2} y={-pad + 0.8 + 1.20 * (view.w/baseW)} fontWeight="bold">
              Outer dimensions
            </text>
            <text fill={textMuted} x={-pad + 0.2} y={-pad + 0.8 + 1.45 * (view.w/baseW)}>
              {outerL.toFixed(4)} × {outerW.toFixed(4)} × {outerH.toFixed(4)} in
            </text>
          </g>
        )}

      </svg>

      {/* HTML Overlay Toolbar */}
      {isEditorMode && activeDecalId && decals.find(d => d.id === activeDecalId) && (() => {
        const decal = decals.find(d => d.id === activeDecalId);
        return (
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: `${toolbarPos.top}px`,
              left: `${toolbarPos.left}px`,
              transform: 'translate(-50%, -100%)',
              visibility: toolbarPos.top > -500 ? 'visible' : 'hidden',
              zIndex: 100,
              display: "flex", background: "white", padding: "8px 16px", borderRadius: "10px", boxShadow: "0 6px 16px rgba(0,0,0,0.12)", gap: "12px", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", fontFamily: "sans-serif", border: "1px solid #e5e7eb"
            }}
          >
            {decal.type === 'text' ? (
              <>
                <select 
                  value={decal.fontFamily || "Inter"} 
                  onChange={e => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, fontFamily: e.target.value } : d))} 
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "none", background: "#f1f5f9", outline: "none", cursor: "pointer", fontWeight: "500", minWidth: "90px" }}
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>

                <div style={{ display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: "6px", padding: "2px 6px" }}>
                  <input 
                    type="number" 
                    value={Math.round((decal.fontSize || 0.8) * 15)} 
                    onChange={e => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, fontSize: parseFloat(e.target.value) / 15 } : d))} 
                    style={{ width: "40px", border: "none", background: "transparent", outline: "none", textAlign: "center", fontWeight: "500" }}
                  />
                </div>

                <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>

                <div style={{ position: "relative", width: "24px", height: "24px", borderRadius: "50%", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "100%", height: "100%", background: decal.color || "#000000" }}></div>
                  <input 
                    type="color" 
                    value={decal.color || "#000000"} 
                    onChange={e => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, color: e.target.value } : d))} 
                    style={{ position: "absolute", opacity: 0, width: "200%", height: "200%", top: "-50%", left: "-50%", cursor: "pointer" }}
                  />
                </div>

                <button 
                  onClick={() => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, bold: !d.bold } : d))}
                  style={{ background: decal.bold ? "#e2e8f0" : "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Bold"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                </button>
                <button 
                  onClick={() => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, italic: !d.italic } : d))}
                  style={{ background: decal.italic ? "#e2e8f0" : "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Italic"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                </button>

                <button 
                  onClick={() => {
                    const aligns = ["left", "center", "right"];
                    const nextAlign = aligns[(aligns.indexOf(decal.textAlign || "center") + 1) % 3];
                    setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, textAlign: nextAlign } : d));
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Align"
                >
                  {decal.textAlign === 'left' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg> : 
                   decal.textAlign === 'right' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg> : 
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="12" x2="7" y2="12"></line><line x1="19" y1="18" x2="5" y2="18"></line></svg>}
                </button>

                <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>

                <button 
                  onClick={() => setDecals(prev => { const others = prev.filter(d => d.id !== decal.id); return [...others, decal]; })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Bring to Front"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </button>

                <button 
                  onClick={() => setDecals(prev => [...prev, { ...decal, id: Math.random().toString(36).substr(2, 9), x: decal.x + 0.3, y: decal.y + 0.3 }])}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Duplicate"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>

                <button 
                  onClick={() => { props.onDeleteDecal?.(decal.id); setActiveDecalId(null); }} 
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex" }}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>

                <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>

                <input 
                  type="text" 
                  value={decal.content ?? "Your text here"} 
                  onChange={e => setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, content: e.target.value } : d))}
                  style={{ width: "120px", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e5e7eb", outline: "none", background: "#f8fafc", fontSize: "14px" }}
                  placeholder="Text..."
                />
              </>
            ) : (
              <>
                <button 
                  onClick={() => setDecals(prev => { const others = prev.filter(d => d.id !== decal.id); return [...others, decal]; })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Bring to Front"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </button>

                <button 
                  onClick={() => setDecals(prev => [...prev, { ...decal, id: Math.random().toString(36).substr(2, 9), x: decal.x + 0.3, y: decal.y + 0.3 }])}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex", color: "#475569" }}
                  title="Duplicate"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>

                <button 
                  onClick={() => { props.onDeleteDecal?.(decal.id); setActiveDecalId(null); }} 
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", display: "flex" }}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
});

export default DielineSVG;