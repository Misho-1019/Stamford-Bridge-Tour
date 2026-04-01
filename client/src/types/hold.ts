export type HoldItemInput = {
    ticketTypeId: string;
    qty: number;
};

export type CreateHoldRequest = {
    slotId: string;
    email: string;
    items: HoldItemInput[];
};

export type CreateHoldResponse = {
    holdId: string;
    checkoutUrl: string;
};