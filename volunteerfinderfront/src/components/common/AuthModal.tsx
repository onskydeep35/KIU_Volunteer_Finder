import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/useAuth'
import { api } from '@/lib/api'

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email(),
  dob: z.string().min(1),
  sex: z.string().min(1),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

type Props = {
  open: boolean
  onClose: () => void
}

const AuthModal = ({ open, onClose }: Props) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { login } = useAuth()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
  })

  const [dob, setDob] = useState({ day: '', month: '', year: '' })
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const years = Array.from({ length: 101 }, (_, i) => String(1925 + i))

  const updateDob = (part: Partial<typeof dob>) => {
    const newDob = { ...dob, ...part }
    setDob(newDob)
    if (newDob.day && newDob.month && newDob.year) {
      setValue('dob', `${newDob.day}-${newDob.month}-${newDob.year}`)
    }
  }

  const onSubmit = async (values: LoginForm | RegisterForm) => {
    if (mode === 'login') {
      try {
        await login({
          user_identifier: values.email,
          password: values.password,
        })
        onClose()
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
        const registerData = values as RegisterForm
        const signupRequest = {
          first_name: registerData.name,
          last_name: registerData.surname,
          age: 25, // You might want to calculate this from dob or add age field
          sex: registerData.sex as 'Male' | 'Female',
          email: registerData.email,
          username: registerData.email, // Using email as username
          password: registerData.password,
        }
        await api.registerUser(signupRequest)
        onClose()
      } catch (err) {
        console.log(err)
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className="relative bg-neutralLight p-6 rounded-xl w-[420px] flex flex-col gap-6"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-2xl font-bold text-center text-neutralDark">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {mode === 'register' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  {...registerField('name')}
                  className="input-primary w-full"
                  placeholder="First name"
                  aria-invalid={mode === 'register' && 'name' in errors}
                />
                <input
                  {...registerField('surname')}
                  className="input-primary w-full"
                  placeholder="Surname"
                  aria-invalid={mode === 'register' && 'surname' in errors}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  className="input-primary w-full"
                  value={dob.day}
                  onChange={(e) => updateDob({ day: e.target.value })}
                >
                  <option value="" disabled>
                    Day
                  </option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  className="input-primary w-full"
                  value={dob.month}
                  onChange={(e) => updateDob({ month: e.target.value })}
                >
                  <option value="" disabled>
                    Month
                  </option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  className="input-primary w-full"
                  value={dob.year}
                  onChange={(e) => updateDob({ year: e.target.value })}
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Female"
                    className="accent-primary"
                    {...registerField('sex')}
                  />
                  Female
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Male"
                    className="accent-primary"
                    {...registerField('sex')}
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Other"
                    className="accent-primary"
                    {...registerField('sex')}
                  />
                  Other
                </label>
              </div>
            </>
          )}
          <input
            {...registerField('email')}
            className="input-primary w-full"
            placeholder="Email"
            aria-invalid={!!errors.email}
          />
          <input
            type="password"
            {...registerField('password')}
            className="input-primary w-full"
            placeholder="Password"
            aria-invalid={!!errors.password}
          />
          {mode === 'register' && (
            <input type="hidden" {...registerField('dob')} />
          )}
          <button
            type="submit"
            className="btn-primary w-full rounded-xl"
            onClick={() => handleSubmit(onSubmit)()}
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          className="text-primary text-sm hover:underline text-center"
          onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
        >
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Have an account? Login'}
        </button>
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

export default AuthModal
