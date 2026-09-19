import { useState } from 'react'
import { ingestUrl } from '../api'

interface Props {
    onSuccess: () => void
}

export default function UrlForm({ onSuccess }: Props) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)
        try {
            // Use URL hostname as fallback title if left blank
            const resolvedTitle = title.trim() || new URL(url.trim()).hostname
            const res = await ingestUrl({ title: resolvedTitle, url: url.trim() })
            setSuccess(`Saved "${res.title}" (${res.chunksCreated} chunks)`)
            setTitle('')
            setUrl('')
            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch URL')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
                <label htmlFor="url-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                    id="url-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Leave blank to use page hostname"
                    maxLength={200}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                </label>
                <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {error && <p className="text-sm text-red-600 rounded bg-red-50 px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-700 rounded bg-green-50 px-3 py-2">{success}</p>}

            <button
                type="submit"
                disabled={loading}
                className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Fetching…' : 'Save URL'}
            </button>
        </form>
    )
}
