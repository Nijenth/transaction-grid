import { fetchTransactions } from './apiService.js';

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {number} amount
 * @property {string} currency
 * @property {string} status
 * @property {string} date
 */

export class TransactionDataTable {
    /**
     * Creates an instance of TransactionDataTable.
     * @param {HTMLElement} mountPoint - The DOM element to mount the component to.
     */
    constructor(mountPoint) {
        if (!mountPoint) {
            throw new Error('A valid DOM element must be provided to mount the TransactionDataTable.');
        }

        this.mountPoint = mountPoint;
        /** @type {Transaction[]} */
        this.data = [];
        /** @type {Transaction[]} */
        this.filteredData = [];
        this.isLoading = false;
        this.error = null;
        this.searchTerm = '';
        
        this.init();
    }

    /**
     * Initializes the component.
     */
    init() {
        this.renderBase();
        this.setupListeners();
        this.loadData();
    }

    /**
     * Renders the base structure of the component.
     */
    renderBase() {
        this.mountPoint.innerHTML = `
            <div class="transaction-container">
                <div class="sr-only" aria-live="polite" id="a11y-announcer"></div>
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Search transactions..." 
                    aria-label="Search transactions"
                />
                <div class="table-wrapper">
                    <div class="data-grid" role="table" aria-label="Transactions">
                        <div class="grid-header" role="row">
                            <div class="grid-cell" role="columnheader">ID</div>
                            <div class="grid-cell" role="columnheader">Amount</div>
                            <div class="grid-cell" role="columnheader">Currency</div>
                            <div class="grid-cell" role="columnheader">Status</div>
                            <div class="grid-cell" role="columnheader">Date</div>
                        </div>
                        <div id="grid-body" role="rowgroup">
                            <!-- Rows will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.gridBody = this.mountPoint.querySelector('#grid-body');
        this.searchInput = this.mountPoint.querySelector('.search-input');
        this.announcer = this.mountPoint.querySelector('#a11y-announcer');
    }

    /**
     * Sets up event listeners, including the debounced search.
     */
    setupListeners() {
        let debounceTimer;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300); // 300ms debounce
        });
    }

    /**
     * Handles search input to filter data locally.
     * @param {string} term - The search term.
     */
    handleSearch(term) {
        this.searchTerm = term.trim().toLowerCase();
        
        if (!this.searchTerm) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(txn => {
                return txn.id.toLowerCase().includes(this.searchTerm) ||
                       txn.status.toLowerCase().includes(this.searchTerm) ||
                       txn.currency.toLowerCase().includes(this.searchTerm) ||
                       txn.amount.toString().includes(this.searchTerm);
            });
        }
        
        this.renderData();
        this.announce(`Showing ${this.filteredData.length} results for ${this.searchTerm || 'all transactions'}`);
    }

    /**
     * Fetches data using the API service and manages state.
     */
    async loadData() {
        this.isLoading = true;
        this.error = null;
        this.renderState();
        this.announce("Loading transactions");

        try {
            const response = await fetchTransactions();
            if (response && response.status === 'success' && Array.isArray(response.data)) {
                this.data = response.data;
                // Re-apply search term if it exists
                this.handleSearch(this.searchTerm);
            } else {
                throw new Error("Invalid data format received from API.");
            }
        } catch (err) {
            this.error = err;
            this.renderState();
            this.announce("Error loading transactions. Please try again.");
        } finally {
            this.isLoading = false;
            // State is updated within try/catch blocks where needed
            if (!this.error) {
                this.announce("Transactions loaded successfully");
                this.renderState();
            }
        }
    }

    /**
     * Renders loading, error, or data based on current state.
     */
    renderState() {
        if (this.isLoading) {
            this.renderSkeleton();
        } else if (this.error) {
            this.renderError();
        } else {
            this.renderData();
        }
    }

    /**
     * Renders the skeleton loader.
     */
    renderSkeleton() {
        let skeletonHTML = '';
        for (let i = 0; i < 5; i++) {
            skeletonHTML += `
                <div class="grid-row" role="row">
                    <div class="grid-cell" role="cell"><div class="skeleton"></div></div>
                    <div class="grid-cell" role="cell"><div class="skeleton"></div></div>
                    <div class="grid-cell" role="cell"><div class="skeleton"></div></div>
                    <div class="grid-cell" role="cell"><div class="skeleton"></div></div>
                    <div class="grid-cell" role="cell"><div class="skeleton"></div></div>
                </div>
            `;
        }
        this.gridBody.innerHTML = skeletonHTML;
    }

    /**
     * Renders the error UI.
     */
    renderError() {
        this.gridBody.innerHTML = `
            <div style="grid-column: 1 / -1;">
                <div class="error-container" role="alert">
                    <p>Failed to load transactions. Please try again.</p>
                    <button class="retry-button" id="retry-btn">Retry</button>
                </div>
            </div>
        `;
        const retryBtn = this.mountPoint.querySelector('#retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadData());
        }
    }

    /**
     * Renders the actual data rows. Uses document fragment for DOM efficiency.
     */
    renderData() {
        // Clear current content
        this.gridBody.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            this.gridBody.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #64748b;">
                    No transactions found.
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        this.filteredData.forEach(txn => {
            const row = document.createElement('div');
            row.className = 'grid-row';
            row.setAttribute('role', 'row');
            // Make row focusable for keyboard accessibility
            row.setAttribute('tabindex', '0');
            
            // Format date safely
            let dateStr = txn.date;
            try {
                dateStr = new Date(txn.date).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch(e) {} // Fallback to raw string if parsing fails

            // Format amount
            const amountStr = new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: txn.currency || 'USD' 
            }).format(txn.amount);

            row.innerHTML = `
                <div class="grid-cell" role="cell">${this.escapeHTML(txn.id)}</div>
                <div class="grid-cell" role="cell">${this.escapeHTML(amountStr)}</div>
                <div class="grid-cell" role="cell">${this.escapeHTML(txn.currency)}</div>
                <div class="grid-cell" role="cell" style="text-transform: capitalize;">${this.escapeHTML(txn.status)}</div>
                <div class="grid-cell" role="cell">${this.escapeHTML(dateStr)}</div>
            `;
            
            // Support 'Enter'/'Space' to interact with row
            row.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('Interacted with transaction:', txn.id);
                }
            });

            fragment.appendChild(row);
        });

        this.gridBody.appendChild(fragment);
    }

    /**
     * Updates the aria-live region for screen readers.
     * @param {string} message - Message to announce.
     */
    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }

    /**
     * Basic HTML escaping to prevent XSS.
     * @param {string|number} str - Value to escape.
     * @returns {string} Escaped string.
     */
    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }
}
