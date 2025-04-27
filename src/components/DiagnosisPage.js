import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './BodyModel';

export default function DiagnosisPage() {
  const location = useLocation();
  const { diagnosis, recommendations } = location.state || { diagnosis: 'No diagnosis available', recommendations: 'No recommendations available' };

  return (
    <div className="flex flex-row w-screen h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-3/5 h-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          shadows
          onCreated={() => console.log('Diagnosis Canvas initialized')}
        >
          <color attach="background" args={['#808080']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={1.8} castShadow />
          <Environment preset="city" />
          <BodyModel onPartClick={() => {}} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <div className="w-2/5 p-6 bg-white shadow-xl rounded-l-2xl flex flex-col space-y-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Diagnosis</h2>
          <p className="text-gray-700">{diagnosis}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h2 className="text-xl font-bold text-green-800 mb-2">Recommendations</h2>
          <p className="text-gray-700">{recommendations}</p>
        </div>
      </div>
    </div>
  );
}