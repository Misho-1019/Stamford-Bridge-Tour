type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(5,12,28,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md glass-card p-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        {title}
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        {message}
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        style={{
                            border: '1px solid rgba(212,175,55,0.35)',
                            background: 'rgba(212,175,55,0.12)',
                            backdropFilter: 'blur(12px)',
                            color: '#D4AF37'
                        }}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;