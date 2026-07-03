type ToastProps = {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

function Toast({
    message,
    type = 'success',
    onClose,
}: ToastProps) {
    return (
        <div className="fixed right-4 top-4 z-[60] max-w-sm animate-float-up">
            <div
                className="rounded-xl border px-4 py-3 backdrop-blur-2xl"
                style={{
                    borderColor: type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                    background: type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: type === 'success' ? '#22C55E' : '#EF4444'
                }}
            >
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm opacity-70 transition hover:opacity-100"
                        style={{ color: type === 'success' ? '#22C55E' : '#EF4444' }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Toast;