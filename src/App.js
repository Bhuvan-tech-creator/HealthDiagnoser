import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './components/BodyModel';
import DiagnosisPage from './components/DiagnosisPage';
import './styles.css';

function Home() {
  const [selectedPart, setSelectedPart] = useState('');
  const [painType, setPainType] = useState('');
  const [duration, setDuration] = useState('');
  const [additional, setAdditional] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef();

  const handlePartClick = (partName) => {
    console.log('Part selected:', partName);
    setSelectedPart(partName);
    setError(null);
  };

  const handleNext = async () => {
    if (!selectedPart) {
      setError('Please select a body part.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        location: selectedPart,
        painType: painType || 'unspecified',
        duration: duration || 'unknown',
        additional: additional || 'none',
        extraDetails: extraDetails || 'none',
      };
      console.log('Sending diagnosis request:', payload);
      const response = await fetch('http://localhost:5000/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Diagnosis received:', data);
      navigate('/diagnosis', { state: { diagnosis: data.diagnosis, recommendations: data.recommendations } });
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(`Failed to get diagnosis: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row w-screen h-screen bg-gray-100">
      <div className="w-3/5 h-full border-2 border-gray-300 rounded-lg m-4">
        <div className="text-center text-gray-600 font-medium mt-2">BODY</div>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          shadows
          onCreated={() => console.log('Canvas initialized')}
        >
          <color attach="background" args={['#808080']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <Environment preset="studio" />
          <BodyModel onPartClick={handlePartClick} />
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
        <div className="text-gray-600 font-medium">Click on pain points</div>
        <label className="block">
          <span className="text-gray-600 font-medium">Body Part</span>
          <input
            type="text"
            value={selectedPart.replace(/_/g, ' ')}
            readOnly
            placeholder="Click model to select"
            className="mt-2 w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </label>
        <label className="block">
          <span className="text-gray-600 font-medium">Pain Type</span>
          <input
            type="text"
            value={painType}
            onChange={(e) => setPainType(e.target.value)}
            placeholder="e.g., sharp, dull"
            className="mt-2 w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </label>
        <label className="block">
          <span className="text-gray-600 font-medium">Duration</span>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 days"
            className="mt-2 w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </label>
        <label className="block">
          <span className="text-gray-600 font-medium">Additional Symptoms</span>
          <input
            type="text"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            placeholder="e.g., swelling"
            className="mt-2 w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </label>
        <label className="block">
          <span className="text-gray-600 font-medium">Extra details (symptoms)</span>
          <textarea
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            placeholder="e.g., swelling, redness"
            className="mt-2 w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition h-16 resize-none"
          />
        </label>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`w-full p-3 mt-4 text-white rounded-lg font-medium transition-all duration-300 ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {isLoading ? 'Loading...' : 'Next'}
        </button>
        {error && <p className="mt-2 text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
      </Routes>
    </Router>
  );
}