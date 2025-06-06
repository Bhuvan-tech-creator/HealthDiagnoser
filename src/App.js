import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './components/BodyModel';
import DiagnosisPage from './components/DiagnosisPage';
import FeedbackPage from './components/FeedbackPage';
import Header from './components/Header';
import './styles.css';

function Home() {
  const [selectedParts, setSelectedParts] = useState([]);
  const [painType, setPainType] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState(1);
  const [additional, setAdditional] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const canvasRef = useRef();

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  const handlePartClick = (partName) => {
    setSelectedParts((prev) => {
      if (prev.includes(partName)) {
        return prev.filter((part) => part !== partName);
      } else {
        return [...prev, partName];
      }
    });
    setError(null);
  };

  const handleNext = async () => {
    if (selectedParts.length === 0) {
      setError('Please select at least one body part.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        locations: selectedParts,
        painType: painType || 'unspecified',
        duration: duration || 'unknown',
        severity: severity || 1,
        additional: additional || 'none',
        extraDetails: extraDetails || 'none',
        medicalHistory: medicalHistory || 'none',
        age: age || 'unspecified',
        gender: gender || 'unspecified',
        followUpAnswer: followUpAnswer || 'unspecified',
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
      setProgress(100);
      navigate('/diagnosis', { state: { diagnosis: data.diagnosis, recommendations: data.recommendations } });
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(`Failed to get diagnosis: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            AI-Powered Health
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Diagnosis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant health insights by selecting pain points on our interactive 3D body model. 
            Our advanced AI analyzes your symptoms to provide preliminary diagnosis and recommendations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 3D Model Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Interactive Body Model
              </h2>
              <p className="text-blue-100 text-sm mt-1">Click on areas where you feel pain</p>
            </div>
            <div className="h-96 lg:h-[500px]">
              <Canvas
                ref={canvasRef}
                camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
                gl={{ antialias: true }}
                shadows
              >
                <color attach="background" args={['#f8fafc']} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
                <Environment preset="studio" />
                <BodyModel onPartClick={handlePartClick} selectedParts={selectedParts} />
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
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Symptom Details</h2>
              <p className="text-gray-600">Provide additional information to improve diagnosis accuracy</p>
            </div>

            <div className="space-y-4">
              {/* Selected Body Parts */}
              <div className="form-group">
                <label className="form-label">Selected Body Parts</label>
                <div className="form-control bg-gray-50 min-h-[44px] flex items-center">
                  {selectedParts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedParts.map(part => (
                        <span key={part} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {part.replace(/_/g, ' ')}
                          <button
                            onClick={() => handlePartClick(part)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">Click on the body model to select areas</span>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Pain Type</label>
                  <input
                    type="text"
                    value={painType}
                    onChange={(e) => setPainType(e.target.value)}
                    placeholder="e.g., sharp, dull, throbbing"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 2 days, 1 week"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Pain Severity */}
              <div className="form-group">
                <label className="form-label">Pain Severity: {severity}/10</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              {/* Follow-up Question */}
              {selectedParts.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Does the pain worsen with movement?</label>
                  <select
                    value={followUpAnswer}
                    onChange={(e) => setFollowUpAnswer(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}

              {/* Additional Symptoms */}
              <div className="form-group">
                <label className="form-label">Additional Symptoms</label>
                <input
                  type="text"
                  value={additional}
                  onChange={(e) => setAdditional(e.target.value)}
                  placeholder="e.g., swelling, fever, nausea"
                  className="form-control"
                />
              </div>

              {/* Extra Details */}
              <div className="form-group">
                <label className="form-label">Extra Details</label>
                <textarea
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="Any additional information about your symptoms"
                  className="form-control"
                  rows="3"
                />
              </div>

              {/* Medical History */}
              <div className="form-group">
                <label className="form-label">Medical History</label>
                <textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Previous injuries, chronic conditions, medications"
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {isLoading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Analyzing symptoms...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`btn btn-primary w-full mt-6 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  Get Diagnosis
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-amber-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-amber-800 text-sm font-medium">Medical Disclaimer</p>
                  <p className="text-amber-700 text-xs mt-1">
                    This tool provides preliminary insights only. Always consult a healthcare professional for proper medical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}