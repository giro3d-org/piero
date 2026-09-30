/**
 * Formats a string for easier search by removing any diacritics, accents, squiggles etc. and converting it to lowercase.
 * @param str - the string to format
 * @returns the formatted string
 */
export function formatForSearch(str: string): string {
    return str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
}
