import { useEffect, useState, useCallback } from 'react'
import { getItems, type ItemSummary } from '../api'

function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
    return new Date(iso).toLocaleDateString()
}

// Accept a `refresh` counter so parent can trigger a reload
interface Props {
    refresh: number
}

export default function ItemsList({ refresh }: Props) {
    const [items, setItems] = useState<ItemSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setError(null)
        setLoading(true)
        try {
            const data = await getItems()
            setItems(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load items')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load, refresh])

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Saved Knowledge</h2>
                {!loading && (
                    <span className="text-xs text-gray-400">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {loading && (
                <p className="text-sm text-gray-400">Loading…</p>
            )}

            {error && (
                <p className="text-sm text-red-600 rounded bg-red-50 px-3 py-2">{error}</p>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No knowledge saved yet.</p>
                    <p className="text-xs mt-1">Add a note or URL using the form above.</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <ul className="divide-y divide-gray-100">
                    {items.map(item => (
                        <li key={item.id} className="py-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                {item.sourceUrl && (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline truncate block max-w-xs"
                                    >
                                        {item.sourceUrl}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs text-gray-400">
                                <span className={`uppercase font-semibold tracking-wide px-2 py-0.5 rounded ${item.type === 'url'
                                        ? 'bg-purple-50 text-purple-600'
                                        : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.type}
                                </span>
                                <span>{formatRelativeTime(item.createdAt)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
