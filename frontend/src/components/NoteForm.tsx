import { useState } from 'react'
import { ingestNote } from '../api'

interface Props {
    onSuccess: () => void
}

export default function NoteForm({ onSuccess }: Props) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)
        try {
            const res = await ingestNote({ title: title.trim(), content: content.trim() })
            setSuccess(`Saved "${res.title}" (${res.chunksCreated} chunks)`)
            setTitle('')
            setContent('')
            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save note')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                </label>
                <input
                    id="note-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Give your note a title"
                    maxLength={200}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                </label>
                <textarea
                    id="note-content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Paste or type your note here..."
                    rows={6}
                    maxLength={50000}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <p className="text-xs text-gray-400 mt-1">{content.length.toLocaleString()} / 50,000</p>
            </div>

            {error && <p className="text-sm text-red-600 rounded bg-red-50 px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-700 rounded bg-green-50 px-3 py-2">{success}</p>}

            <button
                type="submit"
                disabled={loading}
                className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Saving…' : 'Save Note'}
            </button>
        </form>
    )
}
