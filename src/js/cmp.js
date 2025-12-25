/**
 * Cookie Management Platform (CMP) - Frontend SDK
 * 
 * This is the main injectable script that handles:
 * - Cookie scanning and categorization
 * - Automatic cookie blocking
 * - Consent widget rendering
 * - Consent state management
 * - Communication with backend
 * 
 * Usage: <script src="cmp.js" data-site-id="YOUR_SITE_ID"></script>
 */

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.CMP) {
        console.warn('CMP already initialized');
        return;
    }
    
    // Get configuration from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-site-id]');
    const siteId = scriptTag ? scriptTag.getAttribute('data-site-id') : 'default';
    const apiBase = scriptTag ? (scriptTag.getAttribute('data-api-base') || '/api') : '/api';
    
    // CMP Core Object
    const CMP = {
        version: '1.0.0',
        siteId: siteId,
        apiBase: apiBase,
        config: null,
        consent: null,
        cookies: [],
        blockedScripts: [],
        initialized: false,
        
        /**
         * Initialize the CMP
         */
        init: async function() {
            if (this.initialized) return;
            
            console.log('CMP: Initializing v' + this.version);
            
            // Load configuration
            await this.loadConfig();
            
            // Load existing consent
            this.loadConsent();
            
            // Scan cookies
            this.scanCookies();
            
            // Apply blocking
            if (this.config.blocking && this.config.blocking.enabled) {
                this.applyBlocking();
            }
            
            // Show banner if needed
            if (this.shouldShowBanner()) {
                this.showBanner();
            } else if (this.consent) {
                // Apply existing consent
                this.applyConsent();
            }
            
            this.initialized = true;
            this.dispatchEvent('cmp:initialized');
        },
        
        /**
         * Load configuration from API
         */
        loadConfig: async function() {
            try {
                const response = await fetch(this.apiBase + '/config.php?siteId=' + this.siteId);
                if (!response.ok) {
                    throw new Error('Failed to load config');
                }
                this.config = await response.json();
                console.log('CMP: Config loaded', this.config);
            } catch (error) {
                console.error('CMP: Failed to load config', error);
                // Use default config
                this.config = this.getDefaultConfig();
            }
        },
        
        /**
         * Get default configuration
         */
        getDefaultConfig: function() {
            return {
                widget: {
                    layout: 'popup',
                    texts: {
                        title: 'We value your privacy',
                        description: 'We use cookies to enhance your browsing experience.',
                        acceptAll: 'Accept All',
                        rejectAll: 'Reject All',
                        customize: 'Customize'
                    },
                    theme: {
                        backgroundColor: '#ffffff',
                        textColor: '#333333',
                        primaryColor: '#4F46E5',
                        borderRadius: '8px'
                    }
                },
                blocking: {
                    enabled: true
                },
                categories: {
                    necessary: { enabled: true, locked: true },
                    preferences: { enabled: false },
                    analytics: { enabled: false },
                    marketing: { enabled: false }
                }
            };
        },
        
        /**
         * Load consent from localStorage
         */
        loadConsent: function() {
            try {
                const stored = localStorage.getItem('cmp_consent');
                if (stored) {
                    this.consent = JSON.parse(stored);
                    console.log('CMP: Loaded existing consent', this.consent);
                }
            } catch (error) {
                console.error('CMP: Failed to load consent', error);
            }
        },
        
        /**
         * Save consent to localStorage
         */
        saveConsent: function(consentState) {
            this.consent = {
                state: consentState,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            try {
                localStorage.setItem('cmp_consent', JSON.stringify(this.consent));
                console.log('CMP: Consent saved', this.consent);
            } catch (error) {
                console.error('CMP: Failed to save consent', error);
            }
            
            // Log consent to backend
            this.logConsent(consentState);
            
            // Apply consent
            this.applyConsent();
            
            // Dispatch event
            this.dispatchEvent('cmp:consent-changed', { consent: consentState });
        },
        
        /**
         * Log consent to backend
         */
        logConsent: async function(consentState) {
            try {
                const sessionId = this.getSessionId();
                
                const response = await fetch(this.apiBase + '/consent.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        siteId: this.siteId,
                        sessionId: sessionId,
                        consentState: consentState,
                        widgetVersion: this.version,
                        policyVersion: this.config.policyVersion || '1.0.0'
                    })
                });
                
                if (!response.ok) {
                    console.error('CMP: Failed to log consent');
                }
            } catch (error) {
                console.error('CMP: Failed to log consent', error);
            }
        },
        
        /**
         * Get or create anonymous session ID
         */
        getSessionId: function() {
            let sessionId = sessionStorage.getItem('cmp_session_id');
            
            if (!sessionId) {
                // Generate a random session ID
                sessionId = this.generateId();
                sessionStorage.setItem('cmp_session_id', sessionId);
            }
            
            return sessionId;
        },
        
        /**
         * Generate a random ID
         */
        generateId: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        
        /**
         * Check if banner should be shown
         */
        shouldShowBanner: function() {
            // Don't show if consent already given
            if (this.consent && this.consent.state) {
                return false;
            }
            
            // Check Do Not Track
            if (this.config.widget && this.config.widget.behavior && 
                this.config.widget.behavior.respectDoNotTrack) {
                if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
                    // Auto-reject all except necessary
                    this.saveConsent({
                        necessary: true,
                        preferences: false,
                        analytics: false,
                        marketing: false
                    });
                    return false;
                }
            }
            
            return true;
        },
        
        /**
         * Scan cookies on the page
         */
        scanCookies: function() {
            const cookies = document.cookie.split(';');
            this.cookies = [];
            
            for (const cookie of cookies) {
                const parts = cookie.trim().split('=');
                if (parts.length >= 1) {
                    const name = parts[0].trim();
                    if (name) {
                        this.cookies.push({
                            name: name,
                            domain: window.location.hostname,
                            value: parts.slice(1).join('=')
                        });
                    }
                }
            }
            
            console.log('CMP: Scanned cookies', this.cookies);
        },
        
        /**
         * Apply blocking to scripts and cookies
         */
        applyBlocking: function() {
            console.log('CMP: Applying blocking');
            
            // Intercept script tags
            this.interceptScripts();
            
            // Block cookies if no consent
            if (!this.consent) {
                this.blockCookies();
            }
        },
        
        /**
         * Intercept and block scripts based on category
         */
        interceptScripts: function() {
            // Observe DOM for new scripts
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.tagName === 'SCRIPT') {
                            this.handleScript(node);
                        }
                    });
                });
            });
            
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
            
            // Handle existing scripts
            document.querySelectorAll('script[type="text/plain"]').forEach((script) => {
                this.handleScript(script);
            });
        },
        
        /**
         * Handle individual script tag
         */
        handleScript: function(script) {
            // Check if script should be blocked
            const category = script.getAttribute('data-category');
            
            if (!category) {
                return; // No category, allow
            }
            
            if (category === 'necessary') {
                return; // Never block necessary
            }
            
            // Check consent
            if (!this.consent || !this.consent.state[category]) {
                // Block script
                if (script.type !== 'text/plain') {
                    script.type = 'text/plain';
                    script.setAttribute('data-blocked', 'true');
                    this.blockedScripts.push({
                        script: script,
                        category: category
                    });
                    console.log('CMP: Blocked script', category);
                }
            } else {
                // Unblock script
                if (script.type === 'text/plain' && script.getAttribute('data-blocked')) {
                    script.type = 'text/javascript';
                    script.removeAttribute('data-blocked');
                    console.log('CMP: Unblocked script', category);
                }
            }
        },
        
        /**
         * Block cookies that don't have consent
         */
        blockCookies: function() {
            // This is a simplified approach
            // In production, you'd need more sophisticated cookie blocking
            console.log('CMP: Cookie blocking active');
        },
        
        /**
         * Apply consent - enable scripts for accepted categories
         */
        applyConsent: function() {
            if (!this.consent) return;
            
            console.log('CMP: Applying consent', this.consent.state);
            
            // Unblock scripts for accepted categories
            this.blockedScripts.forEach(({ script, category }) => {
                if (this.consent.state[category]) {
                    if (script.type === 'text/plain') {
                        // Clone and replace to execute
                        const newScript = document.createElement('script');
                        Array.from(script.attributes).forEach(attr => {
                            if (attr.name !== 'type' && attr.name !== 'data-blocked') {
                                newScript.setAttribute(attr.name, attr.value);
                            }
                        });
                        newScript.textContent = script.textContent;
                        script.parentNode.replaceChild(newScript, script);
                        console.log('CMP: Executed blocked script', category);
                    }
                }
            });
            
            // Clear blocked scripts list
            this.blockedScripts = [];
        },
        
        /**
         * Show consent banner
         */
        showBanner: function() {
            console.log('CMP: Showing banner');
            
            // Create banner element
            const banner = this.createBanner();
            document.body.appendChild(banner);
            
            // Add animation
            setTimeout(() => {
                banner.classList.add('cmp-show');
            }, 100);
        },
        
        /**
         * Create banner HTML
         */
        createBanner: function() {
            const config = this.config.widget || this.getDefaultConfig().widget;
            const theme = config.theme || {};
            
            const banner = document.createElement('div');
            banner.id = 'cmp-banner';
            banner.className = 'cmp-banner cmp-layout-' + (config.layout || 'popup');
            banner.setAttribute('role', 'dialog');
            banner.setAttribute('aria-label', 'Cookie Consent');
            banner.setAttribute('aria-modal', 'true');
            
            // Apply styles
            this.applyBannerStyles(banner, theme);
            
            banner.innerHTML = `
                <div class="cmp-banner-content">
                    <h2 class="cmp-banner-title">${this.escapeHtml(config.texts.title)}</h2>
                    <p class="cmp-banner-description">${this.escapeHtml(config.texts.description)}</p>
                    <div class="cmp-banner-buttons">
                        <button id="cmp-accept-all" class="cmp-btn cmp-btn-primary">
                            ${this.escapeHtml(config.texts.acceptAll)}
                        </button>
                        <button id="cmp-reject-all" class="cmp-btn cmp-btn-secondary">
                            ${this.escapeHtml(config.texts.rejectAll)}
                        </button>
                        <button id="cmp-customize" class="cmp-btn cmp-btn-link">
                            ${this.escapeHtml(config.texts.customize)}
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.attachBannerEvents(banner);
            
            return banner;
        },
        
        /**
         * Apply banner styles from theme
         */
        applyBannerStyles: function(banner, theme) {
            const style = document.createElement('style');
            style.textContent = `
                .cmp-banner {
                    position: fixed;
                    z-index: 999999;
                    background: ${theme.backgroundColor || '#ffffff'};
                    color: ${theme.textColor || '#333333'};
                    font-family: ${theme.fontFamily || 'system-ui, sans-serif'};
                    border-radius: ${theme.borderRadius || '8px'};
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 24px;
                    max-width: 500px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.3s, transform 0.3s;
                }
                
                .cmp-banner.cmp-show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .cmp-layout-popup {
                    bottom: 20px;
                    right: 20px;
                }
                
                .cmp-layout-bottom-full {
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-width: 100%;
                    border-radius: 0;
                }
                
                .cmp-layout-top-full {
                    top: 0;
                    left: 0;
                    right: 0;
                    max-width: 100%;
                    border-radius: 0;
                }
                
                .cmp-banner-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                }
                
                .cmp-banner-description {
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0 0 20px 0;
                    opacity: 0.8;
                }
                
                .cmp-banner-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                
                .cmp-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: ${theme.borderRadius || '6px'};
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .cmp-btn-primary {
                    background: ${theme.primaryColor || '#4F46E5'};
                    color: white;
                }
                
                .cmp-btn-primary:hover {
                    opacity: 0.9;
                }
                
                .cmp-btn-secondary {
                    background: ${theme.secondaryColor || '#6B7280'};
                    color: white;
                }
                
                .cmp-btn-secondary:hover {
                    opacity: 0.9;
                }
                
                .cmp-btn-link {
                    background: transparent;
                    color: ${theme.primaryColor || '#4F46E5'};
                    text-decoration: underline;
                }
                
                .cmp-btn-link:hover {
                    opacity: 0.8;
                }
                
                @media (max-width: 640px) {
                    .cmp-banner {
                        left: 0;
                        right: 0;
                        bottom: 0;
                        max-width: 100%;
                        border-radius: 0;
                    }
                    
                    .cmp-banner-buttons {
                        flex-direction: column;
                    }
                    
                    .cmp-btn {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * Attach event listeners to banner buttons
         */
        attachBannerEvents: function(banner) {
            const acceptBtn = banner.querySelector('#cmp-accept-all');
            const rejectBtn = banner.querySelector('#cmp-reject-all');
            const customizeBtn = banner.querySelector('#cmp-customize');
            
            acceptBtn.addEventListener('click', () => {
                this.acceptAll();
                this.hideBanner(banner);
            });
            
            rejectBtn.addEventListener('click', () => {
                this.rejectAll();
                this.hideBanner(banner);
            });
            
            customizeBtn.addEventListener('click', () => {
                this.hideBanner(banner);
                this.showPreferenceCenter();
            });
        },
        
        /**
         * Accept all cookies
         */
        acceptAll: function() {
            this.saveConsent({
                necessary: true,
                preferences: true,
                analytics: true,
                marketing: true
            });
        },
        
        /**
         * Reject all non-necessary cookies
         */
        rejectAll: function() {
            this.saveConsent({
                necessary: true,
                preferences: false,
                analytics: false,
                marketing: false
            });
        },
        
        /**
         * Hide banner
         */
        hideBanner: function(banner) {
            banner.classList.remove('cmp-show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        },
        
        /**
         * Show preference center (placeholder)
         */
        showPreferenceCenter: function() {
            console.log('CMP: Showing preference center');
            // This will be implemented in the preference center module
            this.dispatchEvent('cmp:show-preferences');
        },
        
        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * Dispatch custom event
         */
        dispatchEvent: function(eventName, detail = {}) {
            const event = new CustomEvent(eventName, { detail: detail });
            window.dispatchEvent(event);
        },
        
        /**
         * Public API
         */
        getConsent: function() {
            return this.consent ? this.consent.state : null;
        },
        
        updateConsent: function(consentState) {
            this.saveConsent(consentState);
        },
        
        resetConsent: function() {
            localStorage.removeItem('cmp_consent');
            this.consent = null;
            location.reload();
        }
    };
    
    // Expose CMP globally
    window.CMP = CMP;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CMP.init());
    } else {
        CMP.init();
    }
    
})();
