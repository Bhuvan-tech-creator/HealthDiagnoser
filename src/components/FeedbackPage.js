import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { diagnosis, recommendations } = location.state || {};
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', { feedback, rating });
    alert('Thank you for your feedback!');
    navigate('/diagnosis');
  };

  const handleBack = () => {
    if (diagnosis && recommendations) {
      localStorage.setItem('diagnosis', JSON.stringify({ diagnosis, recommendations }));
    }
    navigate('/diagnosis');
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md p-4 border-2 border-gray-200 rounded-lg flex flex-col space-y-3 shadow-sm bg-white">
        <h2 className="text-gray-700 font-semibold text-lg">We Value Your Feedback</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Was the diagnosis helpful?</span>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-200 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              required
            >
              <option value="">Select an option</option>
              <option value="very-helpful">Very Helpful</option>
              <option value="somewhat-helpful">Somewhat Helpful</option>
              <option value="not-helpful">Not Helpful</option>
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Additional Comments</span>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="mt-1 w-full p-2 border border-gray-200 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 h-16 resize-none shadow-sm"
            />
          </label>
          <div className="flex flex-row space-x-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-1/2 p-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition shadow-sm"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-1/2 p-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}