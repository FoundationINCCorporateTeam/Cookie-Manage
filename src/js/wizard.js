/**
 * Setup Wizard JavaScript
 * 
 * Handles the step-by-step configuration wizard for the CMP
 */

(function() {
    'use strict';
    
    const Wizard = {
        currentStep: 1,
        totalSteps: 5,
        config: {
            jurisdiction: 'gdpr',
            categories: {
                necessary: true,
                preferences: true,
                analytics: true,
                marketing: true
            },
            layout: 'popup',
            texts: {
                title: 'We value your privacy',
                description: 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.'
            },
            theme: {
                backgroundColor: '#ffffff',
                textColor: '#333333',
                primaryColor: '#4F46E5',
                borderRadius: '8px'
            }
        },
        
        /**
         * Initialize wizard
         */
        init: function() {
            console.log('Wizard: Initializing');
            this.setupEventListeners();
            this.updatePreview();
        },
        
        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Jurisdiction selection
            document.querySelectorAll('input[name="jurisdiction"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.config.jurisdiction = e.target.value;
                });
            });
            
            // Category toggles
            ['preferences', 'analytics', 'marketing'].forEach(cat => {
                const checkbox = document.getElementById('cat-' + cat);
                if (checkbox) {
                    checkbox.addEventListener('change', (e) => {
                        this.config.categories[cat] = e.target.checked;
                    });
                }
            });
            
            // Layout selection
            document.querySelectorAll('input[name="layout"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.config.layout = e.target.value;
                    this.updatePreview();
                });
            });
            
            // Text customization
            const titleInput = document.getElementById('text-title');
            if (titleInput) {
                titleInput.addEventListener('input', (e) => {
                    this.config.texts.title = e.target.value;
                    this.updatePreview();
                });
            }
            
            const descInput = document.getElementById('text-description');
            if (descInput) {
                descInput.addEventListener('input', (e) => {
                    this.config.texts.description = e.target.value;
                    this.updatePreview();
                });
            }
            
            // Color customization
            const bgColor = document.getElementById('color-bg');
            if (bgColor) {
                bgColor.addEventListener('input', (e) => {
                    this.config.theme.backgroundColor = e.target.value;
                    this.updatePreview();
                });
            }
            
            const textColor = document.getElementById('color-text');
            if (textColor) {
                textColor.addEventListener('input', (e) => {
                    this.config.theme.textColor = e.target.value;
                    this.updatePreview();
                });
            }
            
            const primaryColor = document.getElementById('color-primary');
            if (primaryColor) {
                primaryColor.addEventListener('input', (e) => {
                    this.config.theme.primaryColor = e.target.value;
                    this.updatePreview();
                });
            }
            
            const borderRadius = document.getElementById('border-radius');
            if (borderRadius) {
                borderRadius.addEventListener('change', (e) => {
                    this.config.theme.borderRadius = e.target.value;
                    this.updatePreview();
                });
            }
        },
        
        /**
         * Update live preview
         */
        updatePreview: function() {
            const banner = document.getElementById('preview-banner');
            const title = document.getElementById('preview-title');
            const description = document.getElementById('preview-description');
            const button = document.getElementById('preview-btn');
            
            if (banner) {
                banner.style.backgroundColor = this.config.theme.backgroundColor;
                banner.style.color = this.config.theme.textColor;
                banner.style.borderRadius = this.config.theme.borderRadius;
            }
            
            if (title) {
                title.textContent = this.config.texts.title;
            }
            
            if (description) {
                description.textContent = this.config.texts.description;
            }
            
            if (button) {
                button.style.backgroundColor = this.config.theme.primaryColor;
                button.style.borderRadius = this.config.theme.borderRadius;
            }
        },
        
        /**
         * Go to next step
         */
        nextStep: function() {
            if (this.currentStep >= this.totalSteps) {
                return;
            }
            
            // Mark current step as completed
            this.markStepCompleted(this.currentStep);
            
            // Hide current step
            document.getElementById('step-' + this.currentStep).classList.remove('active');
            
            // Move to next step
            this.currentStep++;
            
            // Show next step
            document.getElementById('step-' + this.currentStep).classList.add('active');
            
            // Update step indicator
            this.updateStepIndicators();
            
            // Update buttons
            this.updateButtons();
            
            // Update review if on last step
            if (this.currentStep === this.totalSteps) {
                this.updateReview();
            }
        },
        
        /**
         * Go to previous step
         */
        previousStep: function() {
            if (this.currentStep <= 1) {
                return;
            }
            
            // Hide current step
            document.getElementById('step-' + this.currentStep).classList.remove('active');
            
            // Move to previous step
            this.currentStep--;
            
            // Show previous step
            document.getElementById('step-' + this.currentStep).classList.add('active');
            
            // Update step indicator
            this.updateStepIndicators();
            
            // Update buttons
            this.updateButtons();
        },
        
        /**
         * Mark step as completed
         */
        markStepCompleted: function(stepNum) {
            const indicator = document.getElementById('step-' + stepNum + '-indicator');
            if (indicator) {
                indicator.classList.add('completed');
            }
        },
        
        /**
         * Update step indicators
         */
        updateStepIndicators: function() {
            for (let i = 1; i <= this.totalSteps; i++) {
                const indicator = document.getElementById('step-' + i + '-indicator');
                const circle = indicator.querySelector('div');
                
                if (i === this.currentStep) {
                    indicator.classList.add('active');
                    circle.classList.remove('bg-gray-300', 'bg-green-500');
                    circle.classList.add('bg-indigo-600');
                } else if (i < this.currentStep) {
                    indicator.classList.add('completed');
                    circle.classList.remove('bg-gray-300', 'bg-indigo-600');
                    circle.classList.add('bg-green-500');
                } else {
                    indicator.classList.remove('active', 'completed');
                    circle.classList.remove('bg-indigo-600', 'bg-green-500');
                    circle.classList.add('bg-gray-300');
                }
            }
        },
        
        /**
         * Update navigation buttons
         */
        updateButtons: function() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const publishBtn = document.getElementById('publish-btn');
            
            // Enable/disable previous button
            prevBtn.disabled = this.currentStep === 1;
            
            // Show/hide next and publish buttons
            if (this.currentStep === this.totalSteps) {
                nextBtn.classList.add('hidden');
                publishBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                publishBtn.classList.add('hidden');
            }
        },
        
        /**
         * Update review summary
         */
        updateReview: function() {
            // Jurisdiction
            const jurisdictionText = {
                'gdpr': 'GDPR (EU)',
                'ccpa': 'CCPA (California)',
                'custom': 'Custom'
            };
            document.getElementById('review-jurisdiction').textContent = jurisdictionText[this.config.jurisdiction];
            
            // Layout
            const layoutText = {
                'popup': 'Popup (Bottom-Right)',
                'bottom-full': 'Bottom Full Width',
                'top-full': 'Top Full Width',
                'bottom-left': 'Bottom-Left Card'
            };
            document.getElementById('review-layout').textContent = layoutText[this.config.layout];
            
            // Categories
            const enabledCategories = Object.values(this.config.categories).filter(v => v).length;
            document.getElementById('review-categories').textContent = enabledCategories + ' enabled';
        },
        
        /**
         * Publish configuration
         */
        publish: async function() {
            try {
                // Show loading state
                const publishBtn = document.getElementById('publish-btn');
                const originalText = publishBtn.textContent;
                publishBtn.textContent = 'Publishing...';
                publishBtn.disabled = true;
                
                // Prepare configuration
                const configData = {
                    widget: {
                        version: '1.0.0',
                        hash: this.generateHash(),
                        layout: this.config.layout,
                        texts: {
                            title: this.config.texts.title,
                            description: this.config.texts.description,
                            acceptAll: 'Accept All',
                            rejectAll: 'Reject All',
                            customize: 'Customize',
                            savePreferences: 'Save Preferences'
                        },
                        theme: this.config.theme,
                        behavior: {
                            showOnLoad: true,
                            respectDoNotTrack: false,
                            autoHideAfter: 0,
                            animation: 'fade'
                        }
                    },
                    preferenceCenter: {
                        version: '1.0.0',
                        layout: 'popup',
                        texts: {
                            title: 'Cookie Preferences',
                            description: 'Manage your cookie preferences below.',
                            save: 'Save Preferences',
                            cancel: 'Cancel'
                        },
                        categories: {
                            necessary: {
                                name: 'Strictly Necessary',
                                description: 'Essential cookies for the website to function.',
                                enabled: true,
                                locked: true
                            },
                            preferences: {
                                name: 'Preference Cookies',
                                description: 'Remember your preferences and settings.',
                                enabled: this.config.categories.preferences,
                                locked: false
                            },
                            analytics: {
                                name: 'Analytics Cookies',
                                description: 'Help us understand how visitors use our website.',
                                enabled: this.config.categories.analytics,
                                locked: false
                            },
                            marketing: {
                                name: 'Marketing Cookies',
                                description: 'Track visitors to display relevant advertisements.',
                                enabled: this.config.categories.marketing,
                                locked: false
                            }
                        }
                    },
                    wizard: {
                        version: '1.0.0',
                        completed: true,
                        currentStep: this.totalSteps,
                        steps: {
                            jurisdiction: {
                                selected: this.config.jurisdiction
                            },
                            categories: this.config.categories,
                            bannerLayout: this.config.layout,
                            preferenceCenterLayout: 'popup',
                            customization: {
                                texts: this.config.texts,
                                theme: this.config.theme
                            }
                        }
                    }
                };
                
                // Save configuration
                const response = await fetch('/api/admin/save-config.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(configData)
                });
                
                if (response.ok) {
                    alert('Configuration published successfully! Your widget is now live.');
                    window.location.href = '/admin/index.html';
                } else {
                    throw new Error('Failed to save configuration');
                }
            } catch (error) {
                console.error('Failed to publish configuration:', error);
                alert('Failed to publish configuration. Please try again.');
                
                // Reset button
                const publishBtn = document.getElementById('publish-btn');
                publishBtn.textContent = 'Publish Configuration';
                publishBtn.disabled = false;
            }
        },
        
        /**
         * Generate configuration hash
         */
        generateHash: function() {
            const str = JSON.stringify(this.config);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        }
    };
    
    // Global functions for onclick handlers
    window.nextStep = function() {
        Wizard.nextStep();
    };
    
    window.previousStep = function() {
        Wizard.previousStep();
    };
    
    window.publishConfig = function() {
        Wizard.publish();
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Wizard.init());
    } else {
        Wizard.init();
    }
    
})();
