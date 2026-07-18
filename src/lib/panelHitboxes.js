export function generatePanelHitboxes(L, W, H, T, dimensions, glueFlapWidth) {
  const nT = Math.max(0.015, Number(T) || 0.0197);
  
  // Use the exact global 2D offsets from the Dieline Generator
  const { x1, x2, x3, x4, x5, yTop, yBot } = dimensions;

  // Helper for rectangle
  const rect = (x, y, w, h) => `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z`;

  const panels = [];
  
  // Main Panels
  panels.push({ id: "p1-front", name: "Front Panel", path: rect(x1, yTop, L, H) });
  panels.push({ id: "p2-right", name: "Right Side Panel", path: rect(x2, yTop, W, H) });
  panels.push({ id: "p3-back", name: "Back Panel", path: rect(x3, yTop, L, H) });
  panels.push({ id: "p4-left", name: "Left Side Panel", path: rect(x4, yTop, W, H) });

  // Glue Flap (attached to left of p1)
  const glueFlapW = glueFlapWidth || W * (16 / 60);
  const glueStep = H * (4.287 / 160);
  const gluePath = `M ${x1} ${yTop} L ${x1 - glueFlapW} ${yTop + glueStep} L ${x1 - glueFlapW} ${yBot - glueStep} L ${x1} ${yBot} Z`;
  panels.push({ id: "glue-flap", name: "Glue Flap", path: gluePath });

  // Top Tuck Flap (Cover + Lip on P1)
  const coverDepth = W - 2 * nT;
  const topCoverY = yTop - coverDepth;
  
  const lipW = L - 2 * (L * (0.5 / 120));
  const lipStraightH = W * (6.25 / 60);
  const lipDepth = W * (14.25 / 60);
  const tipR = W * (8.0 / 60);

  const lipStartX = x1 + (L - lipW)/2;
  const lipEndX = x2 - (L - lipW)/2;
  
  const topTuckFlap = `M ${x1} ${yTop} 
    L ${x1} ${topCoverY} 
    L ${lipStartX} ${topCoverY} 
    L ${lipStartX} ${topCoverY - lipStraightH} 
    Q ${lipStartX} ${topCoverY - lipDepth} ${lipStartX + tipR} ${topCoverY - lipDepth} 
    L ${lipEndX - tipR} ${topCoverY - lipDepth} 
    Q ${lipEndX} ${topCoverY - lipDepth} ${lipEndX} ${topCoverY - lipStraightH} 
    L ${lipEndX} ${topCoverY} 
    L ${x2} ${topCoverY} 
    L ${x2} ${yTop} Z`;
  panels.push({ id: "top-tuck", name: "Top Tuck Flap", path: topTuckFlap });

  // Bottom Tuck Flap (Cover + Lip on P3)
  const botCoverY = yBot + coverDepth;
  const botLipStartX = x3 + (L - lipW)/2;
  const botLipEndX = x4 - (L - lipW)/2;
  
  const botTuckFlap = `M ${x3} ${yBot}
    L ${x3} ${botCoverY}
    L ${botLipStartX} ${botCoverY}
    L ${botLipStartX} ${botCoverY + lipStraightH}
    Q ${botLipStartX} ${botCoverY + lipDepth} ${botLipStartX + tipR} ${botCoverY + lipDepth}
    L ${botLipEndX - tipR} ${botCoverY + lipDepth}
    Q ${botLipEndX} ${botCoverY + lipDepth} ${botLipEndX} ${botCoverY + lipStraightH}
    L ${botLipEndX} ${botCoverY}
    L ${x4} ${botCoverY}
    L ${x4} ${yBot} Z`;
  panels.push({ id: "bot-tuck", name: "Bottom Tuck Flap", path: botTuckFlap });

  // Dust Flaps Helper
  function getDustFlap(xStart, width, isTop, isMirror) {
    const dH = width * (38/60);
    const dY = isTop ? yTop - dH : yBot + dH;
    const base = isTop ? yTop : yBot;
    const dir = isTop ? -1 : 1;
    
    const insetLeft = width * (1.065/60);
    const insetRight = width * (0.3/60);
    
    if (!isMirror) {
      return `M ${xStart + insetLeft} ${base} 
        L ${xStart + width * (3.5/60)} ${base + dir * width * (3.5/60)}
        L ${xStart + width * (4.5/60)} ${dY}
        L ${xStart + width - width * (17.15/60)} ${dY}
        Q ${xStart + width - width * (8.4/60)} ${dY} ${xStart + width - width * (8.4/60)} ${base + dir * width * (31/60)}
        L ${xStart + width - width * (3.3/60)} ${base + dir * width * (9/60)}
        L ${xStart + width - insetRight} ${base} Z`;
    } else {
      return `M ${xStart + insetRight} ${base}
        L ${xStart + width * (3.3/60)} ${base + dir * width * (9/60)}
        L ${xStart + width * (8.4/60)} ${base + dir * width * (31/60)}
        Q ${xStart + width * (8.4/60)} ${dY} ${xStart + width * (17.15/60)} ${dY}
        L ${xStart + width - width * (4.5/60)} ${dY}
        L ${xStart + width - width * (3.5/60)} ${base + dir * width * (3.5/60)}
        L ${xStart + width - insetLeft} ${base} Z`;
    }
  }

  panels.push({ id: "top-dust-1", name: "Top Dust Flap", path: getDustFlap(x2, W, true, false) });
  panels.push({ id: "bot-dust-1", name: "Bottom Dust Flap", path: getDustFlap(x2, W, false, false) });
  panels.push({ id: "top-dust-2", name: "Top Dust Flap", path: getDustFlap(x4, W, true, true) });
  panels.push({ id: "bot-dust-2", name: "Bottom Dust Flap", path: getDustFlap(x4, W, false, true) });

  return panels;
}
