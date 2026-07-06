import React, { useMemo, useRef, useState, useEffect } from "react";
import { generateRTEDieline } from "../lib/rteDielineGenerator";
import { useBoxStore } from "../lib/useBoxStore";

const DielineSVG = React.forwardRef(function DielineSVG(props, forwardedRef) {
  const internalRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = forwardedRef || internalRef;

  const { 
    L, W, H, T, glueFlapWidth, bleed, 
    trimColor, creaseColor, bleedColor, dimColor, 
    showOverallDims, showBasicDims, showBleedLine, showAnnotations, 
    theme 
  } = useBoxStore();

  const dieline = useMemo(() => {
    return generateRTEDieline({ L, W, H, T, glueFlapWidth, bleed });
  }, [L, W, H, T, glueFlapWidth, bleed]);

  const { width, height, cutPaths, bleedPaths, foldLines, dimensions } = dieline;
  const { x1, x2, x3, x4, x5, yTop, yBot } = dimensions;

  const pad = 1.5;
  const baseW = width + pad * 2;
  const baseH = height + pad * 2;

  const [view, setView] = useState({ x: -pad, y: -pad, w: baseW, h: baseH });
  const viewRef = useRef(view);
  viewRef.current = view;

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setView({ x: -pad, y: -pad, w: width + pad * 2, h: height + pad * 2 });
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
      
      const svgMouseX = v.x + (mouseX / rect.width) * v.w;
      const svgMouseY = v.y + (mouseY / rect.height) * v.h;
      
      const newX = svgMouseX - (mouseX / rect.width) * newW;
      const newY = svgMouseY - (mouseY / rect.height) * newH;

      setView({ x: newX, y: newY, w: newW, h: newH });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [baseW, baseH]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.movementX / rect.width) * view.w;
    const dy = (e.movementY / rect.height) * view.h;
    setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
  };

  const handlePointerUp = () => setIsDragging(false);

  const strokeW = 0.015 * (view.w / baseW); 
  
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
        cursor: isDragging ? "grabbing" : "grab", 
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
      >
        <defs>
          <marker id="arrow-cyan-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill={activeDimColor} />
          </marker>
          <marker id="arrow-cyan-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 6 6 z" fill={activeDimColor} />
          </marker>
          <marker id="arrow-grey-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill={textMuted} />
          </marker>
          <marker id="arrow-grey-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill={textMuted} />
          </marker>
        </defs>

        {showBleedLine && (
          <g stroke={bleedColor} strokeWidth={strokeW} fill="none" strokeLinejoin="round">
            {bleedPaths.map((p, i) => (
              <path key={`bleed-${i}`} d={p} />
            ))}
          </g>
        )}

        <g stroke={creaseColor} strokeWidth={strokeW} strokeDasharray={`${strokeW*3},${strokeW*3}`} fill="none">
          {foldLines.map((s, i) => (
            <line key={`fold-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </g>

        <g stroke={trimColor} strokeWidth={strokeW} fill="none" strokeLinejoin="round">
          {cutPaths.map((p, i) => (
            <path key={`cut-${i}`} d={p} />
          ))}
        </g>

        {showBasicDims && (
          <g 
            stroke={activeDimColor} 
            strokeWidth={strokeW} 
            strokeDasharray={`${strokeW*2},${strokeW*2}`} 
            fill={activeDimColor} 
            fontSize={0.25 * (view.w/baseW)} 
            fontFamily="sans-serif" 
            fontWeight="bold"
          >
            <line x1={x1 + 0.05} y1={yBot - H/2} x2={x2 - 0.05} y2={yBot - H/2} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text x={(x1+x2)/2} y={yBot - H/2 - 0.05 * (view.w/baseW)} textAnchor="middle" stroke="none">
              {L.toFixed(4)} in
            </text>
            
            <line x1={x2 + 0.05} y1={yBot - H/2} x2={x3 - 0.05} y2={yBot - H/2} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text x={(x2+x3)/2} y={yBot - H/2 - 0.05 * (view.w/baseW)} textAnchor="middle" stroke="none">
              {W.toFixed(4)} in
            </text>
            
            <line x1={x3 + L/2} y1={yTop + 0.05} x2={x3 + L/2} y2={yBot - 0.05} markerStart="url(#arrow-cyan-start)" markerEnd="url(#arrow-cyan-end)" />
            <text x={x3 + L/2 + 0.08 * (view.w/baseW)} y={(yTop+yBot)/2} alignmentBaseline="middle" stroke="none">
              {H.toFixed(4)} in
            </text>
          </g>
        )}

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

        {showAnnotations && (
          <g 
            fill={textColor} 
            stroke="none" 
            fontSize={0.16 * (view.w/baseW)} 
            fontFamily="sans-serif"
          >
            <text x={-pad + 0.2} y={-pad + 0.4} fontWeight="bold">
              Manufacture dimensions
            </text>
            <text fill={textMuted} x={-pad + 0.2} y={-pad + 0.4 + 0.25 * (view.w/baseW)}>
              {L.toFixed(4)} × {W.toFixed(4)} × {H.toFixed(4)} in
            </text>
            
            <text x={-pad + 0.2} y={-pad + 0.4 + 0.65 * (view.w/baseW)} fontWeight="bold">
              Inner dimensions
            </text>
            <text fill={textMuted} x={-pad + 0.2} y={-pad + 0.4 + 0.90 * (view.w/baseW)}>
              {(L - 0.0236).toFixed(4)} × {(W - 0.0236).toFixed(4)} × {(H - 0.0433).toFixed(4)} in
            </text>
          </g>
        )}
      </svg>
    </div>
  );
});

export default DielineSVG;