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
    const styles =
        type === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-600";
    
    return (
        <div className="fixed right-4 top-4 z-[60] max-w-sm">
            <div className={`rounded-xl border px-4 py-3 shadow-lg ${styles}`}>
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm opacity-70 transition hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Toast;