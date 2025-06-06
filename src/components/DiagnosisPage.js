import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from './BodyModel';
import Header from './Header';

// Function to parse and render the diagnosis with the condition name in bold
const renderDiagnosis = (diagnosis) => {
  const regex = /\*\*(.*?)\*\*/;
  const match = diagnosis.match(regex);

  if (match && match[1]) {
    const condition = match[1];
    const parts = diagnosis.split(regex);
    return (
      <>
        {parts[0]}
        <strong className="text-blue-700 font-semibold">{condition}</strong>
        {parts[2]}
      </>
    );
  }

  return diagnosis;
};

export default function DiagnosisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedDiagnosis = JSON.parse(localStorage.getItem('diagnosis')) || {};
  const { diagnosis, recommendations } = location.state || savedDiagnosis || { 
    diagnosis: 'No diagnosis available', 
    recommendations: 'No recommendations available' 
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleFeedback = () => {
    navigate('/feedback', { state: { diagnosis, recommendations } });
  };

  const handleNewDiagnosis = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Analysis Complete
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Health Analysis Results
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on your symptoms, here's what our AI analysis suggests. Remember to consult with a healthcare professional for proper medical advice.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 3D Model Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Body Reference
                </h2>
                <p className="text-gray-200 text-sm mt-1">Interactive view (read-only)</p>
              </div>
              <div className="h-96 lg:h-[500px]">
                <Canvas
                  camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
                  gl={{ antialias: true }}
                  shadows
                >
                  <color attach="background" args={['#f8fafc']} />
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
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Diagnosis Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Preliminary Diagnosis</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{renderDiagnosis(diagnosis)}</p>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recommended Actions</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{recommendations}</p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Medical Disclaimer</h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      This AI-generated analysis is for informational purposes only and should not replace professional medical advice. 
                      Always consult with a qualified healthcare provider for proper diagnosis and treatment. If you're experiencing 
                      severe symptoms or a medical emergency, seek immediate medical attention.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                
                <button
                  onClick={handleFeedback}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8" />
                  </svg>
                  Feedback
                </button>

                <button
                  onClick={handleNewDiagnosis}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}