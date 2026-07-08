export function generateRTEDieline({ L, W, H, T = 0.018, glueFlapWidth = 0.625, bleed = 0.125 }) {
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
    const gap = 0.0625;    
  const vRoot = 0.03125; 
  const vDrop = 0.125; 
  
  // DYNAMIC THICKNESS OFFSETS (Pacdora Parity)
  const actualDustD = Math.max(vDrop + 0.15, (flap1D / 2) - T); 
  
  // Fixed the glue flap so it scales naturally without shrinking too much
  const glueStepBack = Math.max(0.125, T * 1.2);
  
  

  const yTop = coverD + lipD; 
  const yBot = yTop + nH;

  // --- MANUFACTURER'S JOINT (Glue Flap) ---
  function gluePath() {
    return `M ${x1},${yTop} L ${x0},${yTop + glueStepBack} L ${x0},${yBot - glueStepBack} L ${x1},${yBot}`;
  }

  // --- BIG TUCK FLAP (Flap I) ---
function tuckPath(xL, xR, yBase, dir) {
  const dY = dir === 1 ? -1 : 1;
  const sweep = dir === 1 ? 1 : 0;
  const w = xR - xL;

  // scale down as panel gets narrow, same safety pattern as dustPath
  const tR     = Math.max(0.03, Math.min(0.125, w * 0.15));
  const tIns   = Math.max(0.0625, Math.min(T * 2, w * 0.12));
  const tDraft = Math.max(0.03, Math.min(0.0625, w * 0.08));
  const tLVert = 0.125;

    return `M ${xL},${yBase} ` +
          `L ${xL},${yBase + dY * vRoot} ` + 
          `L ${xL + gap},${yBase + dY * vDrop} ` + 
          `L ${xL + gap},${yBase + dY * coverD} ` + 
          `L ${xL + gap + tIns},${yBase + dY * coverD} ` + 
          `L ${xL + gap + tIns},${yBase + dY * (coverD + tLVert)} ` + 
          `L ${xL + gap + tIns + tDraft},${yBase + dY * (coverD + lipD - tR)} ` + 
          `A ${tR} ${tR} 0 0 ${sweep} ${xL + gap + tIns + tDraft + tR} ${yBase + dY * (coverD + lipD)} ` + 
          `L ${xR - gap - tIns - tDraft - tR},${yBase + dY * (coverD + lipD)} ` + 
          `A ${tR} ${tR} 0 0 ${sweep} ${xR - gap - tIns - tDraft} ${yBase + dY * (coverD + lipD - tR)} ` + 
          `L ${xR - gap - tIns},${yBase + dY * (coverD + tLVert)} ` + 
          `L ${xR - gap - tIns},${yBase + dY * coverD} ` + 
          `L ${xR - gap},${yBase + dY * coverD} ` + 
          `L ${xR - gap},${yBase + dY * vDrop} ` + 
          `L ${xR},${yBase + dY * vRoot} ` + 
          `L ${xR},${yBase}`; 
  }

  // --- SMALL DUST FLAP (Flap II) ---
  function dustPath(xL, xR, yBase, dir, sweepSide) {
    const dY = dir === 1 ? -1 : 1;
    const arcSweep = dir === 1 ? 1 : 0;
    const w = xR - xL;
    
    const maxLargeR = actualDustD - vDrop - 0.05;
    const safeLargeR = Math.max(0.05, Math.min(w * 0.35, maxLargeR));
    const slantW = Math.max(0.125, w * 0.1); 

    if (sweepSide === 'right') {
      return `M ${xL},${yBase} ` +
            `L ${xL},${yBase + dY * vRoot} ` +
            `L ${xL + gap},${yBase + dY * vDrop} ` +
            `L ${xL + gap},${yBase + dY * actualDustD} ` +
            `L ${xR - gap - slantW - safeLargeR},${yBase + dY * actualDustD} ` +
            `A ${safeLargeR} ${safeLargeR} 0 0 ${arcSweep} ${xR - gap - slantW} ${yBase + dY * (actualDustD - safeLargeR)} ` +
            `L ${xR - gap},${yBase + dY * vDrop} ` +
            `L ${xR},${yBase + dY * vRoot} ` +
            `L ${xR},${yBase}`;
    } else {
      return `M ${xL},${yBase} ` +
            `L ${xL},${yBase + dY * vRoot} ` +
            `L ${xL + gap},${yBase + dY * vDrop} ` +
            `L ${xL + gap + slantW},${yBase + dY * (actualDustD - safeLargeR)} ` +
            `A ${safeLargeR} ${safeLargeR} 0 0 ${arcSweep} ${xL + gap + slantW + safeLargeR} ${yBase + dY * actualDustD} ` +
            `L ${xR - gap},${yBase + dY * actualDustD} ` +
            `L ${xR - gap},${yBase + dY * vDrop} ` +
            `L ${xR},${yBase + dY * vRoot} ` +
            `L ${xR},${yBase}`;
    }
  }

  function getDustBleed(xL, xR, yBase, dir, sweepSide, b) {
    const dY = dir === 1 ? -1 : 1;
    const w = xR - xL;
    
    const maxLargeR = actualDustD - vDrop - 0.05;
    const safeLargeR = Math.max(0.05, Math.min(w * 0.35, maxLargeR));
    const slantW = Math.max(0.125, w * 0.1);

    let s = "";
    if (dir === 1) {
      if (sweepSide === 'right') {
        s += `L ${xL},${yBase - b} `; 
        s += `L ${xL + gap - b},${yBase - vDrop} `;
        s += `L ${xL + gap - b},${yBase - actualDustD - b} `; 
        s += `L ${xR - gap - slantW - safeLargeR},${yBase - actualDustD - b} `;
        s += `A ${safeLargeR+b} ${safeLargeR+b} 0 0 1 ${xR - gap - slantW + b} ${yBase - actualDustD + safeLargeR} `;
        s += `L ${xR - gap + b},${yBase - vDrop} `; 
        s += `L ${xR},${yBase - b} `; 
      } else {
        s += `L ${xL},${yBase - b} `;
        s += `L ${xL + gap - b},${yBase - vDrop} `;
        s += `L ${xL + gap + slantW - b},${yBase - actualDustD + safeLargeR} `;
        s += `A ${safeLargeR+b} ${safeLargeR+b} 0 0 1 ${xL + gap + slantW + safeLargeR} ${yBase - actualDustD - b} `;
        s += `L ${xR - gap + b},${yBase - actualDustD - b} `; 
        s += `L ${xR - gap + b},${yBase - vDrop} `;
        s += `L ${xR},${yBase - b} `;
      }
    } else {
      if (sweepSide === 'right') {
        s += `L ${xR},${yBase + b} `;
        s += `L ${xR - gap + b},${yBase + vDrop} `;
        s += `L ${xR - gap - slantW + b},${yBase + actualDustD - safeLargeR} `;
        s += `A ${safeLargeR+b} ${safeLargeR+b} 0 0 1 ${xR - gap - slantW - safeLargeR} ${yBase + actualDustD + b} `;
        s += `L ${xL + gap - b},${yBase + actualDustD + b} `; 
        s += `L ${xL + gap - b},${yBase + vDrop} `;
        s += `L ${xL},${yBase + b} `;
      } else {
        s += `L ${xR},${yBase + b} `;
        s += `L ${xR - gap + b},${yBase + vDrop} `;
        s += `L ${xR - gap + b},${yBase + actualDustD + b} `;
        s += `L ${xL + gap + slantW + safeLargeR},${yBase + actualDustD + b} `;
        s += `A ${safeLargeR+b} ${safeLargeR+b} 0 0 1 ${xL + gap + slantW - b} ${yBase + actualDustD - safeLargeR} `;
        s += `L ${xL + gap - b},${yBase + vDrop} `;
        s += `L ${xL},${yBase + b} `;
      }
    }
    return s;
  }

  function buildContinuousBleed(b) {
    if (b === 0) return [];
    let p = `M ${x1},${yBot + b} `;
    
    const tR = 0.125; 
    const tb = tR + b;
    const tIns = Math.max(0.0625, T * 2); 
    const tLVert = 0.125; 
    const tDraft = 0.0625; 
    
    // Left Edge
    p += `L ${x0 - b},${yBot - glueStepBack} L ${x0 - b},${yTop + glueStepBack} L ${x1},${yTop - b} `;
    
    // Panel 1 Tuck Flap
    p += `L ${x1 + gap - b},${yTop - vDrop} L ${x1 + gap - b},${yTop - coverD} `;
    p += `L ${x1 + gap + tIns - b},${yTop - coverD} `;
    p += `L ${x1 + gap + tIns - b},${yTop - coverD - tLVert} L ${x1 + gap + tIns + tDraft - b},${yTop - coverD - lipD + tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${x1 + gap + tIns + tDraft + tR} ${yTop - coverD - lipD - b} `;
    p += `L ${x2 - gap - tIns - tDraft - tR},${yTop - coverD - lipD - b} `;
    p += `A ${tb} ${tb} 0 0 1 ${x2 - gap - tIns - tDraft + b} ${yTop - coverD - lipD + tR} `;
    p += `L ${x2 - gap - tIns + b},${yTop - coverD - tLVert} L ${x2 - gap - tIns + b},${yTop - coverD} L ${x2 - gap + b},${yTop - coverD} `;
    p += `L ${x2 - gap + b},${yTop - vDrop} L ${x2},${yTop - b} `;
    
    // Vertical drop to stepped Panel 2
    p += `L ${x2},${yTop + T - b} `;
    p += getDustBleed(x2, x3, yTop + T, 1, 'right', b); 
    
    // Vertical rise back to Panel 3
    p += `L ${x3},${yTop - b} `;
    p += `L ${x4},${yTop - b} `;
    
    // Vertical drop to stepped Panel 4
    p += `L ${x4},${yTop + T - b} `;
    p += getDustBleed(x4, x5, yTop + T, 1, 'left', b);
    
    // Right Edge
    p += `L ${x5 + b},${yTop + T - b} L ${x5 + b},${yBot - T + b} `;
    
    // Bottom Dust Flap (Panel 4)
    p += getDustBleed(x4, x5, yBot - T, -1, 'right', b); 
    
    // Vertical step outward to Panel 3
    p += `L ${x4},${yBot + b} `;
    p += `L ${x4 - gap + b},${yBot + vDrop} L ${x4 - gap + b},${yBot + coverD} `;
    p += `L ${x4 - gap - tIns + b},${yBot + coverD} `;
    p += `L ${x4 - gap - tIns + b},${yBot + coverD + tLVert} L ${x4 - gap - tIns - tDraft + b},${yBot + coverD + lipD - tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${x4 - gap - tIns - tDraft - tR} ${yBot + coverD + lipD + b} `;
    p += `L ${x3 + gap + tIns + tDraft + tR},${yBot + coverD + lipD + b} `;
    p += `A ${tb} ${tb} 0 0 1 ${x3 + gap + tIns + tDraft - b} ${yBot + coverD + lipD - tR} `;
    p += `L ${x3 + gap + tIns - b},${yBot + coverD + tLVert} L ${x3 + gap + tIns - b},${yBot + coverD} L ${x3 + gap - b},${yBot + coverD} `;
    p += `L ${x3 + gap - b},${yBot + vDrop} L ${x3},${yBot + b} `;
    
    // Vertical step inward to Panel 2
    p += `L ${x3},${yBot - T + b} `;
    p += getDustBleed(x2, x3, yBot - T, -1, 'left', b); 
    
    // Vertical step outward to Panel 1
    p += `L ${x2},${yBot + b} `;
    p += `L ${x1},${yBot + b} Z`;
    
    return [p];
  }

  // Arrays mapped with exact vertical cuts connecting the offset panels
  const cutPaths = [
    gluePath(),
    
    // Top Profile 
    tuckPath(x1, x2, yTop, 1), 
    `M ${x2},${yTop} L ${x2},${yTop + T}`, 
    dustPath(x2, x3, yTop + T, 1, 'right'), 
    `M ${x3},${yTop + T} L ${x3},${yTop}`, 
    `M ${x3},${yTop} L ${x4},${yTop}`, 
    `M ${x4},${yTop} L ${x4},${yTop + T}`, 
    dustPath(x4, x5, yTop + T, 1, 'left'), 
    
    // Right Edge
    `M ${x5},${yTop + T} L ${x5},${yBot - T}`, 
    
    // Bottom Profile (Drawn Right to Left)
    dustPath(x4, x5, yBot - T, -1, 'right'), 
    `M ${x4},${yBot - T} L ${x4},${yBot}`, 
    tuckPath(x3, x4, yBot, -1), 
    `M ${x3},${yBot} L ${x3},${yBot - T}`, 
    dustPath(x2, x3, yBot - T, -1, 'left'),
    `M ${x2},${yBot - T} L ${x2},${yBot}`, 
    `M ${x2},${yBot} L ${x1},${yBot}` 
  ];

  // The horizontal folds are now broken into perfectly mapped, stepped segments
  const foldLines = [
    // Vertical Folds (stopping precisely at the inner offsets to avoid overlapping the cuts)
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
    
    // Tuck Lip Folds
    { x1: x1, y1: yTop - coverD, x2: x2, y2: yTop - coverD }, 
    { x1: x3, y1: yBot + coverD, x2: x4, y2: yBot + coverD }  
  ];

  return {
    width: x5, height: yBot + coverD + lipD, cutPaths,
    bleedPaths: buildContinuousBleed(nBleed), foldLines,
    dimensions: { L: nL, W: nW, H: nH, x1, x2, x3, x4, x5, yTop, yBot }
  };
}