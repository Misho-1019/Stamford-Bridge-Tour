export function formatPrice(priceCents: number) {
    return `£${(priceCents / 100).toFixed(2)}`;
}

export function formatDateTime(isoString: string) {
    const date = new Date(isoString);

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDate(dateString: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateString));
}