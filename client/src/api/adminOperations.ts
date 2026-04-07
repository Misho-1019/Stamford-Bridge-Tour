import { apiFetch } from "./client";

type GenerateSlotsResponse = {
    message?: string;
    createdCount?: number;
    skippedCount?: number;
};

type SyncBlackoutResponse = {
    provider: string;
    createdCount?: number;
    updatedCount?: number;
    skippedCount?: number;
    totalFixtures?: number;
}

export function generateAdminSlots(days: number) {
    return apiFetch<GenerateSlotsResponse>(`/admin/slots/generate?days=${days}`, {
        method: 'POST',
    })
}

export function syncAdminBlackouts(daysAhead: number) {
    return apiFetch<SyncBlackoutResponse>(`/admin/blackouts/sync?daysAhead=${daysAhead}`, {
        method: 'POST',
    })
}