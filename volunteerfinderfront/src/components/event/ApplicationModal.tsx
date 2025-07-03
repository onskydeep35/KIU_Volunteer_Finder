import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/lib/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  eventId: string;
  questions: string[];
}

interface FormValues {
  answers: string[];
}

const ApplicationModal = ({ open, onClose, eventId, questions }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { answers: questions.map(() => '') },
  });
  
  const addToast = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      addToast('You must be logged in to apply.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user_id: user.user_id,
      event_id: eventId,
      answers: values.answers,
    };

    try {
      const response = await fetch(`/api/applications/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application.');
      }

      addToast('Application submitted successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      addToast('There was an error submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold mb-4">Apply for Event</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {questions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{q}</label>
              <textarea
                {...register(`answers.${i}` as const, { required: 'This field is required.' })}
                className={`input-primary w-full ${errors.answers?.[i] ? 'border-red-500' : ''}`}
                placeholder={`Your answer to: "${q}"`}
                rows={3}
                disabled={isSubmitting}
              />
              {errors.answers?.[i] && (
                 <p className="text-red-500 text-xs mt-1">{errors.answers[i]?.message}</p>
              )}
            </div>
          ))}
          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl leading-none"
          onClick={onClose}
          disabled={isSubmitting}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ApplicationModal;
