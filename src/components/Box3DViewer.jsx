import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function Box3DViewer({ L, W, H, T }) {
  const [progress, setProgress] = useState(0); // 0 (Open/Flat) to 1 (Closed)
  const nT = Number(T) || 0.02;

  // --- COMPUTE KINEMATICS ---
  // 1. Tube folds (0 to 0.5 progress)
  const tubeProgress = Math.min(1, progress / 0.5);
  const foldAngleRad = (tubeProgress * 90 * Math.PI) / 180;

  // 2. Dust flap folds (0.5 to 0.75 progress)
  const dustProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.25));
  const dustAngleRad = (dustProgress * 90 * Math.PI) / 180;

  // 3. Tuck flap cover folds (0.75 to 1.0 progress)
  const tuckProgress = Math.max(0, Math.min(1, (progress - 0.75) / 0.25));
  const tuckAngleRad = (tuckProgress * 90 * Math.PI) / 180;
  const lipAngleRad = (tuckProgress * 105 * Math.PI) / 180; // lip folds slightly more to tuck inside

  // --- MEMOIZED GEOMETRIES ---
  const {
    panel1Geom,
    panel2Geom,
    panel3Geom,
    panel4Geom,
    glueGeom,
    tuckCoverGeom,
    tuckLipGeom,
    dustBothGeom,
    dustLeftGeom,
    coverD,
    lipD,
    tIns
  } = useMemo(() => {
    const tR = Math.max(0.03, Math.min(0.125, L * 0.15));
    const tIns = Math.max(0.0625, Math.min(nT * 2, L * 0.12));
    const tDraft = Math.max(0.03, Math.min(0.0625, L * 0.08));

    const gap = Math.max(0.0625, nT * 1.5);
    const vRoot = 0.03125;
    const vDrop = 0.125;

    const coverD = W;
    const lipD = 0.625;
    const flap1D = coverD + lipD;
    const actualDustD = (coverD + lipD) / 2;
    const glueStepBack = Math.max(0.125, nT * 1.2);
    const glueFlapWidth = 0.625;

    const topR = Math.min(0.125, W * 0.1);
    const slant = Math.min(0.25, W * 0.15);

    const extrudeSettings = {
      depth: nT,
      bevelEnabled: false
    };

    // 1. Panel 1 & 3 shapes (L x H)
    const p1Shape = new THREE.Shape();
    p1Shape.moveTo(-L / 2, -H / 2);
    p1Shape.lineTo(L / 2, -H / 2);
    p1Shape.lineTo(L / 2, H / 2);
    p1Shape.lineTo(-L / 2, H / 2);
    p1Shape.closePath();

    // 2. Panel 2 & 4 shapes (W x H)
    const p2Shape = new THREE.Shape();
    p2Shape.moveTo(0, -H / 2);
    p2Shape.lineTo(W, -H / 2);
    p2Shape.lineTo(W, H / 2);
    p2Shape.lineTo(0, H / 2);
    p2Shape.closePath();

    // 3. Glue Flap shape
    const glueShape = new THREE.Shape();
    glueShape.moveTo(0, H / 2);
    glueShape.lineTo(-glueFlapWidth, H / 2 - glueStepBack);
    glueShape.lineTo(-glueFlapWidth, -H / 2 + glueStepBack);
    glueShape.lineTo(0, -H / 2);
    glueShape.closePath();

    // 4. Tuck Flap Cover shape
    const tuckCoverShape = new THREE.Shape();
    tuckCoverShape.moveTo(-L / 2 + tIns, 0);
    tuckCoverShape.lineTo(-L / 2 + tIns, coverD);
    tuckCoverShape.lineTo(L / 2 - tIns, coverD);
    tuckCoverShape.lineTo(L / 2 - tIns, 0);
    tuckCoverShape.closePath();

    // 5. Tuck Flap Lip shape
    const tuckLipShape = new THREE.Shape();
    const lipW = L - 2 * tIns;
    tuckLipShape.moveTo(-lipW / 2, 0);
    tuckLipShape.lineTo(-lipW / 2 + tDraft, lipD - tR);
    tuckLipShape.quadraticCurveTo(-lipW / 2 + tDraft, lipD, -lipW / 2 + tDraft + tR, lipD);
    tuckLipShape.lineTo(lipW / 2 - tDraft - tR, lipD);
    tuckLipShape.quadraticCurveTo(lipW / 2 - tDraft, lipD, lipW / 2 - tDraft, lipD - tR);
    tuckLipShape.lineTo(lipW / 2, 0);
    tuckLipShape.closePath();

    // 6. Dust Flap Both-Notches shape
    const dustBothShape = new THREE.Shape();
    dustBothShape.moveTo(-W / 2, 0);
    dustBothShape.lineTo(-W / 2, vRoot);
    dustBothShape.lineTo(-W / 2 + gap, vDrop);
    dustBothShape.lineTo(-W / 2 + gap + slant, actualDustD - topR);
    dustBothShape.quadraticCurveTo(-W / 2 + gap + slant, actualDustD, -W / 2 + gap + slant + topR, actualDustD);
    dustBothShape.lineTo(W / 2 - gap - slant - topR, actualDustD);
    dustBothShape.quadraticCurveTo(W / 2 - gap - slant, actualDustD, W / 2 - gap - slant, actualDustD - topR);
    dustBothShape.lineTo(W / 2 - gap, vDrop);
    dustBothShape.lineTo(W / 2, vRoot);
    dustBothShape.lineTo(W / 2, 0);
    dustBothShape.closePath();

    // 7. Dust Flap Left-Notch shape
    const dustLeftShape = new THREE.Shape();
    dustLeftShape.moveTo(-W / 2, 0);
    dustLeftShape.lineTo(-W / 2, vRoot);
    dustLeftShape.lineTo(-W / 2 + gap, vDrop);
    dustLeftShape.lineTo(-W / 2 + gap + slant, actualDustD - topR);
    dustLeftShape.quadraticCurveTo(-W / 2 + gap + slant, actualDustD, -W / 2 + gap + slant + topR, actualDustD);
    dustLeftShape.lineTo(W / 2, actualDustD);
    dustLeftShape.lineTo(W / 2, 0);
    dustLeftShape.closePath();

    return {
      panel1Geom: new THREE.ExtrudeGeometry(p1Shape, extrudeSettings),
      panel2Geom: new THREE.ExtrudeGeometry(p2Shape, extrudeSettings),
      panel3Geom: new THREE.ExtrudeGeometry(p1Shape, extrudeSettings), // shares shape with P1
      panel4Geom: new THREE.ExtrudeGeometry(p2Shape, extrudeSettings), // shares shape with P2
      glueGeom: new THREE.ExtrudeGeometry(glueShape, extrudeSettings),
      tuckCoverGeom: new THREE.ExtrudeGeometry(tuckCoverShape, extrudeSettings),
      tuckLipGeom: new THREE.ExtrudeGeometry(tuckLipShape, extrudeSettings),
      dustBothGeom: new THREE.ExtrudeGeometry(dustBothShape, extrudeSettings),
      dustLeftGeom: new THREE.ExtrudeGeometry(dustLeftShape, extrudeSettings),
      coverD,
      lipD,
      tIns
    };
  }, [L, W, H, nT]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative" }}>
      <div style={{ flex: 1, background: "#f0f0f0" }}>
        <Canvas camera={{ position: [L * 1.5, H * 1.5, W * 2.5], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={0.9} castShadow />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          
          <group position={[0, 0, -W / 2]}>
            {/* PANEL 1 (Base Anchor) */}
            <mesh geometry={panel1Geom}>
              <meshStandardMaterial color="#d7b58c" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
            </mesh>

            {/* Panel 1 Glue Flap (folds backward around left hinge y-axis) */}
            <group position={[-L / 2, 0, 0]} rotation={[0, foldAngleRad, 0]}>
              <mesh geometry={glueGeom}>
                <meshStandardMaterial color="#c6a67c" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* Panel 1 Top Tuck Flap */}
            <group position={[0, H / 2, 0]} rotation={[tuckAngleRad, 0, 0]}>
              <mesh geometry={tuckCoverGeom}>
                <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
              </mesh>
              {/* Lip attached to cover tip */}
              <group position={[0, coverD, 0]} rotation={[lipAngleRad, 0, 0]}>
                <mesh geometry={tuckLipGeom}>
                  <meshStandardMaterial color="#efe1bd" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                </mesh>
              </group>
            </group>

            {/* PANEL 2 (hinged on Panel 1 right edge) */}
            <group position={[L / 2, 0, 0]} rotation={[0, -foldAngleRad, 0]}>
              <mesh geometry={panel2Geom}>
                <meshStandardMaterial color="#d7b58c" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
              </mesh>

              {/* Panel 2 Top Dust Flap (both notches) */}
              <group position={[W / 2, H / 2, 0]} rotation={[dustAngleRad, 0, 0]}>
                <mesh geometry={dustBothGeom}>
                  <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                </mesh>
              </group>

              {/* Panel 2 Bottom Dust Flap (both notches) */}
              <group position={[W / 2, -H / 2, 0]} rotation={[-dustAngleRad, 0, 0]}>
                <mesh geometry={dustBothGeom} rotation={[Math.PI, 0, 0]}>
                  <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                </mesh>
              </group>

              {/* PANEL 3 (hinged on Panel 2 right edge) */}
              <group position={[W, 0, 0]} rotation={[0, -foldAngleRad, 0]}>
                {/* Center mesh for Panel 3 */}
                <mesh geometry={panel3Geom} position={[L / 2, 0, 0]}>
                  <meshStandardMaterial color="#d7b58c" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                </mesh>

                {/* Panel 3 Bottom Tuck Flap */}
                <group position={[L / 2, -H / 2, 0]} rotation={[-tuckAngleRad, 0, 0]}>
                  <mesh geometry={tuckCoverGeom} rotation={[0, 0, Math.PI]}>
                    <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                  </mesh>
                  {/* Lip attached to cover tip */}
                  <group position={[0, -coverD, 0]} rotation={[-lipAngleRad, 0, 0]}>
                    <mesh geometry={tuckLipGeom} rotation={[0, 0, Math.PI]}>
                      <meshStandardMaterial color="#efe1bd" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                    </mesh>
                  </group>
                </group>

                {/* PANEL 4 (hinged on Panel 3 right edge) */}
                <group position={[L, 0, 0]} rotation={[0, -foldAngleRad, 0]}>
                  <mesh geometry={panel4Geom}>
                    <meshStandardMaterial color="#d7b58c" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                  </mesh>

                  {/* Panel 4 Top Dust Flap (left notch) */}
                  <group position={[W / 2, H / 2, 0]} rotation={[dustAngleRad, 0, 0]}>
                    <mesh geometry={dustLeftGeom}>
                      <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                    </mesh>
                  </group>

                  {/* Panel 4 Bottom Dust Flap (left notch) */}
                  <group position={[W / 2, -H / 2, 0]} rotation={[-dustAngleRad, 0, 0]}>
                    <mesh geometry={dustLeftGeom} rotation={[Math.PI, 0, 0]}>
                      <meshStandardMaterial color="#e5cbb0" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>

          <OrbitControls target={[0, 0, 0]} />
        </Canvas>
      </div>

      {/* CUSTOM RANGE SLIDER OVERLAY */}
      <style dangerouslySetInnerHTML={{__html: `
        .view-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 130px;
          height: 3px;
          border-radius: 2px;
          background: #d1d5db;
          outline: none;
          margin: 0 10px;
          cursor: pointer;
        }
        .view-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #111827;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .view-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}} />

      <div style={{
        position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)",
        borderRadius: "24px", display: "flex", alignItems: "center",
        padding: "8px 18px", gap: "2px", boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        pointerEvents: "auto", userSelect: "none", zIndex: 100, border: "1px solid rgba(229, 231, 235, 0.5)"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#4b5563" }}>Open</span>
        <input 
          type="range" min="0" max="1" step="0.001" 
          value={progress} 
          onChange={(e) => setProgress(parseFloat(e.target.value))} 
          className="view-slider"
        />
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#4b5563" }}>Close</span>
      </div>
    </div>
  );
}