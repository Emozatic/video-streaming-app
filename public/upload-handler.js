/**
 * Upload Handler with Progress Bar
 * Handles file uploads with real-time progress tracking
 */

const UploadHandler = {
    // Track active uploads
    activeUploads: new Map(),

    /**
     * Setup upload form with progress tracking
     * @param {string} formSelector - Form selector
     * @param {object} options - Configuration options
     */
    setupForm(formSelector, options = {}) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        const {
            onStart = null,
            onProgress = null,
            onComplete = null,
            onError = null,
            submitButtonSelector = 'button[type="submit"]'
        } = options;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check form validity
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // Prevent double submission
            const submitBtn = form.querySelector(submitButtonSelector);
            if (submitBtn && submitBtn.disabled) {
                return;
            }

            await this.uploadForm(form, {
                onStart,
                onProgress,
                onComplete,
                onError,
                submitButton: submitBtn
            });
        });
    },

    /**
     * Upload form via AJAX
     * @param {HTMLFormElement} form - Form element
     * @param {object} options - Options
     */
    async uploadForm(form, options = {}) {
        const {
            onStart = null,
            onProgress = null,
            onComplete = null,
            onError = null,
            submitButton = null
        } = options;

        try {
            // Disable submit button
            if (submitButton) {
                LoadingSpinner.addToButton(submitButton);
                this.activeUploads.set(form, true);
            }

            // Call start callback
            if (onStart) onStart();

            // Prepare form data
            const formData = new FormData(form);

            // Prepare XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            const uploadId = Date.now();

            // Track upload progress
            if (xhr.upload) {
                const startTime = Date.now();
                let lastTime = startTime;
                let lastLoaded = 0;

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = (event.loaded / event.total) * 100;
                        
                        // Calculate speed
                        const currentTime = Date.now();
                        const timeDiff = currentTime - lastTime;
                        const loadedDiff = event.loaded - lastLoaded;
                        let speed = 0;

                        if (timeDiff > 500) { // Update speed every 500ms
                            speed = NetworkRequest.calculateSpeed(loadedDiff, timeDiff);
                            lastTime = currentTime;
                            lastLoaded = event.loaded;
                        }

                        if (onProgress) {
                            onProgress(percent, speed, event.loaded, event.total);
                        }
                    }
                });
            }

            // Setup request
            xhr.open('POST', form.action || form.method);
            xhr.timeout = 0; // No timeout for uploads

            return new Promise((resolve, reject) => {
                // Success
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200 || xhr.status === 302 || xhr.status === 201) {
                        if (onComplete) onComplete();
                        
                        // Show success toast
                        Toast.success('Success!', 'Upload completed successfully');
                        
                        // Re-enable button
                        if (submitButton) {
                            LoadingSpinner.removeFromButton(submitButton, '🚀 Upload Video');
                            this.activeUploads.delete(form);
                        }

                        // Redirect if needed
                        if (xhr.responseURL && xhr.responseURL !== form.action) {
                            setTimeout(() => {
                                window.location.href = xhr.responseURL;
                            }, 1500);
                        } else {
                            // Reset form
                            form.reset();
                            form.classList.remove('was-validated');
                        }

                        resolve(xhr.response);
                    } else {
                        throw new Error(`Upload failed with status ${xhr.status}`);
                    }
                });

                // Error
                xhr.addEventListener('error', () => {
                    const errorMsg = ErrorHandler.getNetworkErrorMessage(
                        new Error('Upload failed')
                    );
                    
                    if (onError) onError(errorMsg);
                    
                    Toast.error('Upload Failed', errorMsg);
                    
                    if (submitButton) {
                        LoadingSpinner.removeFromButton(submitButton, '🚀 Upload Video');
                        this.activeUploads.delete(form);
                    }

                    reject(new Error(errorMsg));
                });

                // Timeout
                xhr.addEventListener('timeout', () => {
                    const errorMsg = 'Upload timeout. Please check your connection and try again.';
                    
                    if (onError) onError(errorMsg);
                    
                    Toast.error('Upload Timeout', errorMsg);
                    
                    if (submitButton) {
                        LoadingSpinner.removeFromButton(submitButton, '🚀 Upload Video');
                        this.activeUploads.delete(form);
                    }

                    reject(new Error(errorMsg));
                });

                // Abort
                xhr.addEventListener('abort', () => {
                    const errorMsg = 'Upload cancelled';
                    
                    if (onError) onError(errorMsg);
                    
                    Toast.info('Upload', 'Upload cancelled');
                    
                    if (submitButton) {
                        LoadingSpinner.removeFromButton(submitButton, '🚀 Upload Video');
                        this.activeUploads.delete(form);
                    }

                    reject(new Error(errorMsg));
                });

                // Send request
                xhr.send(formData);
            });
        } catch (error) {
            console.error('Upload error:', error);

            const errorMsg = error.message || 'Upload failed. Please try again.';
            if (onError) onError(errorMsg);

            Toast.error('Upload Error', errorMsg);

            if (submitButton) {
                LoadingSpinner.removeFromButton(submitButton, '🚀 Upload Video');
                this.activeUploads.delete(form);
            }
        }
    },

    /**
     * Setup file input with preview
     * @param {string} inputSelector - File input selector
     * @param {string} previewSelector - Preview image selector
     */
    setupFilePreview(inputSelector, previewSelector) {
        const input = document.querySelector(inputSelector);
        const preview = document.querySelector(previewSelector);

        if (!input || !preview) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                Toast.error('Invalid File', 'Please select a valid image file (JPG, PNG, WebP)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Toast.error('File Too Large', 'Image must be smaller than 5MB');
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.style.transition = 'opacity 0.3s ease';
                preview.style.opacity = '1';
            };
            reader.readAsDataURL(file);
        });
    },

    /**
     * Setup video file input with validation
     * @param {string} inputSelector - File input selector
     */
    setupVideoFileInput(inputSelector) {
        const input = document.querySelector(inputSelector);
        if (!input) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            if (!validTypes.includes(file.type)) {
                Toast.error('Invalid Video', 'Please select a valid video file (MP4, WebM, MOV)');
                input.value = '';
                return;
            }

            // Check file size (max 5GB)
            const maxSize = 5 * 1024 * 1024 * 1024;
            if (file.size > maxSize) {
                Toast.error('File Too Large', 'Video must be smaller than 5GB');
                input.value = '';
                return;
            }

            // Show file info
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            Toast.info('Video Selected', `${file.name} (${sizeMB} MB)`);
        });
    },

    /**
     * Cancel upload (if supported by browser)
     * @param {HTMLFormElement} form - Form element
     */
    cancelUpload(form) {
        if (this.activeUploads.has(form)) {
            this.activeUploads.delete(form);
            Toast.info('Cancelled', 'Upload cancelled');
        }
    }
};

