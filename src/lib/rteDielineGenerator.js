export function generateRTEDielineLegacy({ L, W, H, T = 0.018, glueFlapWidth = 0.625, bleed = 0.125 }) {
  const nL = Number(L);
  const nW = Number(W);
  const nH = Number(H);
  const nGlue = Number(glueFlapWidth);
  const nBleed = Number(bleed);

  const x0 = 0;
  const x1 = nGlue;
  const x2 = x1 + nL;
  const x3 = x2 + nW;
  const x4 = x3 + nL;
  const x5 = x4 + nW;

  const coverD = nW; 
  const lipD = 0.625; 
  const flap1D = coverD + lipD; 
  
  // DYNAMIC THICKNESS OFFSETS
  const actualDustD = (coverD + lipD) / 2; 
  const glueStepBack = Math.max(0.125, T * 1.2);
  
  // FLAP PROPORTIONS
  const tR     = Math.max(0.03, Math.min(0.125, nL * 0.15));
  const tIns   = Math.max(0.0625, Math.min(T * 2, nL * 0.12)); 
  const tDraft = Math.max(0.03, Math.min(0.0625, nL * 0.08));
  
  const gap = Math.max(0.0625, T * 1.5);
  const vRoot = 0.03125;
  const vDrop = 0.125;

  const lockW = 0.08;
  const lockH = 0.06;

  const yTop = coverD + lipD; 
  const yBot = yTop + nH;

  // --- MANUFACTURER'S JOINT ---
  function gluePath() {
    return `M ${x1},${yTop} L ${x0},${yTop + glueStepBack} L ${x0},${yBot - glueStepBack} L ${x1},${yBot}`;
  }

  // --- BIG TUCK FLAP (Friction Lock Tabs matching Pacdora exactly) ---
  function tuckPath(xL, xR, yBase, dir) {
    const dY = dir === 1 ? -1 : 1;
    const yCrease = yBase + dY * coverD;
    
    if (dir === 1) { 
      // Top Tuck (Panel 1) - Left to Right
      return `M ${xL},${yBase} ` +
             `L ${xL + tIns},${yBase} ` +
             `L ${xL + tIns},${yCrease + lockH} ` +
             `L ${xL + tIns + lockW},${yCrease + lockH} ` +
             `L ${xL + tIns + lockW},${yCrease - lockH} ` +
             `L ${xL + tIns},${yCrease - lockH} ` +
             `L ${xL + tIns + tDraft},${yCrease - lipD + tR} ` +
             `A ${tR} ${tR} 0 0 1 ${xL + tIns + tDraft + tR} ${yCrease - lipD} ` +
             `L ${xR - tIns - tDraft - tR},${yCrease - lipD} ` +
             `A ${tR} ${tR} 0 0 1 ${xR - tIns - tDraft} ${yCrease - lipD + tR} ` +
             `L ${xR - tIns},${yCrease - lockH} ` +
             `L ${xR - tIns - lockW},${yCrease - lockH} ` +
             `L ${xR - tIns - lockW},${yCrease + lockH} ` +
             `L ${xR - tIns},${yCrease + lockH} ` +
             `L ${xR - tIns},${yBase} ` +
             `L ${xR},${yBase}`;
    } else { 
      // Bottom Tuck (Panel 3) - Right to Left
      return `M ${xR},${yBase} ` +
             `L ${xR - tIns},${yBase} ` +
             `L ${xR - tIns},${yCrease - lockH} ` +
             `L ${xR - tIns - lockW},${yCrease - lockH} ` +
             `L ${xR - tIns - lockW},${yCrease + lockH} ` +
             `L ${xR - tIns},${yCrease + lockH} ` +
             `L ${xR - tIns - tDraft},${yCrease + lipD - tR} ` +
             `A ${tR} ${tR} 0 0 1 ${xR - tIns - tDraft - tR} ${yCrease + lipD} ` +
             `L ${xL + tIns + tDraft + tR},${yCrease + lipD} ` +
             `A ${tR} ${tR} 0 0 1 ${xL + tIns + tDraft} ${yCrease + lipD - tR} ` +
             `L ${xL + tIns},${yCrease + lockH} ` +
             `L ${xL + tIns + lockW},${yCrease + lockH} ` +
             `L ${xL + tIns + lockW},${yCrease + lockH} ` +
             `L ${xL + tIns + lockW},${yCrease - lockH} ` +
             `L ${xL + tIns},${yCrease - lockH} ` +
             `L ${xL + tIns},${yBase} ` +
             `L ${xL},${yBase}`;
    }
  }

  // --- SMALL DUST FLAP (Smooth curves and custom slants to match CAD) ---
  function dustPath(xL, xR, yBase, dir, sweepSide, isFarRight = false) {
    const dY = dir === 1 ? -1 : 1;
    const w = xR - xL;
    
    const topR = Math.min(0.125, w * 0.1);
    const slant = Math.min(0.25, w * 0.15);

    if (dir === 1) { 
      if (sweepSide === 'both') {
        const rSlant = isFarRight ? 0 : slant; 
        const rGap = isFarRight ? 0 : gap;
        const rDrop = isFarRight ? 0 : vDrop;

        return `M ${xL},${yBase} ` +
               `Q ${xL + gap * 0.5},${yBase + dY * vDrop} ${xL + gap + slant},${yBase + dY * (actualDustD - topR)} ` +
               `A ${topR} ${topR} 0 0 1 ${xL + gap + slant + topR} ${yBase + dY * actualDustD} ` +
               `L ${xR - rGap - rSlant - topR},${yBase + dY * actualDustD} ` + 
               `A ${topR} ${topR} 0 0 1 ${xR - rGap - rSlant} ${yBase + dY * (actualDustD - topR)} ` + 
               (isFarRight ? `L ${xR},${yBase}` : `Q ${xR - rGap * 0.5},${yBase + dY * rDrop} ${xR},${yBase}`);                                                                 
      } else if (sweepSide === 'right') { 
        const rSlant = isFarRight ? 0 : slant; 
        const rGap = isFarRight ? 0 : gap;
        const rDrop = isFarRight ? 0 : vDrop;

        return `M ${xL},${yBase} ` +
               `L ${xL},${yBase + dY * actualDustD} ` + 
               `L ${xR - rGap - rSlant - topR},${yBase + dY * actualDustD} ` + 
               `A ${topR} ${topR} 0 0 1 ${xR - rGap - rSlant} ${yBase + dY * (actualDustD - topR)} ` + 
               (isFarRight ? `L ${xR},${yBase}` : `Q ${xR - rGap * 0.5},${yBase + dY * rDrop} ${xR},${yBase}`);                                                                 
      } else { 
        return `M ${xL},${yBase} ` +
               `Q ${xL + gap * 0.5},${yBase + dY * vDrop} ${xL + gap + slant},${yBase + dY * (actualDustD - topR)} ` +
               `A ${topR} ${topR} 0 0 1 ${xL + gap + slant + topR} ${yBase + dY * actualDustD} ` +
               `L ${xR},${yBase + dY * actualDustD} ` + 
               `L ${xR},${yBase}`;
      }
    } else { 
      if (sweepSide === 'both') {
        const rSlant = isFarRight ? 0 : slant; 
        const rGap = isFarRight ? 0 : gap;
        const rDrop = isFarRight ? 0 : vDrop;

        return `M ${xR},${yBase} ` +
               (isFarRight ? `L ${xR},${yBase + dY * (actualDustD - topR)} ` : `Q ${xR - rGap * 0.5},${yBase + dY * rDrop} ${xR - rGap - rSlant},${yBase + dY * (actualDustD - topR)} `) +
               `A ${topR} ${topR} 0 0 1 ${xR - rGap - rSlant - topR} ${yBase + dY * actualDustD} ` +
               `L ${xL + gap + slant + topR},${yBase + dY * actualDustD} ` +
               `A ${topR} ${topR} 0 0 1 ${xL + gap + slant} ${yBase + dY * (actualDustD - topR)} ` +
               `Q ${xL + gap * 0.5},${yBase + dY * vDrop} ${xL},${yBase}`;
      } else if (sweepSide === 'right') { 
        const rSlant = isFarRight ? 0 : slant; 
        const rGap = isFarRight ? 0 : gap;
        const rDrop = isFarRight ? 0 : vDrop;

        return `M ${xR},${yBase} ` +
               (isFarRight ? `L ${xR},${yBase + dY * (actualDustD - topR)} ` : `Q ${xR - rGap * 0.5},${yBase + dY * rDrop} ${xR - rGap - rSlant},${yBase + dY * (actualDustD - topR)} `) +
               `A ${topR} ${topR} 0 0 1 ${xR - rGap - rSlant - topR} ${yBase + dY * actualDustD} ` +
               `L ${xL},${yBase + dY * actualDustD} ` +
               `L ${xL},${yBase}`;
      } else { 
        return `M ${xR},${yBase} ` +
               `L ${xR},${yBase + dY * actualDustD} ` + 
               `L ${xL + gap + slant + topR},${yBase + dY * actualDustD} ` +
               `A ${topR} ${topR} 0 0 1 ${xL + gap + slant} ${yBase + dY * (actualDustD - topR)} ` +
               `Q ${xL + gap * 0.5},${yBase + dY * vDrop} ${xL},${yBase}`;
      }
    }
  }

  // --- DYNAMIC THICKNESS-COMPENSATING BLEED PATH (perfectly contour-following!) ---
  function buildContinuousBleed(b) {
    if (b === 0) return [];
    
    const tb = tR + b;
    const topDustY = yTop + T - actualDustD - b;
    const botDustY = yBot - T + actualDustD + b;
    const slantW = Math.min(0.25, (x3 - x2) * 0.15);

    // Clamped boundary offsets to prevent bleed crossing adjacent panels
    const topTuckBleedL = Math.max(x1, x1 + tIns - b);
    const topTuckBleedR = Math.min(x2, x2 - tIns + b);
    const botTuckBleedL = Math.max(x3, x3 + tIns - b);
    const botTuckBleedR = Math.min(x4, x4 - tIns + b);
    
    let p = `M ${x1 - b},${yBot + b} `;
    
    // 1. Left Manufacturers Joint Edge
    p += `L ${x0 - b},${yBot - glueStepBack} L ${x0 - b},${yTop + glueStepBack} L ${x1 - b},${yTop + glueStepBack} `;
    
    // 2. Top Profile (Left to Right)
    // Panel 1: Tuck Flap Cover & Lip
    p += `L ${topTuckBleedL},${yTop - b} `;
    p += `L ${topTuckBleedL},${yTop - coverD} `;
    p += `L ${x1 + tIns + tDraft - b},${yTop - coverD - lipD + tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${x1 + tIns + tDraft + tR} ${yTop - coverD - lipD - b} `;
    p += `L ${x2 - tIns - tDraft - tR},${yTop - coverD - lipD - b} `;
    p += `A ${tb} ${tb} 0 0 1 ${x2 - tIns - tDraft + b} ${yTop - coverD - lipD + tR} `;
    p += `L ${x2 - tIns + b},${yTop - coverD} `;
    p += `L ${topTuckBleedR},${yTop - coverD} `;
    p += `L ${topTuckBleedR},${topDustY} `;
    
    // Bridge down to Panel 2 Dust Flap height
    p += `L ${x3 - gap - slantW + b},${topDustY} `;
    
    // Dip down above Panel 3 (flat crease line!)
    p += `L ${x3 + b},${yTop - b} `;
    p += `L ${x4 - b},${yTop - b} `;
    
    // Bridge back up to Panel 4 Dust Flap height
    p += `L ${x4 + gap + slantW - b},${topDustY} `;
    p += `L ${x5 + b},${topDustY} `;
    
    // 3. Right Panel Edge
    p += `L ${x5 + b},${botDustY} `;
    
    // 4. Bottom Profile (Right to Left)
    // Bridge under Panel 4 Dust Flap bottom height
    p += `L ${x4 + gap + slantW - b},${botDustY} `;
    
    // Dip down around Panel 3 Tuck Flap bottom
    p += `L ${botTuckBleedR},${botDustY} `;
    p += `L ${botTuckBleedR},${yBot + coverD} `;
    p += `L ${x4 - tIns - tDraft + b},${yBot + coverD + lipD - tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${x4 - tIns - tDraft - tR} ${yBot + coverD + lipD + b} `;
    p += `L ${x3 + tIns + tDraft + tR},${yBot + coverD + lipD + b} `;
    p += `A ${tb} ${tb} 0 0 1 ${x3 + tIns + tDraft - b} ${yBot + coverD + lipD - tR} `;
    p += `L ${x3 + tIns - b},${yBot + coverD} `;
    p += `L ${botTuckBleedL},${yBot + coverD} `;
    p += `L ${botTuckBleedL},${botDustY} `;
    
    // Bridge back up to Panel 2 Dust Flap bottom height
    p += `L ${x2 + gap + slantW - b},${botDustY} `;
    
    // Dip down under Panel 1 (flat crease line!)
    p += `L ${x2 - b},${yBot + b} `;
    p += `L ${x1 - b},${yBot + b} Z`;

    return [p];
  }

  const cutPaths = [
    gluePath(),
    
    // Top Profile (Left to Right)
    tuckPath(x1, x2, yTop, 1),
    
    `M ${x2},${yTop} L ${x2},${yTop + T}`,
    dustPath(x2, x3, yTop + T, 1, 'both', false),
    `M ${x3},${yTop + T} L ${x3},${yTop}`,
    
    `M ${x3},${yTop} L ${x4},${yTop}`,
    
    `M ${x4},${yTop} L ${x4},${yTop + T}`,
    dustPath(x4, x5, yTop + T, 1, 'left', true),
    
    // Right Edge
    `M ${x5},${yTop + T} L ${x5},${yBot - T}`, 
    
    // Bottom Profile (Drawn Right to Left)
    dustPath(x4, x5, yBot - T, -1, 'left', true), 
    `M ${x4},${yBot - T} L ${x4},${yBot}`, 
    tuckPath(x3, x4, yBot, -1), 
    `M ${x3},${yBot} L ${x3},${yBot - T}`, 
    dustPath(x2, x3, yBot - T, -1, 'both', false), 
    `M ${x2},${yBot - T} L ${x2},${yBot}`, 
    `M ${x2},${yBot} L ${x1},${yBot}` 
  ];

  // The horizontal folds mapped to perfectly accommodate thickness steps
  const foldLines = [
    // Vertical Folds 
    { x1: x1, y1: yTop, x2: x1, y2: yBot }, 
    { x1: x2, y1: yTop + T, x2: x2, y2: yBot - T },
    { x1: x3, y1: yTop + T, x2: x3, y2: yBot - T }, 
    { x1: x4, y1: yTop + T, x2: x4, y2: yBot - T },
    
    // Horizontal Panel Folds
    { x1: x1, y1: yTop, x2: x2, y2: yTop },           
    { x1: x2, y1: yTop + T, x2: x3, y2: yTop + T },   
    { x1: x3, y1: yTop, x2: x4, y2: yTop },           
    { x1: x4, y1: yTop + T, x2: x5, y2: yTop + T },   
    
    { x1: x1, y1: yBot, x2: x2, y2: yBot },           
    { x1: x2, y1: yBot - T, x2: x3, y2: yBot - T },   
    { x1: x3, y1: yBot, x2: x4, y2: yBot },           
    { x1: x4, y1: yBot - T, x2: x5, y2: yBot - T },   
    
    // Tuck Lip Folds (friction-lock bounded)
    { x1: x1 + tIns + lockW, y1: yTop - coverD, x2: x2 - tIns - lockW, y2: yTop - coverD }, 
    { x1: x3 + tIns + lockW, y1: yBot + coverD, x2: x4 - tIns - lockW, y2: yBot + coverD }  
  ];

  return {
    width: x5, height: yBot + coverD + lipD, cutPaths,
    bleedPaths: buildContinuousBleed(nBleed), foldLines,
    dimensions: { L: nL, W: nW, H: nH, x1, x2, x3, x4, x5, yTop, yBot }
  };
}

import { generateRTEDielineDXF } from "./dxfDielineGenerator";

export function generateRTEDieline(params) {
  const { method = "dxf" } = params;
  if (method === "legacy") {
    return generateRTEDielineLegacy(params);
  }
  return generateRTEDielineDXF(params);
}