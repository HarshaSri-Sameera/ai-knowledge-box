interface Props {
    question: string
    onChange: (q: string) => void
    onSubmit: () => void
    loading: boolean
}

export default function QuestionInput({
    question,
    onChange,
    onSubmit,
    loading
}: Props) {
    return (
        <div className="flex flex-col gap-3">
            <div>
                <label
                    htmlFor="question-input"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Question
                </label>

                <textarea
                    id="question-input"
                    value={question}
                    onChange={e => onChange(e.target.value)}
                    placeholder="What is RAG? How does chunking work?"
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={
                    loading ||
                    question.trim().length === 0
                }
                className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Asking…' : 'Ask'}
            </button>
        </div>
    )
}