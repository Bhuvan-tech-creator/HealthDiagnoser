import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './BodyModel';

// Function to parse and render the diagnosis with the condition name in bold
const renderDiagnosis = (diagnosis) => {
  // Check if the diagnosis contains ** markers
  const regex = /\*\*(.*?)\*\*/;
  const match = diagnosis.match(regex);

  if (match && match[1]) {
    const condition = match[1]; // Extract the condition name between ** markers
    const parts = diagnosis.split(regex); // Split the string at the markers
    return (
      <>
        {parts[0]}
        <strong>{condition}</strong>
        {parts[2]}
      </>
    );
  }

  // Fallback if no markers are found
  return diagnosis;
};

export default function DiagnosisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedDiagnosis = JSON.parse(localStorage.getItem('diagnosis')) || {};
  const { diagnosis, recommendations } = location.state || savedDiagnosis || { diagnosis: 'No diagnosis available', recommendations: 'No recommendations available' };

  const handleBack = () => {
    navigate('/');
  };

  const handleFeedback = () => {
    navigate('/feedback', { state: { diagnosis, recommendations } });
  };

  return (
    <div className="flex flex-row w-screen h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-1/2 h-full border-2 border-gray-200 rounded-lg m-2 shadow-sm">
        <div className="text-center text-gray-700 font-semibold text-lg mt-1">BODY (readonly)</div>
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
          <BodyModel onPartClick={() => {}} selectedParts={[]} />
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
      <div className="w-1/2 p-4 m-2 border-2 border-gray-200 rounded-lg flex flex-col space-y-3 shadow-sm">
        <div className="flex flex-col space-y-3 flex-1">
          <div className="flex flex-row space-x-3">
            <div className="flex-1">
              <h2 className="text-gray-700 font-semibold text-lg mb-1 border-b-2 border-gray-200 pb-1">Diagnosis</h2>
              <div className="text-gray-600 text-sm">{renderDiagnosis(diagnosis)}</div>
            </div>
            <div className="flex-1 border-l-2 border-gray-200 pl-3">
              <h2 className="text-gray-700 font-semibold text-lg mb-1 border-b-2 border-gray-200 pb-1">How to Fix It</h2>
              <div className="text-gray-600 text-sm">{recommendations}</div>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-xs italic mt-2">
          We are not medical professionals. Consult a doctor. Use at your own risk.
        </p>
        <div className="flex flex-row space-x-3 mt-3">
          <button
            onClick={handleBack}
            className="w-1/2 p-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition shadow-sm"
          >
            Back
          </button>
          <button
            onClick={handleFeedback}
            className="w-1/2 p-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition shadow-sm"
          >
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
}