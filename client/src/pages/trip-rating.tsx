import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TripRating() {
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    
    try {
      const tripId = '123'; // TODO: Get from context
      
      const response = await fetch(`/api/requests/${tripId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      });
      
      if (response.ok) {
        setLocation('/home');
      } else {
        alert('Failed to submit rating');
      }
    } catch (error) {
      alert('Error submitting rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipRating = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold">Rate Your Experience</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-sm w-full">
          {/* Driver Info */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-600">MJ</span>
            </div>
            <h2 className="text-lg font-semibold">Mike Johnson</h2>
            <p className="text-gray-600 text-sm">Your tow truck driver</p>
          </div>

          {/* Star Rating */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">How was your experience?</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Feedback */}
          {rating > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience or suggestions..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {rating > 0 && (
              <Button
                onClick={handleSubmitRating}
                disabled={submitting}
                className="w-full bg-towapp-orange hover:bg-orange-600"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            )}
            
            <Button
              onClick={handleSkipRating}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              {rating > 0 ? 'Skip Feedback' : 'Return to Home'}
            </Button>
          </div>

          {/* Thank You Message */}
          {submitting && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Thank you for your feedback!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}