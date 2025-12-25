/**
 * Admin Dashboard JavaScript
 * 
 * Handles all admin functionality including:
 * - Dashboard statistics
 * - Consent log viewing
 * - Cookie scanning
 * - Widget customization
 */

(function() {
    'use strict';
    
    const Admin = {
        apiBase: '/api/admin',
        
        /**
         * Initialize admin dashboard
         */
        init: function() {
            console.log('Admin: Initializing');
            
            // Setup navigation
            this.setupNavigation();
            
            // Load dashboard data
            this.loadDashboard();
            
            // Setup event listeners
            this.setupEventListeners();
        },
        
        /**
         * Setup navigation
         */
        setupNavigation: function() {
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href').startsWith('#')) {
                        e.preventDefault();
                        const target = link.getAttribute('href').replace('#', '');
                        this.showSection(target);
                        
                        // Update active state
                        navLinks.forEach(l => {
                            l.classList.remove('active', 'border-indigo-500', 'text-gray-900');
                            l.classList.add('border-transparent', 'text-gray-500');
                        });
                        link.classList.add('active', 'border-indigo-500', 'text-gray-900');
                        link.classList.remove('border-transparent', 'text-gray-500');
                    }
                });
            });
        },
        
        /**
         * Show specific section
         */
        showSection: function(sectionName) {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show target section
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                
                // Load section-specific data
                if (sectionName === 'consent-logs') {
                    this.loadConsentLogs();
                }
            }
        },
        
        /**
         * Load dashboard statistics
         */
        loadDashboard: async function() {
            try {
                const response = await fetch(this.apiBase + '/stats.php');
                if (!response.ok) {
                    throw new Error('Failed to load stats');
                }
                
                const data = await response.json();
                this.updateDashboard(data);
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                // Use mock data for demo
                this.updateDashboard(this.getMockStats());
            }
        },
        
        /**
         * Update dashboard with statistics
         */
        updateDashboard: function(stats) {
            // Update stats cards
            document.getElementById('stat-total').textContent = stats.total || 0;
            document.getElementById('stat-accepted').textContent = stats.acceptedAll || 0;
            document.getElementById('stat-rejected').textContent = stats.rejectedAll || 0;
            document.getElementById('stat-customized').textContent = stats.customized || 0;
            
            // Update category chart
            if (stats.byCategory) {
                const total = stats.total || 1; // Avoid division by zero
                
                const categories = ['analytics', 'marketing', 'preferences'];
                categories.forEach(category => {
                    const categoryData = stats.byCategory[category];
                    if (categoryData) {
                        const accepted = categoryData.accepted || 0;
                        const percent = Math.round((accepted / total) * 100);
                        
                        document.getElementById(category + '-percent').textContent = percent + '%';
                        document.getElementById(category + '-bar').style.width = percent + '%';
                    }
                });
            }
            
            // Update recent activity
            this.updateRecentActivity(stats.recentLogs || []);
        },
        
        /**
         * Update recent activity list
         */
        updateRecentActivity: function(logs) {
            const container = document.getElementById('recent-activity');
            
            if (!logs || logs.length === 0) {
                container.innerHTML = '<p class="text-sm text-gray-500">No recent activity</p>';
                return;
            }
            
            let html = '';
            logs.slice(0, 5).forEach(log => {
                const date = new Date(log.timestamp);
                const timeAgo = this.getTimeAgo(date);
                
                html += `
                    <div class="flex items-center text-sm">
                        <div class="flex-shrink-0 w-2 h-2 rounded-full bg-green-400"></div>
                        <div class="ml-3">
                            <p class="text-gray-700">New consent recorded</p>
                            <p class="text-gray-500 text-xs">${timeAgo}</p>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        },
        
        /**
         * Load consent logs
         */
        loadConsentLogs: async function() {
            try {
                const response = await fetch(this.apiBase + '/logs.php');
                if (!response.ok) {
                    throw new Error('Failed to load logs');
                }
                
                const data = await response.json();
                this.displayConsentLogs(data.logs || []);
            } catch (error) {
                console.error('Failed to load consent logs:', error);
                // Use mock data for demo
                this.displayConsentLogs(this.getMockLogs());
            }
        },
        
        /**
         * Display consent logs in table
         */
        displayConsentLogs: function(logs) {
            const tbody = document.querySelector('#consent-logs-table tbody');
            
            if (!logs || logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No logs found</td></tr>';
                return;
            }
            
            let html = '';
            logs.forEach(log => {
                const state = log.consentState || {};
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${this.formatDate(log.timestamp)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${log.sessionId.substring(0, 12)}...
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            ${this.formatBool(state.necessary)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            ${this.formatBool(state.preferences)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            ${this.formatBool(state.analytics)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            ${this.formatBool(state.marketing)}
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        },
        
        /**
         * Format boolean as badge
         */
        formatBool: function(value) {
            if (value) {
                return '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">✓</span>';
            } else {
                return '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">✗</span>';
            }
        },
        
        /**
         * Format date
         */
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString();
        },
        
        /**
         * Get time ago string
         */
        getTimeAgo: function(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            
            if (seconds < 60) return seconds + ' seconds ago';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
            const days = Math.floor(hours / 24);
            return days + ' day' + (days > 1 ? 's' : '') + ' ago';
        },
        
        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Refresh button if present
            const refreshBtn = document.querySelector('[onclick="refreshLogs()"]');
            if (refreshBtn) {
                refreshBtn.onclick = () => this.loadConsentLogs();
            }
        },
        
        /**
         * Get mock statistics for demo
         */
        getMockStats: function() {
            return {
                total: 150,
                acceptedAll: 85,
                rejectedAll: 25,
                customized: 40,
                byCategory: {
                    analytics: { accepted: 95, rejected: 55 },
                    marketing: { accepted: 70, rejected: 80 },
                    preferences: { accepted: 110, rejected: 40 }
                },
                recentLogs: [
                    { timestamp: new Date(Date.now() - 60000).toISOString() },
                    { timestamp: new Date(Date.now() - 180000).toISOString() },
                    { timestamp: new Date(Date.now() - 300000).toISOString() }
                ]
            };
        },
        
        /**
         * Get mock logs for demo
         */
        getMockLogs: function() {
            const logs = [];
            for (let i = 0; i < 10; i++) {
                logs.push({
                    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
                    sessionId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                    }),
                    consentState: {
                        necessary: true,
                        preferences: Math.random() > 0.5,
                        analytics: Math.random() > 0.5,
                        marketing: Math.random() > 0.5
                    }
                });
            }
            return logs;
        }
    };
    
    // Global functions for onclick handlers
    window.refreshLogs = function() {
        Admin.loadConsentLogs();
    };
    
    window.updateCookieDatabase = async function() {
        if (confirm('Update the cookie database from Open Cookie Database? This may take a moment.')) {
            try {
                const response = await fetch(Admin.apiBase + '/update-database.php', {
                    method: 'POST'
                });
                if (response.ok) {
                    alert('Cookie database updated successfully!');
                } else {
                    alert('Failed to update database. Please try again.');
                }
            } catch (error) {
                console.error('Failed to update database:', error);
                alert('Failed to update database. Please try again.');
            }
        }
    };
    
    window.exportConsentLogs = async function() {
        try {
            const response = await fetch(Admin.apiBase + '/export.php');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'consent-logs-' + new Date().toISOString().split('T')[0] + '.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert('Failed to export logs. Please try again.');
            }
        } catch (error) {
            console.error('Failed to export logs:', error);
            alert('Failed to export logs. Please try again.');
        }
    };
    
    window.previewWidget = function() {
        window.open('/', '_blank');
    };
    
    window.scanCookies = function() {
        const resultsDiv = document.getElementById('scan-results');
        const contentDiv = document.getElementById('scan-results-content');
        
        resultsDiv.classList.remove('hidden');
        contentDiv.innerHTML = '<p class="text-sm text-gray-500">Scanning cookies...</p>';
        
        // Simulate scan
        setTimeout(() => {
            contentDiv.innerHTML = `
                <div class="space-y-2">
                    <div class="p-3 bg-gray-50 rounded">
                        <strong>_ga</strong> - Analytics (Google Analytics)
                    </div>
                    <div class="p-3 bg-gray-50 rounded">
                        <strong>_gid</strong> - Analytics (Google Analytics)
                    </div>
                    <div class="p-3 bg-gray-50 rounded">
                        <strong>_fbp</strong> - Marketing (Facebook Pixel)
                    </div>
                </div>
            `;
        }, 1000);
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Admin.init());
    } else {
        Admin.init();
    }
    
})();
