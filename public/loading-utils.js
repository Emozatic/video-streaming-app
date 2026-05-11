/**
 * Loading UX Utilities
 * Handles spinners, toasts, skeletons, and loading states
 */

// ========================================
// SPINNER UTILITIES
// ========================================

const LoadingSpinner = {
    /**
     * Show full-screen loading spinner
     * @param {string} message - Optional loading message
     */
    show(message = 'Loading...') {
        let overlay = document.getElementById('spinner-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'spinner-overlay';
            overlay.className = 'spinner-overlay';
            overlay.innerHTML = `
                <div class="spinner-content">
                    <div class="spinner medium"></div>
                    <div class="spinner-message">${message}</div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.classList.remove('hidden');
            overlay.querySelector('.spinner-message').textContent = message;
        }
    },

    /**
     * Hide full-screen loading spinner
     */
    hide() {
        const overlay = document.getElementById('spinner-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    /**
     * Add spinner to a button
     * @param {HTMLElement} button - Button element
     */
    addToButton(button) {
        if (!button) return;
        
        button.classList.add('btn-loading');
        button.disabled = true;
        
        const text = button.textContent;
        button.innerHTML = `
            <span class="btn-text">${text}</span>
            <div class="spinner small"></div>
        `;
    },

    /**
     * Remove spinner from button
     * @param {HTMLElement} button - Button element
     * @param {string} text - Button text to restore
     */
    removeFromButton(button, text = null) {
        if (!button) return;
        
        button.classList.remove('btn-loading');
        button.disabled = false;
        button.textContent = text || button.querySelector('.btn-text')?.textContent || 'Submit';
    }
};

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================

const Toast = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type: success, error, info
     * @param {number} duration - Duration in ms (0 = no auto-close)
     */
    show(title, message, type = 'info', duration = 5000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon ${type}">${iconMap[type] || '•'}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        this.container.appendChild(toast);

        // Force animation trigger
        toast.offsetHeight;

        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    },

    /**
     * Remove toast with animation
     * @param {HTMLElement} toast - Toast element
     */
    remove(toast) {
        if (!toast.parentElement) return;

        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    /**
     * Show success toast
     */
    success(title, message, duration = 5000) {
        return this.show(title, message, 'success', duration);
    },

    /**
     * Show error toast
     */
    error(title, message, duration = 7000) {
        return this.show(title, message, 'error', duration);
    },

    /**
     * Show info toast
     */
    info(title, message, duration = 5000) {
        return this.show(title, message, 'info', duration);
    }
};

// ========================================
// SKELETON LOADER UTILITIES
// ========================================

const SkeletonLoader = {
    /**
     * Create a video card skeleton
     * @returns {HTMLElement}
     */
    createVideoCardSkeleton() {
        const div = document.createElement('div');
        div.className = 'skeleton-video-card';
        div.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-video-card-content">
                <div class="skeleton-video-card-title skeleton-loader"></div>
                <div class="skeleton-video-card-desc skeleton-loader"></div>
            </div>
        `;
        return div;
    },

    /**
     * Create multiple video card skeletons
     * @param {number} count - Number of skeletons
     * @returns {HTMLElement}
     */
    createVideoGrid(count = 6) {
        const container = document.createElement('div');
        container.className = 'video-grid';
        
        for (let i = 0; i < count; i++) {
            container.appendChild(this.createVideoCardSkeleton());
        }
        
        return container;
    },

    /**
     * Create a comment skeleton
     * @returns {HTMLElement}
     */
    createCommentSkeleton() {
        const div = document.createElement('div');
        div.className = 'skeleton-comment';
        div.innerHTML = `
            <div class="skeleton-avatar skeleton-loader"></div>
            <div class="skeleton-comment-content">
                <div class="skeleton-comment-author skeleton-loader"></div>
                <div class="skeleton-comment-text skeleton-loader"></div>
                <div class="skeleton-comment-text skeleton-loader" style="width: 70%;"></div>
            </div>
        `;
        return div;
    },

    /**
     * Create multiple comment skeletons
     * @param {number} count - Number of skeletons
     * @returns {HTMLElement}
     */
    createCommentList(count = 3) {
        const container = document.createElement('div');
        
        for (let i = 0; i < count; i++) {
            container.appendChild(this.createCommentSkeleton());
        }
        
        return container;
    },

    /**
     * Show skeletons in a container
     * @param {HTMLElement} container - Container element
     * @param {number} count - Number of skeletons
     * @param {string} type - Skeleton type: 'videos', 'comments'
     */
    show(container, count = 6, type = 'videos') {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (type === 'videos') {
            container.appendChild(this.createVideoGrid(count));
        } else if (type === 'comments') {
            container.appendChild(this.createCommentList(count));
        }
    },

    /**
     * Hide skeletons from a container
     * @param {HTMLElement} container - Container element
     */
    hide(container) {
        if (!container) return;
        
        const skeletons = container.querySelectorAll('.skeleton-loader, .skeleton-video-card, .skeleton-comment');
        skeletons.forEach(skeleton => {
            skeleton.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (skeleton.parentElement) {
                    skeleton.parentElement.removeChild(skeleton);
                }
            }, 300);
        });
    }
};

