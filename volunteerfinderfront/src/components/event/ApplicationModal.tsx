import { useForm } from 'react-hook-form'
import { useToast } from '@/components/common/Toast'

interface Props {
  open: boolean
  onClose: () => void
  eventId: string
  questions: string[]
}

interface FormValues {
  answers: string[]
}

const ApplicationModal = ({ open, onClose, eventId, questions }: Props) => {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { answers: questions.map(() => '') },
  })
  const addToast = useToast()

  const onSubmit = async (values: FormValues) => {
    await fetch(`/api/events/${eventId}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    addToast('Application submitted')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div
        className="bg-white p-4 rounded w-96 relative"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold mb-2">Apply</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {questions.map((q, i) => (
            <textarea
              key={i}
              {...register(`answers.${i}` as const)}
              className="input-primary w-full"
              placeholder={q}
            />
          ))}
          <button type="submit" className="btn-primary w-full">
            Submit
          </button>
        </form>
        <button
          aria-label="Close"
          className="absolute top-2 right-2 text-xl leading-none"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default ApplicationModal
