import { useGLTF, Html } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

function Model({ setError, onPartClick, selectedParts }) {
  const [model, setModel] = useState(null);
  const [highlightedMeshes, setHighlightedMeshes] = useState(new Set());
  const originalMaterials = useRef(new Map());

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Attempting to fetch model from /assets/models/body-model.glb');
        const response = await fetch('/assets/models/body-model.glb', {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }
        console.log('Fetch successful, loading GLTF...');
        const gltf = await useGLTF('/assets/models/body-model.glb');
        console.log('Model loaded:', gltf);
        console.log('Scene children:', gltf.scene.children.map(child => child.name));

        // Apply scale first
        gltf.scene.scale.set(3, 3, 3); // Adjusted for visibility
        gltf.scene.rotation.set(0, 0, 0);

        // Center the model after scaling
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center); // Center at origin
        console.log('Model bounding box after centering:', box);

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            console.log('Mesh:', child.name, 'Material:', child.material);
            child.castShadow = true;
            child.receiveShadow = true;
            if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            }
            // Store original material
            originalMaterials.current.set(child, child.material.clone());
          }
        });
        setModel(gltf);
      } catch (err) {
        console.error('Model loading error:', err);
        setError(`Failed to load model: ${err.message}`);
      }
    };
    loadModel();
  }, [setError]);

  useEffect(() => {
    if (!model) return;

    const newHighlightedMeshes = new Set();
    model.scene.traverse((child) => {
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
  }, [selectedParts, model]);

  const handleMeshClick = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh && mesh.name) {
      console.log('Part clicked:', mesh.name);
      onPartClick(mesh.name);
    }
  };

  if (!model) {
    console.log('Rendering fallback cube...');
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <group>
      <primitive
        object={model.scene}
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