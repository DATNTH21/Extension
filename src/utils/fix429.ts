const maxRetries = 5;
const initialDelay = 1000;

export async function retryOn429<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let delay = initialDelay;

    while (attempt < maxRetries) {
        try {
            return await fn(); // Attempt the operation
        } catch (error: any) {
            if (error.response?.status === 429) {
                attempt++;
                console.warn(`429 Too Many Requests. Retrying ${attempt} of ${maxRetries}...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 5; // Exponential backoff
            } else {
                throw error; // Rethrow non-429 errors
            }
        }
    }

    throw new Error("Max retries exceeded for 429 Too Many Requests.");
}
