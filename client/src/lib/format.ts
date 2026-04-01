export function formatPrice(priceCents: number) {
    return `£${(priceCents / 100).toFixed(2)}`;
}