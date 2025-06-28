import { useState } from 'react'
import type { Application } from '@/lib/api'

const clsx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')

interface Props {
  application: Application
  onStatusChange?: (id: string, status: 'accepted' | 'denied' | 'canceled') => void
  questions?: string[]
}

const VolunteerCard = ({ application, onStatusChange, questions }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Format the submitted_at timestamp
  const formatDate = (timestamp?: { _seconds: number; _nanoseconds: number }) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp._seconds * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get all question-answer pairs from the answers object
  const getQuestionAnswerPairs = () => {
    if (!application.answers || typeof application.answers !== 'object') {
      return []
    }
    return Object.entries(application.answers)
  }

  const questionAnswerPairs = getQuestionAnswerPairs()

  return (
    <article className="group relative flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={'/avatar-placeholder.svg'}
          alt=""
          className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
          loading="lazy"
        />

        <div className="flex-1 min-w-0">
          <header className="flex items-center gap-2">
            <h3 className="font-medium truncate">Application {application.application_id.slice(-8)}</h3>
            <span
              className={clsx(
                'text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide',
                application.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                application.status === 'accepted' && 'bg-green-100 text-green-700',
                application.status === 'denied' && 'bg-red-100 text-red-700',
                application.status === 'canceled' && 'bg-gray-200 text-gray-600'
              )}
            >
              {application.status}
            </span>
          </header>
          <p className="text-xs text-gray-500 truncate">
            Submitted {formatDate(application.submitted_at)} · ID&nbsp;{application.application_id.slice(0, 8)}…
          </p>
        </div>

        <div className="flex gap-2">
          {application.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange?.(application.application_id, 'accepted')}
                className="btn-accept"
                aria-label="Accept application"
              >
                Accept
              </button>
              <button
                onClick={() => onStatusChange?.(application.application_id, 'denied')}
                className="btn-deny"
                aria-label="Deny application"
              >
                Deny
              </button>
            </>
          )}
          <button
            onClick={() => onStatusChange?.(application.application_id, 'canceled')}
            className="btn-cancel"
            aria-label="Cancel application"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Questions and Answers Section */}
      {questionAnswerPairs.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Application Responses</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {isExpanded ? (
            <div className="space-y-3">
              {questionAnswerPairs.map(([question, answer], idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-sm text-gray-700 mb-1">
                    {question}
                  </p>
                  <p className="text-sm text-gray-900">
                    {answer || <span className="text-gray-400 italic">(no answer)</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>{questionAnswerPairs.length} questions answered • Click "Show Details" to view responses</p>
            </div>
          )}
        </div>
      )}
      
      {/* No Questions Available */}
      {questionAnswerPairs.length === 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="text-sm text-gray-500 italic">No application responses available</p>
        </div>
      )}
    </article>
  )
}

export default VolunteerCard