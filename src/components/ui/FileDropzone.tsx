'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Camera, X, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/TranslationProvider'
import { isValidImageType } from '@/lib/schemas'

interface FileDropzoneProps {
  label: string
  onFile: (file: File) => void
  preview?: string | null
  isProcessing?: boolean
  progress?: number
  ocrStatus?: 'idle' | 'processing' | 'success' | 'partial' | 'failed'
  onRetry?: () => void
  onClear?: () => void
}

export function FileDropzone({
  label,
  onFile,
  preview,
  isProcessing,
  progress,
  ocrStatus,
  onRetry,
  onClear,
}: FileDropzoneProps) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!isValidImageType(file)) {
      setError(t('upload.warning'))
      return
    }
    onFile(file)
  }, [onFile, t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  // Show preview state
  if (preview && !isProcessing) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
          <img src={preview} alt={label} className="h-full w-full object-cover" />
          {onClear && (
            <button
              onClick={onClear}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          {ocrStatus === 'success' && (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">{t('upload.success')}</span>
            </>
          )}
          {ocrStatus === 'partial' && (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400">{t('upload.partial')}</span>
            </>
          )}
          {ocrStatus === 'failed' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span className="text-xs text-rose-600 dark:text-rose-400">{t('upload.failed')}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-500"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t('upload.retry')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</p>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-50/50 dark:bg-cyan-500/5'
            : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600'
        } ${isProcessing ? 'pointer-events-none' : ''}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="mt-3 text-sm text-neutral-500">{t('upload.processing')}</p>
            {progress !== undefined && progress > 0 && (
              <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-neutral-400" />
            <p className="mt-3 text-sm text-neutral-500">
              {t('upload.dropzone')}{' '}
              <span className="font-medium text-cyan-600 dark:text-cyan-400">{t('upload.browse')}</span>
            </p>
            <p className="mt-1 text-xs text-neutral-400">{t('upload.warning')}</p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Camera button (mobile) */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm text-neutral-600 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <Camera className="h-4 w-4" />
        {t('upload.camera')}
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
      )}
    </div>
  )
}
