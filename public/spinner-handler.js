/**
 * Spinner Handler for Various Actions
 * Handles spinners for API calls, comments, form submissions, etc.
 */

const SpinnerHandler = {
    /**
     * Add spinner to action button
     * @param {HTMLElement} button - Button element
     * @param {string} loadingText - Text to show while loading
     */
    addToButton(button, loadingText = 'Loading...') {
        if (!button) return;

        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-inline">
                <span class="spinner small"></span>
                <span>${loadingText}</span>
            </span>
        `;
        button.style.opacity = '0.7';
    },

    /**
     * Remove spinner from button
     * @param {HTMLElement} button - Button element
     */
    removeFromButton(button) {
        if (!button) return;

        const originalText = button.dataset.originalText || button.textContent;
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    },

    /**
     * Handle comment submission with spinner
     */
    setupCommentSubmit() {
        const commentForms = document.querySelectorAll('.comment-form');

        commentForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = form.querySelector('button[type="submit"]');
                if (!submitBtn || submitBtn.disabled) return;

                try {
                    this.addToButton(submitBtn, 'Posting...');

                    // Get form data
                    const formData = new FormData(form);
                    const response = await NetworkRequest.fetchWithTimeout(
                        form.action,
                        {
                            method: 'POST',
                            body: formData
                        },
                        10000
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Success
                    Toast.success('Success!', 'Comment posted successfully');
                    form.reset();

                    // Reload comments after 1 second
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } catch (error) {
                    console.error('Comment error:', error);
                    const errorMsg = ErrorHandler.getNetworkErrorMessage(error);
                    ErrorHandler.showWithRetry(errorMsg, () => {
                        form.dispatchEvent(new Event('submit'));
                    });
                } finally {
                    this.removeFromButton(submitBtn);
                }
            });
        });
    },

    /**
     * Handle delete button actions
     */
    setupDeleteActions() {
        const deleteButtons = document.querySelectorAll('.action-btn.danger');

        deleteButtons.forEach(btn => {
            const originalText = btn.textContent;
            let confirmTimeout = null;

            btn.addEventListener('click', async (e) => {
                if (!btn.classList.contains('confirmed')) {
                    e.preventDefault();
                    
                    // Show confirmation state
                    btn.classList.add('confirmed');
                    btn.textContent = 'Confirm Delete?';
                    btn.style.opacity = '0.8';

                    // Reset after 3 seconds
                    confirmTimeout = setTimeout(() => {
                        btn.classList.remove('confirmed');
                        btn.textContent = originalText;
                        btn.style.opacity = '1';
                    }, 3000);
                } else {
                    // Clear timeout and proceed with deletion
                    clearTimeout(confirmTimeout);
                    
                    e.preventDefault();
                    
                    const form = btn.closest('form');
                    if (!form) return;

                    try {
                        this.addToButton(btn, 'Deleting...');

                        const response = await NetworkRequest.fetchWithTimeout(
                            form.action,
                            {
                                method: form.method || 'POST',
                                body: new FormData(form)
                            },
                            10000
                        );

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        Toast.success('Deleted!', 'Item deleted successfully');

                        // Redirect after 1 second
                        setTimeout(() => {
                            window.location.href = '/home';
                        }, 1000);
                    } catch (error) {
                        console.error('Delete error:', error);
                        this.removeFromButton(btn);
                        const errorMsg = ErrorHandler.getNetworkErrorMessage(error);
                        ErrorHandler.showWithRetry(errorMsg, () => {
                            btn.click();
                        });
                    }
                }
            });
        });
    },

    /**
     * Handle edit button navigation
     */
    setupEditActions() {
        const editButtons = document.querySelectorAll('.action-btn:not(.danger)');

        editButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const form = btn.closest('form');
                if (!form) return;

                e.preventDefault();
                this.addToButton(btn, 'Loading...');

                try {
                    // Navigate to edit page
                    setTimeout(() => {
                        form.submit();
                    }, 300);
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.removeFromButton(btn);
                }
            });
        });
    },

    /**
     * Handle login/signup form submission
     */
    setupAuthSubmit() {
        const authForms = document.querySelectorAll('.login-card');

        authForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                // Allow normal form submission but add visual feedback
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    this.addToButton(submitBtn, 'Please wait...');
                }
            });
        });
    },

    /**
     * Add loading state to link clicks
     */
    setupLinkLoading() {
        // Don't add spinners to navigation links as page will change
        // This is just a placeholder for future use
    },

    /**
     * Simulate data fetching with skeleton and spinner
     * @param {string} containerSelector - Container selector
     * @param {function} fetchFunction - Async function to fetch data
     * @param {object} options - Options
     */
    async fetchWithUI(containerSelector, fetchFunction, options = {}) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const {
            type = 'videos',
            count = 6,
            timeout = 30000
        } = options;

        try {
            // Show skeleton
            SkeletonLoader.show(container, count, type);

            // Fetch data
            const data = await fetchFunction();

            // Hide skeleton (will be replaced by actual content)
            SkeletonLoader.hide(container);

            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            
            container.innerHTML = '';
            
            const errorEl = document.createElement('div');
            errorEl.style.cssText = `
                padding: 2rem;
                text-align: center;
                color: #cbd5e1;
            `;
            errorEl.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Failed to load content</h3>
                <p>${error.message || 'Please try again later'}</p>
                <button class="retry-btn" style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.7rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    margin-top: 1rem;
                    font-size: 1rem;
                ">Retry</button>
            `;

            container.appendChild(errorEl);

            const retryBtn = errorEl.querySelector('.retry-btn');
            retryBtn.addEventListener('click', () => {
                this.fetchWithUI(containerSelector, fetchFunction, options);
            });

            throw error;
        }
    }
};

/**
 * Initialize all spinner handlers on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup comment submissions
    SpinnerHandler.setupCommentSubmit();

    // Setup delete actions
    SpinnerHandler.setupDeleteActions();

    // Setup edit actions
    SpinnerHandler.setupEditActions();

    // Setup auth forms
    SpinnerHandler.setupAuthSubmit();

    // Setup link loading
    SpinnerHandler.setupLinkLoading();
});

// Export
if (typeof window !== 'undefined') {
    window.SpinnerHandler = SpinnerHandler;
}
