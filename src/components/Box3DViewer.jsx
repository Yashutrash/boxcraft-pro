import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Decal } from "@react-three/drei";
import * as THREE from "three";

import { useTexture } from "@react-three/drei";
import { useBoxStore } from "../lib/useBoxStore";
import { generateRTEDieline } from "../lib/rteDielineGenerator";
import { generateTEDielineDXF } from "../lib/teDielineGenerator";

// ─────────────────────────────────────────────────────────────────────────────
// DECAL MAPPING COMPONENT
// Maps 2D SVG coordinates (origin top-left) to 3D panel coordinates (origin center).
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function DecalItem({ decal, L, W, H, manuL, manuW, manuH, dims, panel, T }) {
  let cx = 0;
  let cy = 0;
  let rotZ = 0;
  let scaleX = 1;
  const scaleY = H / manuH;
  let scaleY_sign = 1;

  const { x1, x2, x3, x4, x5, yTop, yBot } = dims;
  const nT = Math.max(0.015, Number(T) || 0.0197);
  const coverDepth = W - 2 * nT;

  if (panel === "p1") {
    scaleX = L / manuL; cx = (decal.x - x1) * scaleX - L / 2; cy = (yTop - decal.y) * scaleY + H / 2;
  } else if (panel === "p2") {
    scaleX = W / manuW; cx = (decal.x - x2) * scaleX; cy = (yTop - decal.y) * scaleY + H / 2;
  } else if (panel === "p3") {
    scaleX = L / manuL; cx = (decal.x - x3) * scaleX - L / 2; cy = (yTop - decal.y) * scaleY + H / 2;
  } else if (panel === "p4") {
    scaleX = W / manuW; cx = (decal.x - x4) * scaleX; cy = (yTop - decal.y) * scaleY + H / 2;
  } else if (panel === "p1_top_cover") {
    scaleX = L / manuL; cx = (decal.x - x1) * scaleX - L / 2; cy = (yTop - decal.y) * scaleY;
  } else if (panel === "p1_top_lip") {
    scaleX = L / manuL; cx = (decal.x - x1) * scaleX - L / 2; cy = (yTop - coverDepth - decal.y) * scaleY;
  } else if (panel === "p3_top_cover") {
    scaleX = L / manuL; cx = -((decal.x - x3) * scaleX - L / 2); cy = (yTop - decal.y) * scaleY; rotZ = Math.PI;
  } else if (panel === "p3_top_lip") {
    scaleX = L / manuL; cx = -((decal.x - x3) * scaleX - L / 2); cy = (yTop - coverDepth - decal.y) * scaleY; rotZ = Math.PI;
  } else if (panel === "p3_bot_cover") {
    scaleX = L / manuL; cx = -((decal.x - x3) * scaleX - L / 2); cy = (decal.y - yBot) * scaleY; rotZ = Math.PI;
  } else if (panel === "p3_bot_lip") {
    scaleX = L / manuL; cx = -((decal.x - x3) * scaleX - L / 2); cy = (decal.y - (yBot + coverDepth)) * scaleY; rotZ = Math.PI;
  } else if (panel === "p2_top_dust") {
    scaleX = W / manuW; cx = (decal.x - x2) * scaleX - W / 2; cy = (yTop - decal.y) * scaleY;
  } else if (panel === "p2_bot_dust") {
    scaleX = W / manuW; cx = (decal.x - x2) * scaleX - W / 2; cy = (decal.y - yBot) * scaleY; scaleY_sign = -1;
  } else if (panel === "p4_top_dust") {
    scaleX = W / manuW; cx = (decal.x - x4) * scaleX - W / 2; cy = (yTop - decal.y) * scaleY;
  } else if (panel === "p4_bot_dust") {
    scaleX = W / manuW; cx = (decal.x - x4) * scaleX - W / 2; cy = (decal.y - yBot) * scaleY; scaleY_sign = -1;
  } else if (panel === "p1_glue") {
    scaleX = L / manuL; cx = (decal.x - x1) * scaleX; cy = (yTop - decal.y) * scaleY + H / 2;
  }

  const decalW = Math.max(0.001, decal.width * scaleX);
  const decalH = Math.max(0.001, decal.height * scaleY) * scaleY_sign;

  const isText = decal.type === 'text';
  const textUrl = React.useMemo(() => isText ? createTextTextureURL(decal) : null, [decal]);
  const texture = useTexture(isText ? textUrl : decal.url);

  React.useEffect(() => {
    if (texture) {
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const isInside = decal.surface === "Inside";

  // For outside: projector at nT + epsilon, looking towards -Z, hitting Z=nT.
  // For inside: projector at -epsilon, looking towards +Z (rotated by PI), hitting Z=0.
  let rotY = 0;
  let finalDecalW = decalW;
  if (isInside) {
    rotY = Math.PI;
    finalDecalW = -decalW;
  }

  // Decal projector bounding box spans `depth` centered at `zPos`.
  // For outside: center at Z=nT. Spans [nT - depth/2, nT + depth/2]. Hits Z=nT front face.
  // For inside: center at Z=0. Spans [-depth/2, +depth/2]. Hits Z=0 back face.
  const depth = 0.01;
  const zPos = isInside ? 0 : nT;

  return (
    <Decal position={[cx, cy, zPos]} rotation={[0, rotY, rotZ]} scale={[finalDecalW, decalH, depth]}>
      <meshStandardMaterial map={texture} transparent depthTest={true} depthWrite={false} polygonOffset polygonOffsetFactor={-1} side={THREE.FrontSide} />
    </Decal>
  );
}

function MappedDecals({ panel, decals, L, W, H, manuL, manuW, manuH, dims, T }) {
  if (!decals || decals.length === 0) return null;
  const { x1, x2, x3, x4, x5, yTop, yBot } = dims;

  const coverDepth = W - 2 * (Math.max(0.015, Number(T) || 0.0197));
  const lipDepth = W * (14.25 / 60);
  const dustH = W * (38 / 60);

  const panelDecals = decals.filter(d => {
    const minX = d.x - d.width / 2;
    const maxX = d.x + d.width / 2;
    const minY = d.y - d.height / 2;
    const maxY = d.y + d.height / 2;

    const overlap = (px1, px2, py1, py2) => (maxX > px1 && minX < px2 && maxY > py1 && minY < py2);

    if (panel === "p1") return overlap(x1, x2, yTop, yBot);
    if (panel === "p2") return overlap(x2, x3, yTop, yBot);
    if (panel === "p3") return overlap(x3, x4, yTop, yBot);
    if (panel === "p4") return overlap(x4, x5, yTop, yBot);

    if (panel === "p1_top_cover") return overlap(x1, x2, yTop - coverDepth, yTop);
    if (panel === "p1_top_lip") return overlap(x1, x2, yTop - coverDepth - lipDepth, yTop - coverDepth);
    
    if (panel === "p3_top_cover") return overlap(x3, x4, yTop - coverDepth, yTop);
    if (panel === "p3_top_lip") return overlap(x3, x4, yTop - coverDepth - lipDepth, yTop - coverDepth);

    if (panel === "p3_bot_cover") return overlap(x3, x4, yBot, yBot + coverDepth);
    if (panel === "p3_bot_lip") return overlap(x3, x4, yBot + coverDepth, yBot + coverDepth + lipDepth);

    if (panel === "p2_top_dust") return overlap(x2, x3, yTop - dustH, yTop);
    if (panel === "p2_bot_dust") return overlap(x2, x3, yBot, yBot + dustH);

    if (panel === "p4_top_dust") return overlap(x4, x5, yTop - dustH, yTop);
    if (panel === "p4_bot_dust") return overlap(x4, x5, yBot, yBot + dustH);

    if (panel === "p1_glue") return overlap(x1 - W * (16 / 60), x1, yTop, yBot);

    return false;
  });

  return (
    <>
      {panelDecals.map(d => (
        <React.Suspense fallback={null} key={d.id}>
          <DecalItem decal={d} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} panel={panel} T={T} />
        </React.Suspense>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURAL TEXTURE GENERATOR
// Creates a canvas-based material texture for each preset.
// Includes organic fiber grain and diagonal "Dacdora" watermarks.
// ─────────────────────────────────────────────────────────────────────────────
function createProceduralTexture(materialPreset, packageColor) {
  if (typeof window === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Exact RGB extraction from the reference image
  let r, g, b;

  switch (materialPreset) {
    case "natural-kraft":
      r = 203; g = 171; b = 125; // #CBAB7D
      break;
    case "corrugated-kraft":
      // Pre-brightened golden-sandy kraft to perfectly counteract tone-mapping darkening
      r = 230; g = 192; b = 145;
      break;
    case "matte-black":
      r = 34; g = 34; b = 34;
      break;
    case "gold-foil":
      r = 214; g = 169; b = 74;
      break;
    default: // white-kraft
      r = 250; g = 250; b = 250;
  }

  if (packageColor && packageColor !== "transparent") {
    const hex = packageColor.replace(/^#/, '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  // We generate noise at a very small size (128x128) and scale it up to 1024x1024.
  // This creates large, chunky "fibers" and recycled specks that are clearly visible
  // even from a distance, mimicking real cardboard rather than microscopic dust.
  const noiseSize = 128;
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseSize;
  noiseCanvas.height = noiseSize;
  const noiseCtx = noiseCanvas.getContext("2d");
  const imgData = noiseCtx.createImageData(noiseSize, noiseSize);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noiseVal = Math.random();
    // 1. Continuous subtle base grain (+/- 7.5 variance for cleaner texture)
    let intensity = (noiseVal - 0.5) * 15;

    // 2. Dense, dark recycled paper flecks
    if (Math.random() < 0.02) {
      intensity -= 10 + Math.random() * 15;
    }
    // 3. Subtle bright paper fibers
    if (Math.random() < 0.02) {
      intensity += 10 + Math.random() * 15;
    }

    data[i] = Math.min(255, Math.max(0, r + intensity));     // R
    data[i + 1] = Math.min(255, Math.max(0, g + intensity));       // G
    data[i + 2] = Math.min(255, Math.max(0, b + intensity));       // B
    data[i + 3] = 255;                                             // Alpha
  }
  noiseCtx.putImageData(imgData, 0, 0);

  // Disable image smoothing so the 128x128 noise scales up as crisp, chunky pixels
  // instead of becoming a blurry, featureless gradient!
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, 1024, 1024);

  // Add subtle vertical corrugated fluting lines for corrugated board
  if (materialPreset === "corrugated-kraft") {
    for (let x = 0; x < 1024; x += 32) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; // Flute shadow (increased visibility)
      ctx.fillRect(x, 0, 16, 1024);
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)"; // Flute highlight (increased visibility)
      ctx.fillRect(x + 16, 0, 16, 1024);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace; // CRITICAL for accurate color rendering

  return tex;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMOOTH EASE-IN-OUT (cubic)
// ─────────────────────────────────────────────────────────────────────────────
const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

function stageProgress(progress, start, end) {
  return easeInOut(Math.max(0, Math.min(1, (progress - start) / (end - start))));
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY BUILDER
// All dimensions in inches. Returns all ExtrudeGeometry objects for the box.
// ─────────────────────────────────────────────────────────────────────────────
function assignMaterialGroups(geom, nT) {
  if (!geom.index) return;
  geom.computeBoundingBox();
  const maxZ = geom.boundingBox.max.z;
  const minZ = geom.boundingBox.min.z;

  const pos = geom.attributes.position;
  const index = geom.index.array;

  const groups = [];
  let currentGroup = { start: 0, count: 0, materialIndex: -1 };

  for (let i = 0; i < index.length; i += 3) {
    const a = index[i];
    const b = index[i + 1];
    const c = index[i + 2];

    const zA = pos.getZ(a);
    const zB = pos.getZ(b);
    const zC = pos.getZ(c);

    let mat = 2; // edge by default
    const isOutside = Math.abs(zA - maxZ) < 0.001 && Math.abs(zB - maxZ) < 0.001 && Math.abs(zC - maxZ) < 0.001;
    const isInside = Math.abs(zA - minZ) < 0.001 && Math.abs(zB - minZ) < 0.001 && Math.abs(zC - minZ) < 0.001;

    if (isOutside) {
      mat = 0; // outside face
    } else if (isInside) {
      mat = 1; // inside face
    }

    if (mat === currentGroup.materialIndex) {
      currentGroup.count += 3;
    } else {
      if (currentGroup.count > 0) groups.push(currentGroup);
      currentGroup = { start: i, count: 3, materialIndex: mat };
    }
  }
  if (currentGroup.count > 0) groups.push(currentGroup);
  geom.groups = groups;
}

function buildBoxGeometries(L, W, H, nT) {
  const extrude = { depth: nT, bevelEnabled: false };

  // --- Derived flap dimensions (perfect mathematical proportions based on SVG) ---
  const coverDepth = W - 2 * nT; // Exactly spans inner box depth (W minus front/back panel thickness)
  const lipDepth = W * (14.25 / 60);
  // ── Panel 1 & 3 (front/back, L × H) ─────────────────────────────────────
  // Expanded by nT on left/right to seamlessly cover the thickness of side panels
  const p13Shape = new THREE.Shape();
  p13Shape.moveTo(-L / 2 - nT, -H / 2);
  p13Shape.lineTo(L / 2 + nT, -H / 2);
  p13Shape.lineTo(L / 2 + nT, H / 2);
  p13Shape.lineTo(-L / 2 - nT, H / 2);
  p13Shape.closePath();

  // ── Panel 2 & 4 (sides, W × (H−2nT)) ──────────────────────────────────────
  const p24Shape = new THREE.Shape();
  p24Shape.moveTo(0, -H / 2 + nT);
  p24Shape.lineTo(W, -H / 2 + nT);
  p24Shape.lineTo(W, H / 2 - nT);
  p24Shape.lineTo(0, H / 2 - nT);
  p24Shape.closePath();

  // ── Glue Flap (angled trapezoid, hinges on Panel 1's left edge) ──────────
  const glueFlapW = W * (16 / 60);
  const glueStep = H * (4.287 / 160);
  const glueShape = new THREE.Shape();
  glueShape.moveTo(0, H / 2);
  glueShape.lineTo(-glueFlapW, H / 2 - glueStep);
  glueShape.lineTo(-glueFlapW, -H / 2 + glueStep);
  glueShape.lineTo(0, -H / 2);
  glueShape.closePath();

  // ── Tuck Cover (perfectly straight rectangle) ────────
  const coverShape = new THREE.Shape();
  const hw = L / 2;
  coverShape.moveTo(-hw, 0);
  coverShape.lineTo(-hw, coverDepth);
  coverShape.lineTo(hw, coverDepth);
  coverShape.lineTo(hw, 0);
  coverShape.closePath();

  // ── Tuck Insert Lip (rounded corners, inset slightly from cover) ──────────────
  const lipW = L - 2 * (L * (0.5 / 120)); // 0.5mm inset on each side
  const lipStraightH = W * (6.25 / 60);
  const tipR = W * (8.0 / 60);

  const lipShape = new THREE.Shape();
  lipShape.moveTo(-lipW / 2, 0);
  lipShape.lineTo(-lipW / 2, lipStraightH);
  lipShape.quadraticCurveTo(-lipW / 2, lipDepth, -lipW / 2 + tipR, lipDepth);
  lipShape.lineTo(lipW / 2 - tipR, lipDepth);
  lipShape.quadraticCurveTo(lipW / 2, lipDepth, lipW / 2, lipStraightH);
  lipShape.lineTo(lipW / 2, 0);
  lipShape.closePath();

  // ── Dust Flap — Panel 2 side (SVG precise profile) ──
  const dustP2Shape = new THREE.Shape();
  const dW = W;
  const dH = dW * (38 / 60);

  dustP2Shape.moveTo(-dW / 2 + dW * (1.065 / 60), 0);
  dustP2Shape.lineTo(-dW / 2 + dW * (3.5 / 60), dW * (3.5 / 60));
  dustP2Shape.lineTo(-dW / 2 + dW * (4.5 / 60), dH);

  const cStartX = dW / 2 - dW * (17.154 / 60);
  dustP2Shape.lineTo(cStartX, dH);

  const cEndX = cStartX + dW * (8.769 / 60);
  const cEndY = dH - dW * (6.975 / 60);
  dustP2Shape.quadraticCurveTo(cEndX, dH, cEndX, cEndY);

  dustP2Shape.lineTo(cEndX + dW * (5.085 / 60), cEndY - dW * (22.025 / 60));
  dustP2Shape.lineTo(cEndX + dW * (8.085 / 60), cEndY - dW * (25.025 / 60));
  dustP2Shape.lineTo(dW / 2 - dW * (0.3 / 60), 0);
  dustP2Shape.closePath();

  // ── Dust Flap — Panel 4 side (perfect mirror of Panel 2) ──
  const dustP4Shape = new THREE.Shape();
  dustP4Shape.moveTo(dW / 2 - dW * (1.065 / 60), 0);
  dustP4Shape.lineTo(dW / 2 - dW * (3.5 / 60), dW * (3.5 / 60));
  dustP4Shape.lineTo(dW / 2 - dW * (4.5 / 60), dH);
  dustP4Shape.lineTo(-cStartX, dH);
  dustP4Shape.quadraticCurveTo(-cEndX, dH, -cEndX, cEndY);
  dustP4Shape.lineTo(-cEndX - dW * (5.085 / 60), cEndY - dW * (22.025 / 60));
  dustP4Shape.lineTo(-cEndX - dW * (8.085 / 60), cEndY - dW * (25.025 / 60));
  dustP4Shape.lineTo(-dW / 2 + dW * (0.3 / 60), 0);
  dustP4Shape.closePath();

  const geoms = {
    p13Geom: new THREE.ExtrudeGeometry(p13Shape, extrude),
    p24Geom: new THREE.ExtrudeGeometry(p24Shape, extrude),
    glueGeom: new THREE.ExtrudeGeometry(glueShape, extrude),
    coverGeom: new THREE.ExtrudeGeometry(coverShape, extrude),
    lipGeom: new THREE.ExtrudeGeometry(lipShape, extrude),
    dustP2Geom: new THREE.ExtrudeGeometry(dustP2Shape, extrude),
    dustP4Geom: new THREE.ExtrudeGeometry(dustP4Shape, extrude),
  };

  Object.values(geoms).forEach(geom => assignMaterialGroups(geom, nT));

  return {
    ...geoms,
    coverDepth, lipDepth,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Box3DViewer({
  L,
  W,
  H,
  T,
  decals = [],
  progress = 0.85,
  materialPreset = "corrugated-kraft",
  lightingPreset = "studio",
  overrideLayout = null,
  boxModelOverride = null,
}) {
  const store = useBoxStore();
  const currentBoxModel = boxModelOverride || store.boxModel;
  const nT = Math.max(0.015, Number(T) || 0.0197);

  // Match 2D SVG dims EXACTLY
  let manuL = L, manuW = W, manuH = H;
  if (store.sizeMode === 'inner') {
    manuL = L + 2 * T; manuW = W + 2 * T; manuH = H + 2 * T;
  } else if (store.sizeMode === 'outer') {
    manuL = L - 2 * T; manuW = W - 2 * T; manuH = H - 2 * T;
  }

  const dieline = useMemo(() => {
    if (currentBoxModel === 'te') {
      return generateTEDielineDXF({
        L: manuL, W: manuW, H: manuH, T,
        glueFlapWidth: store.glueFlapWidth,
        bleed: store.bleed,
      });
    }
    return generateRTEDieline({
      L: manuL, W: manuW, H: manuH, T,
      glueFlapWidth: store.glueFlapWidth,
      bleed: store.bleed,
      method: store.generatorMethod
    });
  }, [manuL, manuW, manuH, T, store.glueFlapWidth, store.bleed, store.generatorMethod, currentBoxModel]);

  const dims = dieline.dimensions;

  // ── 5-stage kinematics (each stage spans 0.2 of total progress) ──────────
  // Stage 1 (0.00–0.20): Sleeve tube forms — all 4 panels fold into rectangle
  const tubeAngle = stageProgress(progress, 0.00, 0.20) * (Math.PI / 2);

  // Stage 2 (0.20–0.40): Bottom dust flaps fold 90° inward
  const bdAngle = stageProgress(progress, 0.20, 0.40) * (Math.PI / 2);

  // Stage 3 (0.40–0.60): Bottom tuck cover folds + lip inserts
  const btAngle = stageProgress(progress, 0.40, 0.60) * (Math.PI / 2);
  const btLipAngle = stageProgress(progress, 0.40, 0.60) * (105 * Math.PI / 180);

  // Stage 4 (0.60–0.80): Top dust flaps fold 90° inward
  const tdAngle = stageProgress(progress, 0.60, 0.80) * (Math.PI / 2);

  // Stage 5 (0.80–1.00): Top tuck cover folds + lip inserts to close box
  const ttAngle = stageProgress(progress, 0.80, 1.00) * (Math.PI / 2);
  const ttLipAngle = stageProgress(progress, 0.80, 1.00) * (105 * Math.PI / 180);

  // ── Build geometry (memoized — only rebuilds when dimensions change) ──────
  const geoms = useMemo(
    () => buildBoxGeometries(L, W, H, nT),
    [L, W, H, nT]
  );
  const { p13Geom, p24Geom, glueGeom, coverGeom, lipGeom, dustP2Geom, dustP4Geom, coverDepth } = geoms;

  // ── Procedural texture ────────────────────────────────────────────────────
  const texture = useMemo(() => {
    return createProceduralTexture(materialPreset, store.packageColor);
  }, [materialPreset, store.packageColor]);

  // ── Materials (3 layers: outside surface, inside face, cut edges) ─────────
  const [outsideMat, insideMat, edgeMat, flapMat] = useMemo(() => {
    const roughness = materialPreset === "gold-foil" ? 0.25 : 0.95; // Rougher for more matte look
    const metalness = materialPreset === "gold-foil" ? 0.75 : 0.00;
    // Increased bump scale so the chunky paper fibers cast micro-shadows from a distance
    const bumpScale = materialPreset === "corrugated-kraft" ? 0.009 : 0.005;
    const texProps = texture
      ? { map: texture, bumpMap: texture, bumpScale }
      : {};

    const outside = new THREE.MeshStandardMaterial({
      roughness, metalness, side: THREE.FrontSide, ...texProps,
    });

    // Inside of the box — slightly different tone
    let insideHex = "#eeeae3"; // white paperboard inside
    if (materialPreset === "natural-kraft") insideHex = "#cdae7d";
    if (materialPreset === "corrugated-kraft") insideHex = "#c09765";
    if (materialPreset === "matte-black") insideHex = "#252525";
    if (materialPreset === "gold-foil") insideHex = "#f0d890";

    if (store.insideColor && store.insideColor !== "transparent") {
      insideHex = store.insideColor;
    }

    const inside = new THREE.MeshStandardMaterial({
      color: insideHex, roughness: 0.96, metalness: 0.0, side: THREE.DoubleSide,
    });

    // Cut edges of the board
    let edgeHex = "#d8d4cc"; // white board cross-section
    if (materialPreset === "natural-kraft") edgeHex = "#a28258";
    if (materialPreset === "corrugated-kraft") edgeHex = "#957248";
    if (materialPreset === "matte-black") edgeHex = "#303030";
    if (materialPreset === "gold-foil") edgeHex = "#c08a10";
    
    if (store.packageColor && store.packageColor !== "transparent") {
      edgeHex = store.packageColor; // Hide seams by matching edge color to package color
    }

    const edge = new THREE.MeshStandardMaterial({
      color: edgeHex, roughness: 0.95, metalness: 0.0,
    });

    // Flap material — DoubleSide so both faces show when flap is flat
    const flap = new THREE.MeshStandardMaterial({
      roughness, metalness, side: THREE.DoubleSide, ...texProps,
    });

    return [outside, inside, edge, flap];
  }, [materialPreset, texture, store.insideColor]);

  // Panels use [outside, inside, edge] multi-material
  const panelMats = [outsideMat, insideMat, edgeMat];

  // ── Lighting presets ──────────────────────────────────────────────────────
  const lighting = useMemo(() => {
    switch (lightingPreset) {
      case "warm":
        return <>
          <ambientLight intensity={0.80} color="#fff6e8" />
          <directionalLight position={[10, 14, 10]} intensity={1.1} color="#fff0d8" castShadow />
          <directionalLight position={[-5, 6, -4]} intensity={0.25} color="#c8d8ff" />
        </>;
      case "dramatic":
        return <>
          <ambientLight intensity={0.15} />
          <spotLight position={[6, 14, 8]} intensity={2.0} angle={0.28} penumbra={0.9} castShadow />
          <pointLight position={[-4, -6, 4]} intensity={0.3} color="#4488ff" />
        </>;
      default: // studio
        return <>
          {/* Lower ambient light to prevent blending into the white background */}
          <ambientLight intensity={0.60} color="#ffffff" />
          {/* Main key light from front-top-right */}
          <directionalLight position={[8, 12, 12]} intensity={0.40} castShadow />
          {/* Soft fill light from front-left */}
          <directionalLight position={[-8, 6, 8]} intensity={0.15} color="#f0f5ff" />
          {/* Strong rim light from the back to define edges against the background */}
          <directionalLight position={[0, 10, -15]} intensity={0.35} color="#ffffff" />
        </>;
    }
  }, [lightingPreset]);

  // ── Scene Layout Instances ───────────────────────────────────────────────
  const sceneInstances = useMemo(() => {
    const layout = overrideLayout || store.sceneLayout || "single";
    const gap = 0.05;
    if (layout === 'stacked2') {
      return [
        { key: 'box1', pos: [0, -H/2 - gap, 0], rot: [0, 0, 0] },
        { key: 'box2', pos: [0, H/2 + gap, 0], rot: [0, 0, 0] },
      ];
    }
    if (layout === 'stacked3') {
      return [
        { key: 'box1', pos: [0, -H - gap*2, 0], rot: [0, 0, 0] },
        { key: 'box2', pos: [0, 0, 0], rot: [0, 0, 0] },
        { key: 'box3', pos: [0, H + gap*2, 0], rot: [0, 0, 0] },
      ];
    }
    if (layout === 'sidebyside') {
      return [
        { key: 'box1', pos: [-L/2 - gap, 0, 0], rot: [0, 0, 0] },
        { key: 'box2', pos: [L/2 + gap, 0, 0], rot: [0, 0, 0] },
      ];
    }
    if (layout === 'offset') {
      return [
        { key: 'box1', pos: [-L/4, -H/2 - gap, 0], rot: [0, 0, 0] },
        { key: 'box2', pos: [L/4, H/2 + gap, -W/2], rot: [0, -Math.PI/12, 0] },
      ];
    }
    if (layout === 'cascade') {
      return [
        { key: 'box1', pos: [-L/2, -H/2 - gap, W/2], rot: [0, 0, 0] },
        { key: 'box2', pos: [0, H/2 + gap, -W/4], rot: [0, -Math.PI/16, 0] },
        { key: 'box3', pos: [L/2, H*1.5 + gap*3, -W], rot: [0, -Math.PI/8, 0] },
      ];
    }
    return [{ key: 'box1', pos: [0, 0, 0], rot: [0, 0, 0] }];
  }, [store.sceneLayout, overrideLayout, L, W, H]);

  const renderBoxInstance = (key, pos, rot) => (
    <group key={key} position={pos} rotation={rot}>
      {/* ── PANEL 1 (FRONT anchor panel, L × H) ── */}
      <group position={[0, 0, -nT]}>
        <mesh geometry={p13Geom} material={panelMats}>
          <MappedDecals panel="p1" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
        </mesh>

        {/* PANEL 1 TOP TUCK (ONLY FOR RTE) */}
        {currentBoxModel !== 'te' && (
        <group position={[0, H / 2, 0]} rotation={[-ttAngle, 0, 0]}>
          <mesh geometry={coverGeom} material={flapMat}>
            <MappedDecals panel="p1_top_cover" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
          </mesh>
          {/* Tuck insert lip — folds slightly past 90° to lock inside */}
          <group position={[0, coverDepth, 0]} rotation={[-ttLipAngle, 0, 0]}>
            <mesh geometry={lipGeom} position={[0, 0, -nT]} material={flapMat}>
              <MappedDecals panel="p1_top_lip" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
            </mesh>
          </group>
        </group>
        )}

      </group>

      {/* ── GLUE FLAP (hinges off Panel 1's left edge, tucks behind P4) ── */}
      <group position={[-L / 2 + nT, 0, -nT]} rotation={[0, -tubeAngle * 0.98, 0]}>
        <mesh geometry={glueGeom} material={flapMat}>
          <MappedDecals panel="p1_glue" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
        </mesh>
      </group>

      {/* ── PANEL 2 (RIGHT SIDE, W × H) ── */}
      <group position={[L / 2, 0, 0]} rotation={[0, tubeAngle, 0]}>
        <mesh geometry={p24Geom} material={panelMats}>
          <MappedDecals panel="p2" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
        </mesh>

        {/* P2 TOP DUST FLAP */}
        <group position={[W / 2, H / 2 - nT, 0]} rotation={[-tdAngle, 0, 0]}>
          <mesh geometry={dustP2Geom} material={flapMat}>
            <MappedDecals panel="p2_top_dust" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
          </mesh>
        </group>

        {/* P2 BOTTOM DUST FLAP */}
        <group position={[W / 2, -H / 2 + nT, 0]} rotation={[bdAngle, 0, 0]}>
          <mesh geometry={dustP4Geom} rotation={[Math.PI, 0, 0]} material={flapMat}>
            <MappedDecals panel="p2_bot_dust" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
          </mesh>
        </group>

        {/* ── PANEL 3 (BACK, L × H) ── */}
        <group position={[W, 0, 0]} rotation={[0, tubeAngle, 0]}>
          <mesh geometry={p13Geom} position={[L / 2, 0, -nT]} material={panelMats}>
            <MappedDecals panel="p3" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
          </mesh>

          {/* BOTTOM TUCK COVER */}
          <group position={[L / 2, -H / 2, -nT]} rotation={[btAngle, 0, 0]}>
            <mesh geometry={coverGeom} rotation={[0, 0, Math.PI]} material={flapMat}>
              <MappedDecals panel="p3_bot_cover" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
            </mesh>
            <group position={[0, -coverDepth, 0]} rotation={[btLipAngle, 0, 0]}>
              <mesh geometry={lipGeom} position={[0, 0, -nT]} rotation={[0, 0, Math.PI]} material={flapMat}>
                <MappedDecals panel="p3_bot_lip" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
              </mesh>
            </group>
          </group>
          
          {/* TE ONLY: TOP TUCK COVER */}
          {store.boxModel === 'te' && (
          <group position={[L / 2, H / 2, -nT]} rotation={[-ttAngle, 0, 0]}>
            <mesh geometry={coverGeom} material={flapMat}>
              <MappedDecals panel="p3_top_cover" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
            </mesh>
            <group position={[0, coverDepth, 0]} rotation={[-ttLipAngle, 0, 0]}>
              <mesh geometry={lipGeom} position={[0, 0, -nT]} material={flapMat}>
                <MappedDecals panel="p3_top_lip" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
              </mesh>
            </group>
          </group>
          )}

          {/* ── PANEL 4 (LEFT SIDE, W × H) ── */}
          <group position={[L, 0, 0]} rotation={[0, tubeAngle, 0]}>
            <mesh geometry={p24Geom} material={panelMats}>
              <MappedDecals panel="p4" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
            </mesh>

            {/* P4 TOP DUST FLAP */}
            <group position={[W / 2, H / 2 - nT, 0]} rotation={[-tdAngle, 0, 0]}>
              <mesh geometry={dustP4Geom} material={flapMat}>
                <MappedDecals panel="p4_top_dust" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
              </mesh>
            </group>

            {/* P4 BOTTOM DUST FLAP */}
            <group position={[W / 2, -H / 2 + nT, 0]} rotation={[bdAngle, 0, 0]}>
              <mesh geometry={dustP2Geom} rotation={[Math.PI, 0, 0]} material={flapMat}>
                <MappedDecals panel="p4_bot_dust" decals={decals} L={L} W={W} H={H} manuL={manuL} manuW={manuW} manuH={manuH} dims={dims} T={T} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );

  // ── Camera ────────────────────────────────────────────────────────────────
  const camPos = [L * 1.15, H * 0.55, W * 3.2];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        flat // CRITICAL: Disables cinematic tone mapping so exact hex colors render accurately!
        camera={{ position: camPos, fov: 38 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        shadows
      >
        <Environment preset="city" />
        {lighting}

        {/* ═══════════════════════════════════════════════════════════════
            BOX GROUP — all geometry is relative to the box center
            Coordinate system:
              • Panel 1 (FRONT) centered at origin, face toward +Z
              • +X = right,  +Y = up,  +Z = toward viewer
              • Box interior is in the −Z half-space
        ═══════════════════════════════════════════════════════════════ */}
        <group rotation={(overrideLayout || store.sceneLayout || 'single') !== 'single' ? [Math.PI / 6, -Math.PI / 4, 0] : [0, 0, 0]}>
          {sceneInstances.map((inst) => renderBoxInstance(inst.key, inst.pos, inst.rot))}
        </group>

        {/* Orbit controls — pan disabled, distance clamped for clean UX */}
        <OrbitControls
          enablePan={false}
          minDistance={W * 1.5}
          maxDistance={Math.max(L, H) * 5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.88}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
