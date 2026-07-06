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

  // TWO-STAGE TUCK FLAPS
  const coverD = nW; 
  const lipD = 0.625; 
  const dustD = Math.max(0.3, nW * 0.5 - 0.0625); 
  
  const yTop = coverD + lipD; 
  const yBot = yTop + nH;
  
  // DRAFT ANGLES
  const gap = 0.03; 
  const tR = Math.min(0.20, nL * 0.15); 
  const dR = 0.15;                      
  
  const tLVert = 0.0625;
  const tAngH = 0.125;
  const tIns = 0.0625;
  const tDraft = 0.03125;  
  
  const dLVert = 0.0625;
  const dAngH = 0.25;
  const dIns = 0.125;
  const dDraft = 0.03125;  

  const xT1L = x1 + gap, xT1R = x2 - gap;
  const xD1L = x2 + gap, xD1R = x3 - gap;
  const xN1L = x3 - gap, xN1R = x4 + gap;
  const xD2L = x4 + gap, xD2R = x5 - gap;
  
  const xN2L = x1 + gap, xN2R = x2 - gap;
  const xD1BL = x2 + gap, xD1BR = x3 - gap;
  const xT2L = x3 + gap, xT2R = x4 - gap;
  const xD2BL = x4 + gap, xD2BR = x5 - gap;

  function flatNotch(xL, xR, yBase) {
    return `M ${xL},${yBase} L ${xR},${yBase}`;
  }

  function gluePath() {
    const chamf = 0.15;
    return `M ${x1},${yTop} L ${x0},${yTop + chamf} L ${x0},${yBot - chamf} L ${x1},${yBot}`;
  }

  function tuckPath(xL, xR, yBase, dir) {
    const dY = dir === 1 ? -1 : 1; 
    return `M ${xL},${yBase} ` +
           `L ${xL},${yBase + dY * coverD} ` + 
           `L ${xL},${yBase + dY * (coverD + tLVert)} ` + 
           `L ${xL + tIns},${yBase + dY * (coverD + tLVert + tAngH)} ` + 
           `L ${xL + tIns + tDraft},${yBase + dY * (coverD + lipD - tR)} ` + 
           `A ${tR} ${tR} 0 0 ${dir === 1 ? 1 : 0} ${xL + tIns + tDraft + tR} ${yBase + dY * (coverD + lipD)} ` +
           `L ${xR - tIns - tDraft - tR},${yBase + dY * (coverD + lipD)} ` +
           `A ${tR} ${tR} 0 0 ${dir === 1 ? 1 : 0} ${xR - tIns - tDraft} ${yBase + dY * (coverD + lipD - tR)} ` +
           `L ${xR - tIns},${yBase + dY * (coverD + tLVert + tAngH)} ` +
           `L ${xR},${yBase + dY * (coverD + tLVert)} ` +
           `L ${xR},${yBase + dY * coverD} ` + 
           `L ${xR},${yBase}`;
  }

  function dustPath(xL, xR, yBase, dir) {
    const dY = dir === 1 ? -1 : 1;
    return `M ${xL},${yBase} ` +
           `L ${xL},${yBase + dY * dLVert} ` +
           `L ${xL + dIns},${yBase + dY * (dLVert + dAngH)} ` +
           `L ${xL + dIns + dDraft},${yBase + dY * (dustD - dR)} ` +
           `A ${dR} ${dR} 0 0 ${dir === 1 ? 1 : 0} ${xL + dIns + dDraft + dR} ${yBase + dY * dustD} ` +
           `L ${xR - dIns - dDraft - dR},${yBase + dY * dustD} ` +
           `A ${dR} ${dR} 0 0 ${dir === 1 ? 1 : 0} ${xR - dIns - dDraft} ${yBase + dY * (dustD - dR)} ` +
           `L ${xR - dIns},${yBase + dY * (dLVert + dAngH)} ` +
           `L ${xR},${yBase + dY * dLVert} ` +
           `L ${xR},${yBase}`;
  }

  // MATHEMATICALLY PERFECT CONVEX BLEED
  function buildContinuousBleed(b) {
    if (b === 0) return [];
    let p = `M ${x1},${yBot + b} `;
    const chamf = 0.15;
    const tb = tR + b;
    const db = dR + b;
    
    // Left Edge
    p += `L ${x0 - b},${yBot - chamf} L ${x0 - b},${yTop + chamf} L ${x1},${yTop - b} `;
    
    // Bridge to Tuck 1
    p += `L ${xT1L - b},${yTop - b} `;
    
    // Tuck 1
    p += `L ${xT1L - b},${yTop - coverD - tLVert} `;
    p += `L ${xT1L + tIns - b},${yTop - coverD - tLVert - tAngH} `;
    p += `L ${xT1L + tIns + tDraft - b},${yTop - coverD - lipD + tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${xT1L + tIns + tDraft + tR} ${yTop - coverD - lipD - b} `;
    p += `L ${xT1R - tIns - tDraft - tR},${yTop - coverD - lipD - b} `;
    p += `A ${tb} ${tb} 0 0 1 ${xT1R - tIns - tDraft + b} ${yTop - coverD - lipD + tR} `;
    p += `L ${xT1R - tIns + b},${yTop - coverD - tLVert - tAngH} `;
    p += `L ${xT1R + b},${yTop - coverD - tLVert} `;
    
    // Bridge to Dust 1
    p += `L ${xT1R + b},${yTop - dLVert - b} `;
    p += `L ${xD1L + dIns - b},${yTop - dLVert - dAngH - b} `;
    
    // Dust 1
    p += `L ${xD1L + dIns + dDraft - b},${yTop - dustD + dR} `;
    p += `A ${db} ${db} 0 0 1 ${xD1L + dIns + dDraft + dR} ${yTop - dustD - b} `;
    p += `L ${xD1R - dIns - dDraft - dR},${yTop - dustD - b} `;
    p += `A ${db} ${db} 0 0 1 ${xD1R - dIns - dDraft + b} ${yTop - dustD + dR} `;
    p += `L ${xD1R - dIns + b},${yTop - dLVert - dAngH - b} `;
    
    // Bridge to Notch
    p += `L ${xD1R + b},${yTop - dLVert - b} `;
    p += `L ${xD1R + b},${yTop - b} `;
    p += `L ${xD2L - b},${yTop - b} `;
    
    // Bridge to Dust 2
    p += `L ${xD2L - b},${yTop - dLVert - b} `;
    p += `L ${xD2L + dIns - b},${yTop - dLVert - dAngH - b} `;
    
    // Dust 2
    p += `L ${xD2L + dIns + dDraft - b},${yTop - dustD + dR} `;
    p += `A ${db} ${db} 0 0 1 ${xD2L + dIns + dDraft + dR} ${yTop - dustD - b} `;
    p += `L ${xD2R - dIns - dDraft - dR},${yTop - dustD - b} `;
    p += `A ${db} ${db} 0 0 1 ${xD2R - dIns - dDraft + b} ${yTop - dustD + dR} `;
    p += `L ${xD2R - dIns + b},${yTop - dLVert - dAngH - b} `;
    
    // Bridge to Right Edge
    p += `L ${xD2R + b},${yTop - dLVert - b} `;
    p += `L ${xD2R + b},${yTop - b} `;
    p += `L ${x5 + b},${yTop - b} `;
    p += `L ${x5 + b},${yBot + b} `;
    
    // Bottom Dust 2
    p += `L ${xD2BR + b},${yBot + dLVert + b} `;
    p += `L ${xD2BR - dIns + b},${yBot + dLVert + dAngH + b} `;
    p += `L ${xD2BR - dIns - dDraft + b},${yBot + dustD - dR} `;
    p += `A ${db} ${db} 0 0 1 ${xD2BR - dIns - dDraft - dR} ${yBot + dustD + b} `;
    p += `L ${xD2BL + dIns + dDraft + dR},${yBot + dustD + b} `;
    p += `A ${db} ${db} 0 0 1 ${xD2BL + dIns + dDraft - b} ${yBot + dustD - dR} `;
    p += `L ${xD2BL + dIns - b},${yBot + dLVert + dAngH + b} `;
    
    // Bridge to Tuck 2
    p += `L ${xD2BL - b},${yBot + dLVert + b} `;
    p += `L ${xD2BL - b},${yBot + coverD + tLVert} `;
    
    // Bottom Tuck 2
    p += `L ${xT2R - tIns + b},${yBot + coverD + tLVert + tAngH} `;
    p += `L ${xT2R - tIns - tDraft + b},${yBot + coverD + lipD - tR} `;
    p += `A ${tb} ${tb} 0 0 1 ${xT2R - tIns - tDraft - tR} ${yBot + coverD + lipD + b} `;
    p += `L ${xT2L + tIns + tDraft + tR},${yBot + coverD + lipD + b} `;
    p += `A ${tb} ${tb} 0 0 1 ${xT2L + tIns + tDraft - b} ${yBot + coverD + lipD - tR} `;
    p += `L ${xT2L + tIns - b},${yBot + coverD + tLVert + tAngH} `;
    p += `L ${xT2L - b},${yBot + coverD + tLVert} `;
    
    // Bridge to Dust 1
    p += `L ${xT2L - b},${yBot + dLVert + b} `;
    p += `L ${xD1BR - dIns + b},${yBot + dLVert + dAngH + b} `;
    
    // Bottom Dust 1
    p += `L ${xD1BR - dIns - dDraft + b},${yBot + dustD - dR} `;
    p += `A ${db} ${db} 0 0 1 ${xD1BR - dIns - dDraft - dR} ${yBot + dustD + b} `;
    p += `L ${xD1BL + dIns + dDraft + dR},${yBot + dustD + b} `;
    p += `A ${db} ${db} 0 0 1 ${xD1BL + dIns + dDraft - b} ${yBot + dustD - dR} `;
    p += `L ${xD1BL + dIns - b},${yBot + dLVert + dAngH + b} `;
    
    // Close 
    p += `L ${xD1BL - b},${yBot + dLVert + b} `;
    p += `L ${xD1BL - b},${yBot + b} `;
    p += `L ${x1},${yBot + b} Z`;
    
    return [p];
  }

  const cutPaths = [
    gluePath(),
    `M ${x1},${yTop} L ${xT1L},${yTop}`, 
    tuckPath(xT1L, xT1R, yTop, 1), 
    `M ${xT1R},${yTop} L ${xD1L},${yTop}`,
    dustPath(xD1L, xD1R, yTop, 1), 
    `M ${xD1R},${yTop} L ${xN1L},${yTop}`, 
    `M ${xN1L},${yTop} L ${xN1R},${yTop}`,
    `M ${xN1R},${yTop} L ${xD2L},${yTop}`, 
    dustPath(xD2L, xD2R, yTop, 1), 
    `M ${xD2R},${yTop} L ${x5},${yTop}`,
    `M ${x5},${yTop} L ${x5},${yBot}`, 
    `M ${x5},${yBot} L ${xD2BR},${yBot}`, 
    dustPath(xD2BL, xD2BR, yBot, -1), 
    `M ${xD2BL},${yBot} L ${xT2R},${yBot}`,
    tuckPath(xT2L, xT2R, yBot, -1), 
    `M ${xT2L},${yBot} L ${xD1BR},${yBot}`, 
    dustPath(xD1BL, xD1BR, yBot, -1),
    `M ${xD1BL},${yBot} L ${xN2R},${yBot}`, 
    `M ${xN2L},${yBot} L ${xN2R},${yBot}`, 
    `M ${x1},${yBot} L ${xN2L},${yBot}`
  ];

  const foldLines = [
    { x1: x1, y1: yTop, x2: x1, y2: yBot }, 
    { x1: x2, y1: yTop, x2: x2, y2: yBot },
    { x1: x3, y1: yTop, x2: x3, y2: yBot }, 
    { x1: x4, y1: yTop, x2: x4, y2: yBot },
    { x1: x1, y1: yTop, x2: x3, y2: yTop }, 
    { x1: x4, y1: yTop, x2: x5, y2: yTop }, 
    { x1: x2, y1: yBot, x2: x5, y2: yBot },
    { x1: xT1L, y1: yTop - coverD, x2: xT1R, y2: yTop - coverD }, 
    { x1: xT2L, y1: yBot + coverD, x2: xT2R, y2: yBot + coverD }  
  ];

  return {
    width: x5, 
    height: yBot + coverD + lipD, 
    cutPaths,
    bleedPaths: buildContinuousBleed(nBleed), 
    foldLines,
    dimensions: { L: nL, W: nW, H: nH, x1, x2, x3, x4, x5, yTop, yBot }
  };
}