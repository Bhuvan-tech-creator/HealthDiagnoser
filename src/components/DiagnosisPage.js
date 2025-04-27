import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './BodyModel';

export default function DiagnosisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { diagnosis, recommendations } = location.state || { diagnosis: 'No diagnosis available', recommendations: 'No recommendations available' };

  const handleBack = () => {
    navigate('/');
  };

  const handleQuestionMark = () => {
    console.log('??? button clicked - placeholder action');
  };

  return (
    <div className="flex flex-row w-screen h-screen bg-gray-100">
      <div className="w-3/5 h-full border-2 border-gray-300 rounded-lg m-4">
        <div className="text-center text-gray-600 font-medium mt-2">BODY (readonly)</div>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          shadows
          onCreated={() => console.log('Diagnosis Canvas initialized')}
        >
          <color attach="background" args={['#808080']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <Environment preset="studio" />
          <BodyModel onPartClick={() => {}} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            target={[0, 0, 0]}
            minDistance={2}
            maxDistance={15}
          />
        </Canvas>
      </div>
      <div className="w-2/5 p-6 m-4 border-2 border-gray-300 rounded-lg flex flex-col space-y-4">
        <div className="flex flex-col space-y-4 flex-1">
          <div className="flex flex-row space-x-4">
            <div className="flex-1">
              <h2 className="text-gray-600 font-medium mb-2 border-b-2 border-gray-300 pb-1">Diagnosis</h2>
              <div className="text-gray-700">{diagnosis}</div>
            </div>
            <div className="flex-1 border-l-2 border-gray-300 pl-4">
              <h2 className="text-gray-600 font-medium mb-2 border-b-2 border-gray-300 pb-1">How to fix it</h2>
              <div className="text-gray-700">{recommendations}</div>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-sm italic mt-4">
          We are not medical professionals. Consult a doctor. Use at your own risk.
        </p>
        <div className="flex flex-row space-x-4 mt-4">
          <button
            onClick={handleBack}
            className="w-1/2 p-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            onClick={handleQuestionMark}
            className="w-1/2 p-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            ???
          </button>
        </div>
      </div>
    </div>
  );
}