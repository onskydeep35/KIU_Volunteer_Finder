import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/common/Toast'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

interface FormValues {
  title: string
  date: string
  country: string
  region: string
  city: string
  category: string
  org_title: string
  imageUrl: string
  description: string
  questions: { value: string }[]
}

const CreateEvent = () => {
  const navigate = useNavigate()
  const addToast = useToast()
  const { user } = useAuth()

  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: '',
      date: '',
      country: '',
      region: '',
      city: '',
      category: '',
      org_title: '',
      imageUrl: '',
      description: '',
      questions: [{ value: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const eventPayload = {
        user_id: String(user.user_id),
        image_url: data.imageUrl,
        start_date: data.date,
        end_date: data.date,
        description: data.description,
        volunteer_form: data.questions.map((q) => q.value),
        category: data.category,
        org_title: data.org_title,
        country: data.country,
        region: data.region,
        city: data.city,
        applications: []
      }
      const res = await api.createEvent(eventPayload)
      if (res.entity_id && res.entity_id !== 'NaN') {
        addToast('Event created')
        navigate(`/events/${res.entity_id}`)
      } else {
        addToast('Event created, but could not determine event ID')
      }
    } catch (err) {
      addToast('Failed to create event')
    }
  }

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">Create Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-lg mx-auto">
        <input {...register('title')} placeholder="Title" className="input-primary w-full" />
        <input type="date" {...register('date')} className="input-primary w-full" />
        <input {...register('country')} placeholder="Country" className="input-primary w-full" />
        <input {...register('region')} placeholder="Region" className="input-primary w-full" />
        <input {...register('city')} placeholder="City" className="input-primary w-full" />
        <input {...register('category')} placeholder="Category" className="input-primary w-full" />
        <input {...register('org_title')} placeholder="Organization" className="input-primary w-full" />
        <input {...register('imageUrl')} placeholder="Image URL" className="input-primary w-full" />
        <textarea {...register('description')} placeholder="Description" className="input-primary w-full" />

      <div>
        <span className="font-medium">Questions</span>
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-2 my-1">
            <input
              {...register(`questions.${idx}.value` as const)}
              className="input-primary flex-1"
            />
            <button type="button" onClick={() => remove(idx)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({ value: '' })} className="text-primary">
          + Add Question
        </button>
      </div>
        <button type="submit" className="btn-primary">
          Create
        </button>
      </form>
    </div>

  )
}

export default CreateEvent
