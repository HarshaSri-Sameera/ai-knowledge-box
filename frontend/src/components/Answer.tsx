interface Props {
    text: string
}

export default function Answer({ text }: Props) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Answer</h3>
            <div className="rounded bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {text}
            </div>
        </div>
    )
}
