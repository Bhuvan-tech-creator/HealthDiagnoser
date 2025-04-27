import { useGLTF, Html } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function Model({ setError, onPartClick, selectedParts }) {
  const originalMaterials = useRef(new Map());
  const targetColors = useRef(new Map());

  // Load the GLTF model
  let gltf;
  try {
    gltf = useGLTF('https://425tooearly.pythonanywhere.com/models/body-model.glb');
    console.log('Model loaded:', gltf);
    console.log('Scene children:', gltf.scene.children.map(child => child.name));
  } catch (err) {
    console.error('Detailed model loading error:', err);
    setError(`Failed to load model: ${err.message || 'Unknown error'}${err.stack ? '\nStack: ' + err.stack : ''}`);
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

  // Center the model
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);
  // Remove the manual offset to ensure geometric centering
  console.log('Model bounding box:', box);
  console.log('Computed center:', center);
  console.log('Final model position:', gltf.scene.position);

  // Initialize materials and target colors
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log('Mesh found:', child.name, 'Material:', child.material, 'Parent:', child.parent ? child.parent.name : 'None');
      if (child.name === 'left_hand001') {
        console.log('Found left_hand001:', { material: child.material, color: child.material ? child.material.color : 'No color' });
      }
      child.castShadow = true;
      child.receiveShadow = true;
      if (!child.material) {
        console.warn(`Mesh ${child.name} has no material, assigning default`);
        child.material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          roughness: 0.8,
          metalness: 0.2,
        });
      } else if (!(child.material instanceof THREE.MeshStandardMaterial)) {
        console.warn(`Mesh ${child.name} has non-standard material, replacing`);
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || 0xaaaaaa,
          roughness: 0.8,
          metalness: 0.2,
        });
      }
      if (!originalMaterials.current.has(child)) {
        originalMaterials.current.set(child, child.material.clone());
      }
      targetColors.current.set(child, child.material.color.clone());
    }
  });

  // Update materials based on selection state
  useEffect(() => {
    console.log('Selected parts:', selectedParts);
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const childNameNormalized = child.name.toLowerCase().trim();
        const isSelected = selectedParts.some(part => part.toLowerCase().trim() === childNameNormalized);
        console.log(`Checking mesh: ${child.name}, Normalized: ${childNameNormalized}, isSelected: ${isSelected}`);
        if (child.name === 'left_hand001') {
          console.log('left_hand001 selection status:', { isSelected, selectedParts });
        }
        const originalMaterial = originalMaterials.current.get(child);
        if (!originalMaterial) {
          console.warn(`No original material for mesh ${child.name}`);
          return;
        }

        child.material = originalMaterial.clone();

        if (isSelected) {
          targetColors.current.set(child, new THREE.Color('#006400'));
          child.material.emissive.set('#006400');
          child.material.emissiveIntensity = 0.3;
        } else {
          targetColors.current.set(child, originalMaterial.color.clone());
          child.material.emissive.set(0x000000);
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [selectedParts, gltf.scene]);

  // Smooth color transition
  useFrame(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const targetColor = targetColors.current.get(child);
        if (targetColor) {
          child.material.color.lerp(targetColor, 0.1);
        }
      }
    });
  });

  const handleMeshClick = (e) => {
    e.stopPropagation();
    let mesh = e.object;
    while (mesh && !mesh.isMesh) {
      mesh = mesh.parent;
    }
    if (mesh && mesh.isMesh && mesh.name) {
      console.log('Part clicked:', mesh.name, 'Currently selected:', selectedParts.includes(mesh.name));
      if (mesh.name === 'left_hand001') {
        console.log('Clicked left_hand001');
      }
      onPartClick(mesh.name);
    } else {
      console.warn('Clicked object is not a mesh or has no name:', e.object);
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
              <li>File exists at https://425tooearly.pythonanywhere.com/models/body-model.glb</li>
              <li>File is a valid GLB format (binary, not UTF-8)</li>
              <li>Server is running on PythonAnywhere</li>
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

useGLTF.preload('https://425tooearly.pythonanywhere.com/models/body-model.glb');