// ========================================
// PROGRESS BAR UTILITIES
// ========================================

const ProgressBar = {
    /**
     * Create progress bar element
     * @returns {HTMLElement}
     */
    create() {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.innerHTML = `
            <div class="progress-bar" style="width: 0%"></div>
            <div class="progress-info">
                <span class="progress-label">Uploading...</span>
                <div>
                    <span class="progress-percent">0%</span>
                    <div class="progress-speed"></div>
                </div>
            </div>
        `;
        return container;
    },

    /**
     * Update progress bar
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} percent - Progress percentage (0-100)
     * @param {number} speed - Upload speed in MB/s
     */
    update(progressBar, percent, speed = null) {
        if (!progressBar) return;
        
        const fill = progressBar.querySelector('.progress-bar');
        const percentEl = progressBar.querySelector('.progress-percent');
        const speedEl = progressBar.querySelector('.progress-speed');
        
        if (fill) {
            fill.style.width = Math.min(percent, 100) + '%';
        }
        
        if (percentEl) {
            percentEl.textContent = Math.min(Math.round(percent), 100) + '%';
        }
        
        if (speed && speedEl) {
            speedEl.textContent = `${speed.toFixed(2)} MB/s`;
        }
    },

    /**
     * Complete progress bar
     * @param {HTMLElement} progressBar - Progress bar element
     */
    complete(progressBar) {
        this.update(progressBar, 100);
        const label = progressBar.querySelector('.progress-label');
        if (label) {
            label.textContent = 'Upload complete!';
        }
    },

    /**
     * Show error state
     * @param {HTMLElement} progressBar - Progress bar element
     */
    error(progressBar, message = 'Upload failed') {
        const label = progressBar.querySelector('.progress-label');
        if (label) {
            label.textContent = message;
            label.style.color = '#ef4444';
        }
    }
};

// ========================================
// LAZY LOADING IMAGES
// ========================================

const LazyLoadImages = {
    /**
     * Initialize lazy loading for images
     */
    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img.lazy').forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }
};

// ========================================
// NETWORK REQUEST UTILITIES
// ========================================

const NetworkRequest = {
    /**
     * Fetch with timeout
     * @param {string} url - Request URL
     * @param {object} options - Fetch options
     * @param {number} timeout - Timeout in ms
     * @returns {Promise}
     */
    async fetchWithTimeout(url, options = {}, timeout = 30000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },

    /**
     * Calculate upload speed
     * @param {number} uploadedBytes - Bytes uploaded
     * @param {number} elapsedTime - Time in ms
     * @returns {number} Speed in MB/s
     */
    calculateSpeed(uploadedBytes, elapsedTime) {
        if (elapsedTime === 0) return 0;
        const bytes = uploadedBytes;
        const seconds = elapsedTime / 1000;
        const megabytes = bytes / (1024 * 1024);
        return megabytes / seconds;
    }
};

// ========================================
// ERROR HANDLING
// ========================================

const ErrorHandler = {
    /**
     * Show error with retry option
     * @param {string} message - Error message
     * @param {function} retryCallback - Callback for retry button
     */
    showWithRetry(message, retryCallback) {
        const toast = Toast.error('Error', message);
        
        const retryBtn = document.createElement('button');
        retryBtn.className = 'toast-retry-btn';
        retryBtn.textContent = 'Retry';
        retryBtn.style.cssText = `
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 0.4rem;
            cursor: pointer;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        `;

        retryBtn.addEventListener('click', () => {
            Toast.remove(toast);
            retryCallback();
        });

        toast.querySelector('.toast-content').appendChild(retryBtn);
    },

    /**
     * Handle network error
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getNetworkErrorMessage(error) {
        if (error.message === 'Request timeout') {
            return 'Request timed out. Please check your connection and try again.';
        }
        if (!navigator.onLine) {
            return 'No internet connection. Please check your network.';
        }
        return 'Network error. Please try again later.';
    }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
    LazyLoadImages.init();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.LoadingSpinner = LoadingSpinner;
    window.Toast = Toast;
    window.SkeletonLoader = SkeletonLoader;
    window.ProgressBar = ProgressBar;
    window.LazyLoadImages = LazyLoadImages;
    window.NetworkRequest = NetworkRequest;
    window.ErrorHandler = ErrorHandler;
}
