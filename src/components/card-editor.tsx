import { useLingui } from '@lingui/react/macro'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Card } from '@/lib/dexie-db'

interface CardEditorProps {
  card?: Card | null
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: {
    question: string
    answer: string
    extra_fields?: Record<string, unknown>
  }) => Promise<void>
  title?: string
  description?: string
}

export function CardEditor({
  card,
  isOpen,
  onClose,
  onSave,
  title,
  description,
}: CardEditorProps) {
  const { t } = useLingui()
  const questionId = useId()
  const answerId = useId()
  const extraFieldsId = useId()

  const [question, setQuestion] = useState(card?.question || '')
  const [answer, setAnswer] = useState(card?.answer || '')
  const [extraFields, setExtraFields] = useState(
    JSON.stringify(card?.extra_fields || {}, null, 2)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form fields when card prop changes
  useEffect(() => {
    if (card) {
      setQuestion(card.question || '')
      setAnswer(card.answer || '')
      setExtraFields(JSON.stringify(card.extra_fields || {}, null, 2))
    } else {
      // Reset form for new card
      setQuestion('')
      setAnswer('')
      setExtraFields('{}')
    }
    setError(null)
  }, [card])

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      setError(t`Question and answer are required`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let parsedExtraFields = {}
      if (extraFields.trim()) {
        try {
          parsedExtraFields = JSON.parse(extraFields)
        } catch {
          setError(t`Invalid JSON in extra fields`)
          setIsLoading(false)
          return
        }
      }

      await onSave({
        question: question.trim(),
        answer: answer.trim(),
        extra_fields: parsedExtraFields,
      })

      // Reset form
      setQuestion('')
      setAnswer('')
      setExtraFields('{}')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Failed to save card`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      // Reset form to original card values or empty for new cards
      if (card) {
        setQuestion(card.question || '')
        setAnswer(card.answer || '')
        setExtraFields(JSON.stringify(card.extra_fields || {}, null, 2))
      } else {
        setQuestion('')
        setAnswer('')
        setExtraFields('{}')
      }
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {title || (card ? t`Edit Card` : t`Add New Card`)}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={questionId}>{t`Question`}</Label>
            <Textarea
              id={questionId}
              placeholder={t`Enter the question...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={answerId}>{t`Answer`}</Label>
            <Textarea
              id={answerId}
              placeholder={t`Enter the answer...`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={extraFieldsId}>
              {t`Extra Fields`}{' '}
              <span className="text-sm text-muted-foreground">
                ({t`JSON format, optional`})
              </span>
            </Label>
            <Textarea
              id={extraFieldsId}
              placeholder={t`{"example": "value"}`}
              value={extraFields}
              onChange={(e) => setExtraFields(e.target.value)}
              className="min-h-[60px] font-mono text-sm"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !question.trim() || !answer.trim()}
          >
            {isLoading ? t`Saving...` : t`Save Card`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface QuickCardEditorProps {
  onSave: (cardData: { question: string; answer: string }) => Promise<void>
  className?: string
}

export function QuickCardEditor({
  onSave,
  className = '',
}: QuickCardEditorProps) {
  const { t } = useLingui()
  const quickQuestionId = useId()
  const quickAnswerId = useId()

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || !answer.trim()) return

    setIsLoading(true)
    try {
      await onSave({
        question: question.trim(),
        answer: answer.trim(),
      })
      setQuestion('')
      setAnswer('')
    } catch (error) {
      console.error('Failed to save card:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={quickQuestionId}>{t`Question`}</Label>
          <Input
            id={quickQuestionId}
            placeholder={t`Enter question...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={quickAnswerId}>{t`Answer`}</Label>
          <Input
            id={quickAnswerId}
            placeholder={t`Enter answer...`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading || !question.trim() || !answer.trim()}
        className="w-full md:w-auto"
      >
        {isLoading ? t`Adding...` : t`Add Card`}
      </Button>
    </form>
  )
}
