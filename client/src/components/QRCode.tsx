import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";

type QRCodeProps = {
    data: string;
    size?: number;
};

function QRCode({ data, size = 120 }: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;

        QRCodeLib.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
        }).catch(() => setError(true));
    }, [data, size]);

    if (error) return null;

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded-lg border border-white/20"
        />
    );
}

export default QRCode;
