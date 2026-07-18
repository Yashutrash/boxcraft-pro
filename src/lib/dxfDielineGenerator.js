import { dxfTemplate } from "./dxfTemplate";

/**
 * High-fidelity Parametric DXF Dieline Generator for BoxCraft Pro.
 * Parses the static template exported from Pacdora and maps its coordinates
 * dynamically to accommodate any custom L, W, H, thickness T, glue flap, and bleed.
 * 
 * Input dimensions (L, W, H, T, glueFlapWidth, bleed) are in inches.
 * Template coordinates (dxfTemplate) are in millimeters.
 * This generator converts template coordinates to inches and performs all mapping in inches.
 */
export function generateRTEDielineDXF({ L, W, H, T = 0.018, glueFlapWidth = 0.625, bleed = 0.125 }) {
  const nL = Number(L);
  const nW = Number(W);
  const nH = Number(H);
  const nGlue = Number(glueFlapWidth);
  const nBleed = Number(bleed);
  const nT = Number(T);

  const MM_TO_IN = 25.4;

  // Convert template baseline parameters to inches
  const L_tpl = 120.0 / MM_TO_IN;
  const W_tpl = 60.0 / MM_TO_IN;
  const H_tpl = 160.0 / MM_TO_IN;
  const T_tpl = 0.5 / MM_TO_IN;
  const glueFlapWidth_tpl = 16.0 / MM_TO_IN;
  const bleed_tpl = 5.0 / MM_TO_IN;

  // --- Anchors on the X-axis (in inches) ---
  const x1_new = nGlue;
  const x2_new = x1_new + nL;
  const x3_new = x2_new + nW;
  const x4_new = x3_new + nL;
  const x5_new = x4_new + nW;

  // --- Baseline anchors on the Y-axis (in inches) ---
  const yTop_base_new = nW + (15.0 / MM_TO_IN) + nBleed;
  const yBot_base_new = yTop_base_new + nH;

  // Dust flap depth for the new box (in inches)
  const dustD_new = (nW + (15.0 / MM_TO_IN)) / 2.0;

  // Helper to deform X coordinate segment-by-segment (keeps curves/locks undistorted, in inches)
  function deformX(x) {
    const x1_tpl = 16.0 / MM_TO_IN;
    const x2_tpl = 136.0 / MM_TO_IN;
    const x3_tpl = 196.0 / MM_TO_IN;
    const x4_tpl = 316.0 / MM_TO_IN;
    const x5_tpl = 376.0 / MM_TO_IN;
    
    if (x < x1_tpl) {
      // Glue flap
      return x * (nGlue / x1_tpl);
    } else if (x < x2_tpl) {
      // Panel 1 (L)
      const w_tpl = x2_tpl - x1_tpl;
      const dx = x - x1_tpl;
      if (nL >= (50.0 / MM_TO_IN)) {
        if (dx < w_tpl / 2) {
          return x1_new + dx;
        } else {
          return x2_new - (w_tpl - dx);
        }
      } else {
        return x1_new + dx * (nL / w_tpl);
      }
    } else if (x < x3_tpl) {
      // Panel 2 (W)
      const w_tpl = x3_tpl - x2_tpl;
      const dx = x - x2_tpl;
      if (nW >= (50.0 / MM_TO_IN)) {
        if (dx < w_tpl / 2) {
          return x2_new + dx;
        } else {
          return x3_new - (w_tpl - dx);
        }
      } else {
        return x2_new + dx * (nW / w_tpl);
      }
    } else if (x < x4_tpl) {
      // Panel 3 (L)
      const w_tpl = x4_tpl - x3_tpl;
      const dx = x - x3_tpl;
      if (nL >= (50.0 / MM_TO_IN)) {
        if (dx < w_tpl / 2) {
          return x3_new + dx;
        } else {
          return x4_new - (w_tpl - dx);
        }
      } else {
        return x3_new + dx * (nL / w_tpl);
      }
    } else {
      // Panel 4 (W)
      const w_tpl = x5_tpl - x4_tpl;
      const dx = x - x4_tpl;
      if (nW >= (50.0 / MM_TO_IN)) {
        if (dx < w_tpl / 2) {
          return x4_new + dx;
        } else {
          return x5_new - (w_tpl - dx);
        }
      } else {
        return x4_new + dx * (nW / w_tpl);
      }
    }
  }

  // Helper to determine template panel region for Y mapping (in inches)
  function getTemplatePanel(x) {
    const x1_tpl = 16.0 / MM_TO_IN;
    const x2_tpl = 136.0 / MM_TO_IN;
    const x3_tpl = 196.0 / MM_TO_IN;
    const x4_tpl = 316.0 / MM_TO_IN;
    
    if (x < x1_tpl) {
      return { index: 0, yTop_tpl: 79.25 / MM_TO_IN, yBot_tpl: 239.25 / MM_TO_IN, type: 'glue' };
    } else if (x < x2_tpl) {
      return { index: 1, yTop_tpl: 79.25 / MM_TO_IN, yBot_tpl: 239.25 / MM_TO_IN, type: 'L' };
    } else if (x < x3_tpl) {
      return { index: 2, yTop_tpl: 79.75 / MM_TO_IN, yBot_tpl: 239.25 / MM_TO_IN, type: 'W' };
    } else if (x < x4_tpl) {
      return { index: 3, yTop_tpl: 79.25 / MM_TO_IN, yBot_tpl: 239.25 / MM_TO_IN, type: 'L' };
    } else {
      return { index: 4, yTop_tpl: 79.75 / MM_TO_IN, yBot_tpl: 239.75 / MM_TO_IN, type: 'W' };
    }
  }

  // Helper to deform Y coordinate with cardboard thickness adjustments (in inches)
  function deformY(x, y) {
    const panel = getTemplatePanel(x);
    
    let yTop_new, yBot_new;
    if (panel.index === 0) {
      yTop_new = yTop_base_new - nT/2;
      yBot_new = yBot_base_new - nT/2;
    } else if (panel.index === 1) {
      yTop_new = yTop_base_new - nT/2;
      yBot_new = yBot_base_new - nT/2;
    } else if (panel.index === 2) {
      yTop_new = yTop_base_new + nT/2;
      yBot_new = yBot_base_new - nT/2;
    } else if (panel.index === 3) {
      yTop_new = yTop_base_new - nT/2;
      yBot_new = yBot_base_new - nT/2;
    } else if (panel.index === 4) {
      yTop_new = yTop_base_new + nT/2;
      yBot_new = yBot_base_new + nT/2;
    }

    if (y >= panel.yTop_tpl && y <= panel.yBot_tpl) {
      // Body Region
      const h_tpl = panel.yBot_tpl - panel.yTop_tpl;
      return yTop_new + (y - panel.yTop_tpl) * (nH / h_tpl);
    } else if (y < panel.yTop_tpl) {
      // Top Flap Region
      if (panel.type === 'L' || panel.type === 'glue') {
        // Panel 1/3 top tuck flap
        const yTuck_tpl = 20.0 / MM_TO_IN;
        const coverD_tpl = panel.yTop_tpl - yTuck_tpl;
        if (y >= yTuck_tpl) {
          // On cover
          return yTop_new - (panel.yTop_tpl - y) * (nW / coverD_tpl);
        } else {
          // On lip or bleed
          const yTuck_new = yTop_new - nW;
          if (y >= 5.0 / MM_TO_IN) {
            // On lip
            return yTuck_new - (yTuck_tpl - y);
          } else {
            // In bleed
            return yTuck_new - (15.0 / MM_TO_IN) - ((5.0 / MM_TO_IN) - y) * (nBleed / bleed_tpl);
          }
        }
      } else {
        // Panel 2/4 top dust flap
        const dustHeight_tpl = panel.yTop_tpl - (41.75 / MM_TO_IN);
        if (y >= 41.75 / MM_TO_IN) {
          // On dust flap
          return yTop_new - (panel.yTop_tpl - y) * (dustD_new / dustHeight_tpl);
        } else {
          // In bleed
          return yTop_new - dustD_new - ((41.75 / MM_TO_IN) - y) * (nBleed / bleed_tpl);
        }
      }
    } else {
      // Bottom Flap Region
      if (panel.index === 3) {
        // Panel 3 bottom tuck flap
        const yTuck_tpl = 299.0 / MM_TO_IN;
        const coverD_tpl = yTuck_tpl - panel.yBot_tpl;
        if (y <= yTuck_tpl) {
          // On cover
          return yBot_new + (y - panel.yBot_tpl) * (nW / coverD_tpl);
        } else {
          // On lip or bleed
          const yTuck_new = yBot_new + nW;
          if (y <= 314.0 / MM_TO_IN) {
            // On lip
            return yTuck_new + (y - yTuck_tpl);
          } else {
            // In bleed
            return yTuck_new + (15.0 / MM_TO_IN) + (y - (314.0 / MM_TO_IN)) * (nBleed / bleed_tpl);
          }
        }
      } else if (panel.type === 'W') {
        // Panel 2/4 bottom dust flap
        const dustHeight_tpl = (277.25 / MM_TO_IN) - panel.yBot_tpl;
        if (y <= 277.25 / MM_TO_IN) {
          // On dust flap
          return yBot_new + (y - panel.yBot_tpl) * (dustD_new / dustHeight_tpl);
        } else {
          // In bleed
          return yBot_new + dustD_new + (y - (277.25 / MM_TO_IN)) * (nBleed / bleed_tpl);
        }
      } else {
        // Other bottom flaps (like Panel 1 bottom line, glue flap bottom)
        return yBot_new + (y - panel.yBot_tpl);
      }
    }
  }

  // --- GLOBAL Y MAPPING FOR BLEED ---
  // The bleed contour crosses panel boundaries. Using per-panel Y mapping
  // causes discontinuities at boundary crossings. Instead, use a smooth
  // piecewise-linear mapping based on the overall template vertical structure.
  function deformY_global(y) {
    // Template vertical landmarks (in inches, SVG coords)
    const yBleedTop_tpl = 0.0;                     // Very top of bleed (above tuck lip)
    const yLipTop_tpl = 5.0 / MM_TO_IN;            // Top of tuck lip
    const yTuckTop_tpl = 20.0 / MM_TO_IN;          // Top of tuck cover
    const yDustTop_tpl = 36.75 / MM_TO_IN;         // Top of dust flap bleed
    const yDustBody_tpl = 41.75 / MM_TO_IN;        // Top of dust flap body
    const yBodyBleedTop_tpl = 74.75 / MM_TO_IN;    // Body top bleed offset
    const yBodyTop_tpl = 79.25 / MM_TO_IN;         // Body top
    const yBodyBot_tpl = 239.25 / MM_TO_IN;        // Body bottom
    const yBodyBleedBot_tpl = 244.25 / MM_TO_IN;   // Body bottom bleed offset
    const yDustBodyBot_tpl = 277.25 / MM_TO_IN;    // Bottom dust flap body
    const yDustBot_tpl = 282.25 / MM_TO_IN;        // Bottom dust flap bleed
    const yTuckBot_tpl = 299.0 / MM_TO_IN;         // Bottom of tuck cover
    const yLipBot_tpl = 314.0 / MM_TO_IN;          // Bottom of tuck lip
    const yBleedBot_tpl = 319.0 / MM_TO_IN;        // Very bottom of bleed

    // New vertical landmarks (in inches)
    const lipHeight = 15.0 / MM_TO_IN;  // Fixed lip height
    const yBleedTop_new = 0.0;
    const yLipTop_new = nBleed;
    const yTuckTop_new = nBleed + lipHeight;
    const yBodyTop_new = yTop_base_new;
    const yBodyBot_new = yBot_base_new;
    const yTuckBot_new = yBodyBot_new + nW;
    const yLipBot_new = yTuckBot_new + lipHeight;
    const yBleedBot_new = yLipBot_new + nBleed;

    // Dust flap landmarks
    const yDustTop_new = yBodyTop_new - dustD_new - nBleed;
    const yDustBody_new = yBodyTop_new - dustD_new;
    const yBodyBleedTop_new = yBodyTop_new - nBleed;
    const yBodyBleedBot_new = yBodyBot_new + nBleed;
    const yDustBodyBot_new = yBodyBot_new + dustD_new;
    const yDustBot_new = yBodyBot_new + dustD_new + nBleed;

    // Piecewise linear interpolation through key landmarks
    const tplAnchors = [
      yBleedTop_tpl, yLipTop_tpl, yTuckTop_tpl, yDustTop_tpl, yDustBody_tpl,
      yBodyBleedTop_tpl, yBodyTop_tpl, yBodyBot_tpl, yBodyBleedBot_tpl,
      yDustBodyBot_tpl, yDustBot_tpl, yTuckBot_tpl, yLipBot_tpl, yBleedBot_tpl
    ];
    const newAnchors = [
      yBleedTop_new, yLipTop_new, yTuckTop_new, yDustTop_new, yDustBody_new,
      yBodyBleedTop_new, yBodyTop_new, yBodyBot_new, yBodyBleedBot_new,
      yDustBodyBot_new, yDustBot_new, yTuckBot_new, yLipBot_new, yBleedBot_new
    ];

    // Clamp to range
    if (y <= tplAnchors[0]) return newAnchors[0];
    if (y >= tplAnchors[tplAnchors.length - 1]) return newAnchors[newAnchors.length - 1];

    // Find which segment y falls into
    for (let i = 0; i < tplAnchors.length - 1; i++) {
      if (y >= tplAnchors[i] && y <= tplAnchors[i + 1]) {
        const range_tpl = tplAnchors[i + 1] - tplAnchors[i];
        if (range_tpl < 0.0001) return newAnchors[i];
        const t = (y - tplAnchors[i]) / range_tpl;
        return newAnchors[i] + t * (newAnchors[i + 1] - newAnchors[i]);
      }
    }
    return y; // fallback
  }

  function deformPoint([x_mm, y_mm]) {
    const x = x_mm / MM_TO_IN;
    const y = y_mm / MM_TO_IN;
    return [deformX(x), deformY(x, y)];
  }

  function deformPointBleed([x_mm, y_mm]) {
    const x = x_mm / MM_TO_IN;
    const y = y_mm / MM_TO_IN;
    return [deformX(x), deformY_global(y)];
  }

  // --- SEGMENT CHAINING ENGINE ---
  // Chains adjacent segments into continuous SVG paths instead of
  // emitting each entity as a disconnected <path>. This produces
  // smooth continuous contours matching Pacdora's rendering.
  
  function nearlyEqual(a, b, tol = 0.0005) {
    return Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
  }

  // Collect deformed segments per layer
  const segmentsByLayer = { cuts: [], bleeds: [] };
  const foldLines = [];

  dxfTemplate.forEach(entity => {
    if (entity.layer === 'folds' && entity.type === 'LINE') {
      const [nx1, ny1] = deformPoint([entity.x1, entity.y1]);
      const [nx2, ny2] = deformPoint([entity.x2, entity.y2]);
      foldLines.push({ x1: nx1, y1: ny1, x2: nx2, y2: ny2 });
      return;
    }

    const layer = entity.layer;
    if (layer !== 'cuts' && layer !== 'bleeds') return;

    // Use global Y mapping for bleed, per-panel Y mapping for cuts
    if (entity.type === 'LINE') {
      const p1 = (layer === 'bleeds' ? deformPointBleed : deformPoint)([entity.x1, entity.y1]);
      const p2 = (layer === 'bleeds' ? deformPointBleed : deformPoint)([entity.x2, entity.y2]);
      segmentsByLayer[layer].push({ type: 'LINE', pts: [p1, p2] });
    } else if (entity.type === 'LWPOLYLINE') {
      const pts = entity.vertices.map(pt => (layer === 'bleeds' ? deformPointBleed : deformPoint)(pt));
      if (pts.length < 2) return;
      segmentsByLayer[layer].push({ type: 'POLYLINE', pts: pts, closed: entity.closed });
    } else if (entity.type === 'SPLINE') {
      const pts = entity.controlPoints.map(pt => (layer === 'bleeds' ? deformPointBleed : deformPoint)(pt));
      if (pts.length < 4) return;
      segmentsByLayer[layer].push({ type: 'SPLINE', pts: pts });
    }
  });

  // Chain segments into continuous SVG paths
  function chainSegments(segments) {
    if (!segments || segments.length === 0) return [];

    function nearlyEqual(a, b, tol = 0.2) {
      return Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
    }

    function reverseSegment(seg) {
      if (seg.type === 'LINE' || seg.type === 'POLYLINE') {
        return { ...seg, pts: [...seg.pts].reverse() };
      } else if (seg.type === 'SPLINE') {
        return { 
          type: 'SPLINE', 
          pts: [seg.pts[3], seg.pts[2], seg.pts[1], seg.pts[0]] 
        };
      }
      return seg;
    }

    let pool = [...segments];
    let chains = [];

    while (pool.length > 0) {
      let chain = [pool.shift()];
      let changed = true;

      while (changed) {
        changed = false;
        let head = chain[0].pts[0];
        let tail = chain[chain.length - 1].pts[chain[chain.length - 1].pts.length - 1];

        for (let i = 0; i < pool.length; i++) {
          let cand = pool[i];
          let candHead = cand.pts[0];
          let candTail = cand.pts[cand.pts.length - 1];

          if (nearlyEqual(tail, candHead)) {
            chain.push(cand);
            pool.splice(i, 1);
            changed = true;
            break;
          } else if (nearlyEqual(tail, candTail)) {
            chain.push(reverseSegment(cand));
            pool.splice(i, 1);
            changed = true;
            break;
          } else if (nearlyEqual(head, candTail)) {
            chain.unshift(cand);
            pool.splice(i, 1);
            changed = true;
            break;
          } else if (nearlyEqual(head, candHead)) {
            chain.unshift(reverseSegment(cand));
            pool.splice(i, 1);
            changed = true;
            break;
          }
        }
      }
      chains.push(chain);
    }

    return chains.map(chain => {
      let d = `M ${chain[0].pts[0][0].toFixed(5)},${chain[0].pts[0][1].toFixed(5)}`;
      
      chain.forEach(seg => {
        // Explicitly draw a line to the start of the next segment to bridge any gap
        d += ` L ${seg.pts[0][0].toFixed(5)},${seg.pts[0][1].toFixed(5)}`;
        
        if (seg.type === 'LINE') {
          d += ` L ${seg.pts[1][0].toFixed(5)},${seg.pts[1][1].toFixed(5)}`;
        } else if (seg.type === 'POLYLINE') {
          for (let i = 1; i < seg.pts.length; i++) {
            d += ` L ${seg.pts[i][0].toFixed(5)},${seg.pts[i][1].toFixed(5)}`;
          }
        } else if (seg.type === 'SPLINE') {
          d += ` C ${seg.pts[1][0].toFixed(5)},${seg.pts[1][1].toFixed(5)} ${seg.pts[2][0].toFixed(5)},${seg.pts[2][1].toFixed(5)} ${seg.pts[3][0].toFixed(5)},${seg.pts[3][1].toFixed(5)}`;
        }
      });
      return d;
    });
  }

  const cutPaths = chainSegments(segmentsByLayer.cuts);
  const bleedPaths = chainSegments(segmentsByLayer.bleeds);

  const width = x5_new;
  const height = yBot_base_new + nW + (15.0 / MM_TO_IN) + nBleed;

  const dimensions = {
    L: nL,
    W: nW,
    H: nH,
    x1: x1_new,
    x2: x2_new,
    x3: x3_new,
    x4: x4_new,
    x5: x5_new,
    yTop: yTop_base_new,
    yBot: yBot_base_new
  };

  return {
    width,
    height,
    cutPaths,
    bleedPaths,
    foldLines,
    dimensions
  };
}
