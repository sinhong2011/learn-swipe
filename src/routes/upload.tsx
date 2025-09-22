import { useLingui } from '@lingui/react/macro'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle, FileText, Info, Upload } from 'lucide-react'
import { useCallback, useId, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { dbHelpers, nextReviewAfterDays } from '@/lib/dexie-db'
import { useAppStore } from '@/store/useAppStore'
import { useDeckStore } from '@/store/useDeckStore'
import { parseCsv, rowsToCards, validateAnkiLike } from '@/utils/csv'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { upload, setUploadState, resetUploadState } = useAppStore()
  const { loadDecks } = useDeckStore()

  const deckNameId = useId()
  const fileInputId = useId()

  const [deckName, setDeckName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  useDocumentTitle(`${t`Upload CSV`} - LearnSwipe`)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files?.[0]) {
        const droppedFile = e.dataTransfer.files[0]
        if (
          droppedFile.type === 'text/csv' ||
          droppedFile.name.endsWith('.csv') ||
          droppedFile.name.endsWith('.txt')
        ) {
          setFile(droppedFile)
          setUploadState({ error: null }) // Clear any previous errors
        } else {
          setUploadState({ error: t`Please select a CSV or TXT file.` })
        }
      }
    },
    [setUploadState, t]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const selectedFile = e.target.files[0]
        if (
          selectedFile.type === 'text/csv' ||
          selectedFile.name.endsWith('.csv') ||
          selectedFile.name.endsWith('.txt')
        ) {
          setFile(selectedFile)
          setUploadState({ error: null }) // Clear any previous errors
        } else {
          setUploadState({ error: t`Please select a CSV or TXT file.` })
        }
      }
    },
    [setUploadState, t]
  )

  const handleUpload = useCallback(async () => {
    if (!deckName.trim()) {
      setUploadState({ error: t`Please enter a deck name` })
      return
    }

    if (!file) {
      setUploadState({ error: t`Please choose a CSV file` })
      return
    }

    try {
      setUploadState({
        isUploading: true,
        error: null,
        status: t`Reading file...`,
        progress: 10,
      })

      const text = await file.text()

      setUploadState({
        status: t`Parsing CSV...`,
        progress: 30,
      })

      const parsed = parseCsv(text)
      const rows = rowsToCards(parsed.headers, parsed.rows)

      setUploadState({
        status: t`Validating format...`,
        progress: 50,
      })

      const validation = validateAnkiLike(rows)
      if (!validation.ok) {
        throw new Error(validation.message || 'Invalid CSV format')
      }

      setUploadState({
        status: t`Creating deck...`,
        progress: 70,
      })

      const deck = await dbHelpers.createDeck(deckName.trim())

      setUploadState({
        status: t`Storing cards...`,
        progress: 90,
      })

      const count = await dbHelpers.addCards(
        deck.deck_id,
        rows.map((r) => ({
          deck_id: deck.deck_id,
          question: r.question,
          answer: r.answer,
          extra_fields: r.extra_fields,
          interval: 1,
          next_review: nextReviewAfterDays(0),
        }))
      )

      setUploadState({
        status: t`Imported ${count} cards to deck "${deck.name}"`,
        progress: 100,
        isUploading: false,
      })

      // Refresh decks list
      await loadDecks()

      // Navigate to study page after a short delay
      setTimeout(() => {
        resetUploadState()
        navigate({ to: '/study/$deckId', params: { deckId: deck.deck_id } })
      }, 1500)
    } catch (error: unknown) {
      setUploadState({
        error: error instanceof Error ? error.message : t`Upload failed.`,
        status: null,
        isUploading: false,
        progress: 0,
      })
    }
  }, [deckName, file, setUploadState, navigate, resetUploadState, loadDecks, t])

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Upload className="h-8 w-8" />
          Upload CSV
        </h1>
        <p className="text-muted-foreground">
          Upload a CSV file with your flashcards. Supports Anki-style format.
        </p>
      </div>

      <div className="space-y-6">
        {/* Deck Name Input */}
        <div className="space-y-2">
          <label htmlFor={deckNameId} className="text-sm font-medium">
            Deck Name
          </label>
          <Input
            id={deckNameId}
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="e.g. English Vocabulary"
            disabled={upload.isUploading}
          />
        </div>

        {/* File Upload Area */}
        <div className="space-y-2">
          <label htmlFor={fileInputId} className="text-sm font-medium">
            CSV File
          </label>
          <section
            className={`border-2 border-dashed rounded-lg transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            aria-label="File drop zone"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Button
              asChild
              variant="ghost"
              className="w-full h-auto p-8 text-center flex-col gap-4"
            >
              <label
                htmlFor={fileInputId}
                className="w-full h-auto text-center flex-col gap-4 inline-flex"
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {file ? (
                  <div>
                    <p className="text-lg font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg mb-4">
                      Drop your CSV file here or click to browse
                    </p>
                    <Input
                      id={fileInputId}
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      onChange={handleFileChange}
                      disabled={upload.isUploading}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </label>
            </Button>
          </section>
        </div>

        {/* Format Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Expected format:</strong> Front, Back, (optional)
            Tags/Category columns.
            <br />
            First column = Question, Second column = Answer. Additional columns
            stored as extra fields.
          </AlertDescription>
        </Alert>

        {/* Progress Bar */}
        {upload.isUploading && (
          <div className="space-y-2">
            <Progress value={upload.progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              {upload.status}
            </p>
          </div>
        )}

        {/* Success Message */}
        {upload.status && !upload.isUploading && !upload.error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              {upload.status}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {upload.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{upload.error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleUpload}
            disabled={upload.isUploading || !deckName.trim() || !file}
            size="lg"
            className="flex-1"
          >
            {upload.isUploading ? 'Uploading...' : 'Import'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            disabled={upload.isUploading}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
