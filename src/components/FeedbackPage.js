import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [usefulness, setUsefulness] = useState(3);
  const [accuracy, setAccuracy] = useState(3);
  const [comments, setComments] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-secret-api-key-12345', // Replace with the same API key as in server.js
        },
        body: JSON.stringify({ usefulness, accuracy, comments }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess('Thank you for your feedback!');
      setTimeout(() => navigate('/'), 1500); // Navigate back to Home after 1.5 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="w-full max-w-md p-4">
        <h2 className="text-gray-700 font-semibold text-lg">Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mt-2">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Usefulness (1-5)</span>
              <input
                type="range"
                min="1"
                max="5"
                value={usefulness}
                onChange={(e) => setUsefulness(parseInt(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
          <div className="mt-2">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Accuracy (1-5)</span>
              <input
                type="range"
                min="1"
                max="5"
                value={accuracy}
                onChange={(e) => setAccuracy(parseInt(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
          <div className="mt-2">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Comments</span>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full"
              />
            </label>
          </div>
          {error && (
            <p className="mt-1 text-red-600 font-medium text-sm">{error}</p>
          )}
          {success && (
            <p className="mt-1 text-green-600 font-medium text-sm">{success}</p>
          )}
          <div className="mt-2 flex space-x-2">
            <button type="button" className="w-1/2 p-2 bg-gray-200" onClick={() => navigate('/')}>
              Back
            </button>
            <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;