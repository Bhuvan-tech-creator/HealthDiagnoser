import { useGLTF, Html } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

function Model({ setError, onPartClick, selectedParts }) {
  const [highlightedMeshes, setHighlightedMeshes] = useState(new Set());
  const originalMaterials = useRef(new Map());

  // Load the GLTF model directly using useGLTF
  let gltf;
  try {
    gltf = useGLTF('/assets/models/body-model.glb');
    console.log('Model loaded:', gltf);
    console.log('Scene children:', gltf.scene.children.map(child => child.name));
  } catch (err) {
    console.error('Model loading error:', err);
    setError(`Failed to load model: ${err.message}`);
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  // Configure the model
  gltf.scene.scale.set(3, 3, 3);
  gltf.scene.rotation.set(0, 0, 0);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);
  console.log('Model bounding box after centering:', box);

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log('Mesh:', child.name, 'Material:', child.material);
      child.castShadow = true;
      child.receiveShadow = true;
      if (!child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
      }
      originalMaterials.current.set(child, child.material.clone());
    }
  });

  useEffect(() => {
    const newHighlightedMeshes = new Set();
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const isSelected = selectedParts.includes(child.name);
        if (isSelected) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x006400 });
          newHighlightedMeshes.add(child);
        } else {
          const originalMaterial = originalMaterials.current.get(child);
          if (originalMaterial) {
            child.material = originalMaterial;
          }
        }
      }
    });
    setHighlightedMeshes(newHighlightedMeshes);
  }, [selectedParts, gltf.scene]);

  const handleMeshClick = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh && mesh.name) {
      console.log('Part clicked:', mesh.name);
      onPartClick(mesh.name);
    }
  };

  return (
    <group>
      <primitive
        object={gltf.scene}
        onClick={handleMeshClick}
      />
    </group>
  );
}

export default function BodyModel({ onPartClick, selectedParts }) {
  const [error, setError] = useState(null);

  return (
    <Suspense fallback={<Html center>Loading model...</Html>}>
      {error ? (
        <Html center>
          <div style={{ color: 'red', maxWidth: '400px', background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Error Loading Model</h3>
            <p>{error}</p>
            <p>Check:</p>
            <ol>
              <li>File exists at public/assets/models/body-model.glb</li>
              <li>File is a valid GLB format (binary, not UTF-8)</li>
              <li>Server is running on localhost:3000</li>
              <li>No network issues (e.g., firewall, VPN)</li>
              <li>{'File size is reasonable (e.g., <10MB)'}</li>
            </ol>
          </div>
        </Html>
      ) : (
        <Model setError={setError} onPartClick={onPartClick} selectedParts={selectedParts} />
      )}
    </Suspense>
  );
}

useGLTF.preload('/assets/models/body-model.glb');