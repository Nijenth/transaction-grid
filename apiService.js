/**
 * Service to handle API requests for transactions.
 */

/**
 * Fetches transaction data from the API.
 * @returns {Promise<{status: string, data: Array<{id: string, amount: number, currency: string, status: string, date: string}>}>}
 */
export async function fetchTransactions() {
    const response = await fetch('/api/v1/transactions');
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}
