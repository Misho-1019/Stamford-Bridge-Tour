import { DateTime } from "luxon";

const REPORT_TIMEZONE = 'Europe/London';

export function parseFromDate(raw?: string) {
    if (!raw) return undefined;

    return DateTime.fromISO(raw, { zone: REPORT_TIMEZONE })
        .startOf('day')
        .toUTC()
        .toJSDate();
}

export function parseToDate(raw?: string) {
    if (!raw) return undefined;

    return DateTime.fromISO(raw, { zone: REPORT_TIMEZONE })
        .endOf('day')
        .toUTC()
        .toJSDate();
}