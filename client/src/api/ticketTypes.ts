import type { TicketType } from "../types/ticket";
import { apiFetch } from "./client";

export function getTicketTypes() {
    return apiFetch<TicketType[]>('/ticket-types');
}