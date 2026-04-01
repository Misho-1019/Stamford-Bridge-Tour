import type { SlotsResponse } from "../types/slot";
import { apiFetch } from "./client";

export function getSlots(date: string) {
    return apiFetch<SlotsResponse>(`/slots?date=${date}`);
}