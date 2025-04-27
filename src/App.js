import { useState } from 'react';
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
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePartClick = (partName) => {
    console.log('Part selected:', partName);
    setSelectedPart(partName);
    setError(null);
  };

  const handleGetDiagnosis = async () => {
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
    <div className="flex flex-row w-screen h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-3/5 h-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          shadows
          onCreated={() => console.log('Canvas initialized')}
        >
          <color attach="background" args={['#808080']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={1.8} castShadow />
          <Environment preset="city" />
          <BodyModel onPartClick={handlePartClick} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <div className="w-2/5 p-6 bg-white shadow-xl rounded-l-2xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Medical Diagnosis Tool</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Body Part</span>
            <input
              type="text"
              value={selectedPart.replace(/_/g, ' ')}
              readOnly
              placeholder="Click model to select"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Pain Type</span>
            <input
              type="text"
              value={painType}
              onChange={(e) => setPainType(e.target.value)}
              placeholder="e.g., sharp, dull"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Duration</span>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 2 days"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Additional Symptoms</span>
            <input
              type="text"
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              placeholder="e.g., swelling"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            />
          </label>
          <button
            onClick={handleGetDiagnosis}
            disabled={isLoading}
            className={`w-full p-3 mt-4 text-white rounded-md ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Loading...' : 'Get Diagnosis'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-600">{error}</p>}
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