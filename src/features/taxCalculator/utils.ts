/** Formats a number as Philippine peso with 2 decimal places. */
export function fmt(value: number) {
    return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Adds thousand-separator commas to a raw numeric string while preserving
 * a trailing decimal point or partial decimal digits as the user types.
 */
export function formatNumeric(raw: string): string {
    if (!raw) return '';
    const dotIdx = raw.indexOf('.');
    const intPart = dotIdx >= 0 ? raw.slice(0, dotIdx) : raw;
    const decPart = dotIdx >= 0 ? raw.slice(dotIdx) : '';
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedInt + decPart;
}

/**
 * Strips commas from a displayed string and returns the raw numeric string,
 * or null if the value contains non-numeric characters.
 */
export function parseRaw(displayed: string): string {
    const stripped = displayed.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(stripped) ? stripped : null!;
}
