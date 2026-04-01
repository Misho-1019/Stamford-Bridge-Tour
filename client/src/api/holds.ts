import type { CreateHoldRequest, CreateHoldResponse } from "../types/hold";
import { apiFetch } from "./client";

export function createHold(body: CreateHoldRequest) {
    return apiFetch<CreateHoldResponse>('/holds', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}