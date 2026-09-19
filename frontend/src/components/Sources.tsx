import type { Citation } from '../api'

interface Props {
    citations: Citation[]
}

export default function Sources({ citations }: Props) {
    if (citations.length === 0) return null

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources</h3>
            <ul className="flex flex-col gap-2">
                {citations.map(c => (
                    <li key={c.chunkId} className="rounded border border-gray-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-700">{c.itemTitle}</span>
                            {/* score shown subtly */}
                            <span className="text-xs text-gray-400" title="Similarity score">
                                {(c.score * 100).toFixed(0)}% match
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            "{c.content.trim()}"
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
