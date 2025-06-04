export const normalizeText = (input: string) => {
    return input
        .normalize("NFD") // Decompose combined characters (e.g., "é" → "é")
        .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
};