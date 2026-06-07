import { apiFetch } from "./client";

type JoinWaitlistResponse = {
    message: string;
};

export function joinWaitlist(slotId: string, email: string) {
    return apiFetch<JoinWaitlistResponse>(`/waitlist/${slotId}`, {
        method: 'POST',
        body: JSON.stringify({ email }),
    })
}
