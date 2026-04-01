export type Slot = {
    id: string;
    startAt: string;
    endAt: string;
    capacityTotal: number;
    remainingSeats: number;
};

export type SlotsResponse = {
    blocked: boolean;
    reason?: string;
    slots: Slot[];
};