/**
 * Initialize upload handlers on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup upload form with progress bar
    const uploadForm = document.querySelector('.upload-form');
    if (uploadForm) {
        // Create progress bar element
        const progressContainer = ProgressBar.create();
        uploadForm.insertBefore(progressContainer, uploadForm.querySelector('.form-actions'));

        UploadHandler.setupForm('.upload-form', {
            onStart: () => {
                console.log('Upload started');
            },
            onProgress: (percent, speed, loaded, total) => {
                ProgressBar.update(progressContainer, percent, speed);
            },
            onComplete: () => {
                ProgressBar.complete(progressContainer);
            },
            onError: (error) => {
                ProgressBar.error(progressContainer, 'Upload failed');
                console.error('Upload error:', error);
            }
        });

        // Setup file previews
        UploadHandler.setupFilePreview('#thumbnail', '#thumbnailPreview');
        UploadHandler.setupVideoFileInput('#url');
    }

    // Setup comment forms (simple submission)
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                LoadingSpinner.addToButton(btn);
            }
        });
    });

    // Setup login/signup forms
    const authForms = document.querySelectorAll('.login-card');
    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                LoadingSpinner.addToButton(btn);
            }
        });
    });

    // Setup edit/delete forms (add confirmation)
    const deleteButtons = document.querySelectorAll('.action-btn.danger');
    deleteButtons.forEach(btn => {
        const originalText = btn.textContent;
        btn.addEventListener('click', (e) => {
            if (!btn.dataset.confirmed) {
                e.preventDefault();
                btn.textContent = 'Confirm Delete?';
                btn.style.backgroundColor = '#ef4444';
                btn.style.color = 'white';
                btn.dataset.confirmed = 'true';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.dataset.confirmed = 'false';
                }, 3000);
            }
        });
    });
});

// Export
if (typeof window !== 'undefined') {
    window.UploadHandler = UploadHandler;
}
