/**
 * CMP Preference Center Module
 * 
 * Provides a detailed preference center where users can customize
 * their cookie consent on a per-category basis.
 */

(function() {
    'use strict';
    
    if (!window.CMP) {
        console.error('CMP not found. Make sure cmp.js is loaded first.');
        return;
    }
    
    const PreferenceCenter = {
        element: null,
        config: null,
        currentState: null,
        
        /**
         * Show the preference center
         */
        show: function() {
            console.log('Preference Center: Showing');
            
            this.config = CMP.config.preferenceCenter || this.getDefaultConfig();
            this.currentState = CMP.getConsent() || this.getDefaultState();
            
            // Create preference center element
            this.element = this.create();
            document.body.appendChild(this.element);
            
            // Add animation
            setTimeout(() => {
                this.element.classList.add('cmp-pc-show');
            }, 100);
        },
        
        /**
         * Hide the preference center
         */
        hide: function() {
            if (!this.element) return;
            
            this.element.classList.remove('cmp-pc-show');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }, 300);
        },
        
        /**
         * Get default configuration
         */
        getDefaultConfig: function() {
            return {
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
                        enabled: false,
                        locked: false
                    },
                    analytics: {
                        name: 'Analytics Cookies',
                        description: 'Help us understand how visitors use our website.',
                        enabled: false,
                        locked: false
                    },
                    marketing: {
                        name: 'Marketing Cookies',
                        description: 'Track visitors to display relevant advertisements.',
                        enabled: false,
                        locked: false
                    }
                },
                showAdvancedMode: true
            };
        },
        
        /**
         * Get default consent state
         */
        getDefaultState: function() {
            return {
                necessary: true,
                preferences: false,
                analytics: false,
                marketing: false
            };
        },
        
        /**
         * Create preference center HTML
         */
        create: function() {
            const container = document.createElement('div');
            container.id = 'cmp-preference-center';
            container.className = 'cmp-pc cmp-pc-layout-' + (this.config.layout || 'popup');
            container.setAttribute('role', 'dialog');
            container.setAttribute('aria-label', 'Cookie Preferences');
            container.setAttribute('aria-modal', 'true');
            
            // Apply styles
            this.applyStyles();
            
            // Build HTML
            container.innerHTML = `
                <div class="cmp-pc-overlay"></div>
                <div class="cmp-pc-content">
                    <div class="cmp-pc-header">
                        <h2 class="cmp-pc-title">${this.escapeHtml(this.config.texts.title)}</h2>
                        <button class="cmp-pc-close" aria-label="Close" title="Close">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 8.586L4.707 3.293a1 1 0 00-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="cmp-pc-body">
                        <p class="cmp-pc-description">${this.escapeHtml(this.config.texts.description)}</p>
                        <div class="cmp-pc-categories">
                            ${this.renderCategories()}
                        </div>
                    </div>
                    <div class="cmp-pc-footer">
                        <button id="cmp-pc-save" class="cmp-btn cmp-btn-primary">
                            ${this.escapeHtml(this.config.texts.save)}
                        </button>
                        <button id="cmp-pc-cancel" class="cmp-btn cmp-btn-secondary">
                            ${this.escapeHtml(this.config.texts.cancel)}
                        </button>
                    </div>
                </div>
            `;
            
            // Attach event listeners
            this.attachEvents(container);
            
            return container;
        },
        
        /**
         * Render category toggles
         */
        renderCategories: function() {
            let html = '';
            
            for (const [key, category] of Object.entries(this.config.categories)) {
                const checked = this.currentState[key] ? 'checked' : '';
                const disabled = category.locked ? 'disabled' : '';
                const disabledClass = category.locked ? 'cmp-pc-category-disabled' : '';
                
                html += `
                    <div class="cmp-pc-category ${disabledClass}">
                        <div class="cmp-pc-category-header">
                            <div class="cmp-pc-category-info">
                                <h3 class="cmp-pc-category-name">${this.escapeHtml(category.name)}</h3>
                                <p class="cmp-pc-category-description">${this.escapeHtml(category.description)}</p>
                            </div>
                            <label class="cmp-pc-toggle">
                                <input 
                                    type="checkbox" 
                                    name="category-${key}" 
                                    data-category="${key}"
                                    ${checked} 
                                    ${disabled}
                                >
                                <span class="cmp-pc-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                `;
            }
            
            return html;
        },
        
        /**
         * Apply styles
         */
        applyStyles: function() {
            // Check if styles already applied
            if (document.getElementById('cmp-pc-styles')) {
                return;
            }
            
            const theme = (CMP.config.widget && CMP.config.widget.theme) || {};
            
            const style = document.createElement('style');
            style.id = 'cmp-pc-styles';
            style.textContent = `
                .cmp-pc {
                    position: fixed;
                    z-index: 999998;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .cmp-pc.cmp-pc-show {
                    opacity: 1;
                }
                
                .cmp-pc-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: ${theme.overlayColor || 'rgba(0, 0, 0, 0.5)'};
                }
                
                .cmp-pc-content {
                    position: relative;
                    background: ${theme.backgroundColor || '#ffffff'};
                    color: ${theme.textColor || '#333333'};
                    border-radius: ${theme.borderRadius || '12px'};
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    font-family: ${theme.fontFamily || 'system-ui, sans-serif'};
                }
                
                .cmp-pc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                }
                
                .cmp-pc-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                }
                
                .cmp-pc-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    color: ${theme.textColor || '#333333'};
                    transition: background 0.2s;
                }
                
                .cmp-pc-close:hover {
                    background: rgba(0, 0, 0, 0.05);
                }
                
                .cmp-pc-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .cmp-pc-description {
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                    opacity: 0.8;
                }
                
                .cmp-pc-categories {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .cmp-pc-category {
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    padding: 16px;
                }
                
                .cmp-pc-category-disabled {
                    opacity: 0.6;
                    background: rgba(0, 0, 0, 0.02);
                }
                
                .cmp-pc-category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }
                
                .cmp-pc-category-info {
                    flex: 1;
                }
                
                .cmp-pc-category-name {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                }
                
                .cmp-pc-category-description {
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0;
                    opacity: 0.7;
                }
                
                .cmp-pc-toggle {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 28px;
                    flex-shrink: 0;
                }
                
                .cmp-pc-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .cmp-pc-toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.3s;
                    border-radius: 28px;
                }
                
                .cmp-pc-toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }
                
                .cmp-pc-toggle input:checked + .cmp-pc-toggle-slider {
                    background-color: ${theme.primaryColor || '#4F46E5'};
                }
                
                .cmp-pc-toggle input:checked + .cmp-pc-toggle-slider:before {
                    transform: translateX(20px);
                }
                
                .cmp-pc-toggle input:disabled + .cmp-pc-toggle-slider {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
                
                .cmp-pc-footer {
                    display: flex;
                    gap: 12px;
                    padding: 24px;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                }
                
                .cmp-pc-footer .cmp-btn {
                    flex: 1;
                }
                
                @media (max-width: 640px) {
                    .cmp-pc-content {
                        width: 100%;
                        max-width: 100%;
                        max-height: 100vh;
                        border-radius: 0;
                    }
                    
                    .cmp-pc-footer {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * Attach event listeners
         */
        attachEvents: function(container) {
            // Close button
            const closeBtn = container.querySelector('.cmp-pc-close');
            closeBtn.addEventListener('click', () => this.hide());
            
            // Overlay click
            const overlay = container.querySelector('.cmp-pc-overlay');
            overlay.addEventListener('click', () => this.hide());
            
            // Cancel button
            const cancelBtn = container.querySelector('#cmp-pc-cancel');
            cancelBtn.addEventListener('click', () => this.hide());
            
            // Save button
            const saveBtn = container.querySelector('#cmp-pc-save');
            saveBtn.addEventListener('click', () => this.save());
            
            // Category toggles
            const toggles = container.querySelectorAll('input[data-category]');
            toggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const category = e.target.getAttribute('data-category');
                    this.currentState[category] = e.target.checked;
                });
            });
            
            // Keyboard navigation
            container.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                }
            });
        },
        
        /**
         * Save preferences
         */
        save: function() {
            console.log('Preference Center: Saving preferences', this.currentState);
            CMP.updateConsent(this.currentState);
            this.hide();
        },
        
        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };
    
    // Expose as CMP module
    CMP.PreferenceCenter = PreferenceCenter;
    
    // Listen for show preferences event
    window.addEventListener('cmp:show-preferences', () => {
        PreferenceCenter.show();
    });
    
    // Expose global method for convenience
    window.showCookiePreferences = function() {
        PreferenceCenter.show();
    };
    
})();
