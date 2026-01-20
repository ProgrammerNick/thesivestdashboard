/**
 * Utility for retrying Gemini API calls with exponential backoff
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
}

/**
 * Retry a Gemini API call with exponential backoff for 503 errors
 */
export async function retryGeminiCall<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 10000,
        backoffMultiplier = 2,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Check if it's a 503 error
            const errorMessage = lastError.message.toLowerCase();
            const is503 = errorMessage.includes('503') ||
                errorMessage.includes('overloaded') ||
                errorMessage.includes('unavailable');

            // If it's the last attempt or not a retryable error, throw
            if (attempt === maxRetries || !is503) {
                throw lastError;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                initialDelayMs * Math.pow(backoffMultiplier, attempt),
                maxDelayMs
            );

            console.log(
                `Gemini API error (attempt ${attempt + 1}/${maxRetries + 1}). ` +
                `Retrying in ${delay}ms...`
            );

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Retry failed');
}
