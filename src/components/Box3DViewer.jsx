import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const T = 0.02;

function Wall({ length, height, thickness, pivot, hingeAxis, outwardSign, foldAngle, color, children }) {
  const rad = THREE.MathUtils.degToRad(foldAngle);
  const rotation = hingeAxis === "x" ? [-outwardSign * rad, 0, 0] : [0, 0, outwardSign * rad];
  const geomArgs = hingeAxis === "x" ? [length, thickness, height] : [height, thickness, length];
  const localPos = hingeAxis === "x" ? [0, 0, (outwardSign * height) / 2] : [(outwardSign * height) / 2, 0, 0];
  const flapAttachPos = hingeAxis === "x" ? [0, 0, outwardSign * height] : [outwardSign * height, 0, 0];

  return (
    <group position={pivot} rotation={rotation}>
      <mesh position={localPos}>
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {children && (
        <group position={flapAttachPos}>
          {children({ hingeAxis, outwardSign })}
        </group>
      )}
    </group>
  );
}

function TwoStageTuckFlap({ length, coverDepth, lipDepth, hingeAxis, outwardSign, flapAngle, color }) {
  const rad = THREE.MathUtils.degToRad(flapAngle);
  const rotation = hingeAxis === "x" ? [-outwardSign * rad, 0, 0] : [0, 0, outwardSign * rad];
  
  const coverGeom = hingeAxis === "x" ? [length, T, coverDepth] : [coverDepth, T, length];
  const coverLocalPos = hingeAxis === "x" ? [0, 0, (outwardSign * coverDepth) / 2] : [(outwardSign * coverDepth) / 2, 0, 0];
  const lipAttachPos = hingeAxis === "x" ? [0, 0, outwardSign * coverDepth] : [outwardSign * coverDepth, 0, 0];

  const lipGeom = hingeAxis === "x" ? [length, T, lipDepth] : [lipDepth, T, length];
  const lipLocalPos = hingeAxis === "x" ? [0, 0, (outwardSign * lipDepth) / 2] : [(outwardSign * lipDepth) / 2, 0, 0];

  return (
    <group rotation={rotation}>
      <mesh position={coverLocalPos}>
        <boxGeometry args={coverGeom} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <group position={lipAttachPos} rotation={rotation}>
        <mesh position={lipLocalPos}>
          <boxGeometry args={lipGeom} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function DustFlap({ length, depth, hingeAxis, outwardSign, flapAngle, color }) {
  const rad = THREE.MathUtils.degToRad(flapAngle);
  const rotation = hingeAxis === "x" ? [-outwardSign * rad, 0, 0] : [0, 0, outwardSign * rad];
  const geomArgs = hingeAxis === "x" ? [length, T, depth] : [depth, T, length];
  const localPos = hingeAxis === "x" ? [0, 0, (outwardSign * depth) / 2] : [(outwardSign * depth) / 2, 0, 0];

  return (
    <group rotation={rotation}>
      <mesh position={localPos}>
        <boxGeometry args={geomArgs} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Box({ L, W, H, foldAngle, flapAngle }) {
  const coverDepth = W;
  const lipDepth = 0.625;
  const dustDepth = (coverDepth + lipDepth) / 2;

  return (
    <group>
      <mesh position={[0, -T / 2, 0]}>
        <boxGeometry args={[L, T, W]} />
        <meshStandardMaterial color="#d9c9a3" />
      </mesh>

      <Wall length={L} height={H} thickness={T} pivot={[0, 0, W / 2]} hingeAxis="x" outwardSign={1} foldAngle={foldAngle} color="#efe1bd">
        {({ hingeAxis, outwardSign }) => (
          <TwoStageTuckFlap length={L} coverDepth={coverDepth} lipDepth={lipDepth} hingeAxis={hingeAxis} outwardSign={outwardSign} flapAngle={flapAngle} color="#f4ecd4" />
        )}
      </Wall>

      <Wall length={L} height={H} thickness={T} pivot={[0, 0, -W / 2]} hingeAxis="x" outwardSign={-1} foldAngle={foldAngle} color="#e6d7ae">
        {({ hingeAxis, outwardSign }) => (
          <DustFlap length={L} depth={dustDepth} hingeAxis={hingeAxis} outwardSign={outwardSign} flapAngle={flapAngle} color="#ecdfba" />
        )}
      </Wall>

      <Wall length={W} height={H} thickness={T} pivot={[-L / 2, 0, 0]} hingeAxis="z" outwardSign={-1} foldAngle={foldAngle} color="#e2d3a5">
        {({ hingeAxis, outwardSign }) => (
          <DustFlap length={W} depth={dustDepth} hingeAxis={hingeAxis} outwardSign={outwardSign} flapAngle={flapAngle} color="#e9dbb2" />
        )}
      </Wall>

      <Wall length={W} height={H} thickness={T} pivot={[L / 2, 0, 0]} hingeAxis="z" outwardSign={1} foldAngle={foldAngle} color="#e2d3a5">
        {({ hingeAxis, outwardSign }) => (
          <DustFlap length={W} depth={dustDepth} hingeAxis={hingeAxis} outwardSign={outwardSign} flapAngle={flapAngle} color="#e9dbb2" />
        )}
      </Wall>
    </group>
  );
}

export default function Box3DViewer({ L, W, H }) {
  const [foldAngle, setFoldAngle] = useState(90);
  const [flapAngle, setFlapAngle] = useState(90);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [L * 1.6, H * 1.8, W * 3.2], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={0.9} />
          <Box L={L} W={W} H={H} foldAngle={foldAngle} flapAngle={flapAngle} />
          <OrbitControls target={[0, H / 2, 0]} />
        </Canvas>
      </div>
    </div>
  );
}