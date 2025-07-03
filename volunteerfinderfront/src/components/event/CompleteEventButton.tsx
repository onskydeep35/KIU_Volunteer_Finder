import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

interface Props {
  eventId: string;
  onEventCompleted: () => void; // A callback to update the UI after completion
}

const CompleteEventButton = ({ eventId, onEventCompleted }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const addToast = useToast();

  const handleCompleteEvent = async () => {
    if (!user) {
      addToast('You must be logged in.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.completeEvent(eventId);

      addToast(data.message);
      setModalOpen(false);
      onEventCompleted();
    } catch (error: any) {
      addToast(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="btn-primary bg-green-600 hover:bg-green-700"
      >
        Complete Event
      </button>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-2">Are you sure?</h2>
            <p className="text-gray-600 mb-6">
              This will award points to all accepted volunteers and archive the event. This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalOpen(false)}
                disabled={isLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteEvent}
                disabled={isLoading}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Completing...' : 'Yes, Complete It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompleteEventButton;
