# Cookie Management Platform (CMP)

A complete, privacy-first, GDPR-compliant cookie consent management system built with HTML, CSS, JavaScript, PHP, and TailwindCSS.

## 🎯 Overview

This Cookie Management Platform provides everything you need to handle cookie consent on your website in compliance with GDPR, ePrivacy Directive, and CCPA requirements. The system is completely self-contained with **no traditional databases** - all data is stored in JSON files with atomic write operations.

## ✨ Features

### Core Functionality
- **Automatic Cookie Categorization** - Uses the Open Cookie Database to automatically categorize cookies
- **Cookie Blocking Engine** - Prevents cookies from being set before consent is given
- **Consent Widget (Banner)** - Customizable cookie consent banner with 7 predefined layouts
- **Preference Center** - Detailed preference management with 5 style presets
- **Admin Dashboard** - Complete management interface for viewing logs and customization
- **Consent Logging** - JSONL-based append-only consent proof logging
- **Setup Wizard** - Step-by-step configuration interface
- **Preview Engine** - Test different consent scenarios without affecting real logs

### Privacy & Compliance
- **GDPR Compliant** - Full support for GDPR requirements
- **CCPA Aware** - Designed with CCPA concepts in mind
- **Privacy-First** - No cookies or trackers set before consent (except strictly necessary)
- **Anonymous Tracking** - All consent logs use hashed session IDs
- **No Personal Data** - Consent logs contain no PII

### Technical Features
- **File-Based Storage** - All data stored in JSON/JSONL files with atomic writes
- **CSP-Friendly** - Compatible with Content Security Policy
- **XSS-Safe** - All user inputs are properly escaped
- **Keyboard Accessible** - Full keyboard navigation support
- **ARIA-Friendly** - Proper accessibility attributes
- **Responsive Design** - Works on all devices

## 📁 Project Structure

```
/
├── api/                          # Backend API endpoints
│   ├── config.php               # Widget configuration API
│   ├── consent.php              # Consent logging API
│   └── admin/                   # Admin APIs
│       ├── stats.php            # Statistics API
│       ├── logs.php             # Logs retrieval API
│       ├── export.php           # CSV export API
│       └── update-database.php  # Cookie DB update API
├── admin/                        # Admin dashboard
│   └── index.html               # Admin interface
├── data/                         # JSON data storage (gitignored)
│   ├── cookies/
│   │   ├── database.json        # Cached Open Cookie Database
│   │   ├── overrides.json       # Manual category overrides
│   │   ├── detected.json        # Detected cookies
│   │   └── categorized.json     # Categorized cookies
│   ├── consent/
│   │   └── consent-log.jsonl    # Append-only consent log
│   ├── config/
│   │   ├── widget.json          # Widget configuration
│   │   ├── preference-center.json # Preference center config
│   │   ├── blocking.json        # Blocking rules
│   │   └── wizard.json          # Wizard state
│   └── admin/
│       ├── users.json           # Admin users
│       └── roles.json           # User roles
├── public/                       # Public demo pages
│   └── index.html               # Demo page
├── src/                          # Source code
│   ├── js/
│   │   ├── cmp.js               # Main CMP SDK
│   │   ├── preference-center.js # Preference center module
│   │   └── admin.js             # Admin dashboard JS
│   ├── php/
│   │   ├── FileStorage.php      # Atomic file operations
│   │   ├── CookieDatabase.php   # Cookie categorization engine
│   │   └── ConsentLogger.php    # Consent logging
│   └── css/
└── README.md                     # This file
```

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/FoundationINCCorporateTeam/Cookie-Manage.git
cd Cookie-Manage
```

2. **Set up a web server:**
   - PHP 7.4+ with web server (Apache/Nginx)
   - Ensure the `data/` directory is writable by the web server

3. **Configure your web server:**
   - Point document root to the repository root
   - Enable PHP processing
   - Ensure `.htaccess` or equivalent rules are in place

### Basic Integration

Add this single line to your website's HTML (before closing `</body>` tag):

```html
<script src="/src/js/cmp.js" data-site-id="YOUR_SITE_ID" data-api-base="/api"></script>
<script src="/src/js/preference-center.js"></script>
```

Replace `YOUR_SITE_ID` with a unique identifier for your website.

### Demo

1. Open `public/index.html` in your browser to see the demo
2. The cookie banner will appear on first visit
3. Try accepting/rejecting cookies to see the system in action

### Admin Dashboard

1. Navigate to `/admin/index.html`
2. Default credentials: `admin` / `password` (change in `data/admin/users.json`)
3. View consent logs, statistics, and customize the widget

## 🍪 Cookie Categorization

The system uses the [Open Cookie Database](https://github.com/jkwakman/Open-Cookie-Database) to automatically categorize cookies into:

- **Strictly Necessary** - Essential for website functionality (never blocked)
- **Preferences** - Remember user choices and settings
- **Analytics** - Track website usage and performance
- **Marketing** - Track users for advertising purposes

### Categorization Methods

1. **Exact Match** - Cookie name exactly matches database entry
2. **Wildcard Match** - Cookie name matches pattern (e.g., `_ga*`)
3. **Domain Match** - Cookie domain matches database entry
4. **Manual Override** - Admin can manually override categorization

### Updating Cookie Database

From the admin dashboard:
1. Click "Update Cookie Database"
2. System will download latest CSV from Open Cookie Database
3. Database is cached for 7 days

## 🚫 Cookie Blocking

The blocking engine prevents cookies from being set before consent using:

### Script Interception
```html
<!-- Block analytics scripts until consent -->
<script type="text/plain" data-category="analytics" src="analytics.js"></script>

<!-- Block marketing scripts until consent -->
<script type="text/plain" data-category="marketing" src="ads.js"></script>

<!-- Necessary scripts are never blocked -->
<script src="essential.js"></script>
```

### How It Works
1. Scripts with `type="text/plain"` and `data-category` are blocked
2. When user consents to a category, scripts are activated
3. Necessary category scripts are never blocked
4. Scripts are executed in order after consent

## 📋 Consent Logging

All consent events are logged to `data/consent/consent-log.jsonl`:

```json
{"timestamp":"2024-01-15T10:30:00Z","sessionId":"abc123...","consentState":{"necessary":true,"preferences":true,"analytics":false,"marketing":false},"widgetVersion":"1.0.0","policyVersion":"1.0.0","metadata":{"userAgent":"...","jurisdiction":"gdpr"}}
```

### Log Properties
- **timestamp** - ISO-8601 formatted timestamp
- **sessionId** - Hashed anonymous session identifier
- **consentState** - Boolean state for each category
- **widgetVersion** - Version hash of the widget
- **policyVersion** - Privacy policy version
- **metadata** - Additional context (no PII)

## 🎨 Customization

### Widget Layouts

Available banner layouts:
1. Popup (default) - Bottom-right corner
2. Bottom Full - Full width at bottom
3. Top Full - Full width at top
4. Bottom-right card (small)
5. Bottom-right card (large)
6. Bottom-left card (small)
7. Bottom-left card (large)

### Preference Center Layouts

Available preference center layouts:
1. Popup (modal)
2. Sidebar slide-out
3. Center modal
4. Bottom banner expand
5. Top banner expand

### Theme Customization

Edit `data/config/widget.json`:

```json
{
  "theme": {
    "backgroundColor": "#ffffff",
    "textColor": "#333333",
    "primaryColor": "#4F46E5",
    "secondaryColor": "#6B7280",
    "borderRadius": "8px",
    "fontFamily": "system-ui, sans-serif",
    "overlayColor": "rgba(0, 0, 0, 0.5)",
    "darkMode": false
  }
}
```

## 🔧 Configuration Files

### Widget Configuration (`data/config/widget.json`)
Controls banner appearance, text, and behavior

### Preference Center (`data/config/preference-center.json`)
Manages category definitions and descriptions

### Blocking Rules (`data/config/blocking.json`)
Defines which scripts/domains to block per category

### Admin Users (`data/admin/users.json`)
Admin authentication (passwords are hashed with bcrypt)

## 📊 API Endpoints

### Public APIs

**GET** `/api/config.php?siteId=YOUR_SITE_ID`
- Returns widget configuration

**POST** `/api/consent.php`
- Logs consent event
- Body: `{ sessionId, consentState, widgetVersion, policyVersion }`

### Admin APIs

**GET** `/api/admin/stats.php`
- Returns dashboard statistics

**GET** `/api/admin/logs.php?limit=100&offset=0`
- Returns consent logs

**GET** `/api/admin/export.php?days=30`
- Exports logs as CSV

**POST** `/api/admin/update-database.php`
- Updates cookie database

## 🔒 Security

### File Storage
- Atomic writes prevent data corruption
- File locking prevents race conditions
- Temporary files used for safe writes

### XSS Prevention
- All user inputs are HTML-escaped
- CSP-compatible implementation
- No inline JavaScript (optional)

### Privacy
- Session IDs are hashed (SHA-256)
- No personal data stored in logs
- IP addresses not logged (only used for hashing)

## 🧪 Testing

### Manual Testing

1. **First Visit**
   - Banner should appear
   - No cookies except necessary

2. **Accept All**
   - All categories enabled
   - Blocked scripts execute
   - Consent logged

3. **Reject All**
   - Only necessary enabled
   - Scripts remain blocked
   - Consent logged

4. **Customize**
   - Preference center opens
   - Toggle categories
   - Save persists state

5. **Return Visit**
   - Banner doesn't appear
   - Previous consent applied

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## 📖 Usage Examples

### Check Current Consent

```javascript
const consent = CMP.getConsent();
console.log(consent); // { necessary: true, analytics: false, ... }
```

### Update Consent Programmatically

```javascript
CMP.updateConsent({
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: false
});
```

### Show Preference Center

```javascript
// Via global function
showCookiePreferences();

// Via CMP module
CMP.PreferenceCenter.show();
```

### Listen for Events

```javascript
// Consent changed
window.addEventListener('cmp:consent-changed', (e) => {
  console.log('New consent:', e.detail.consent);
});

// CMP initialized
window.addEventListener('cmp:initialized', () => {
  console.log('CMP ready');
});
```

### Reset Consent

```javascript
CMP.resetConsent(); // Clears consent and reloads page
```

## 🌐 Multi-Language Support

Edit text strings in `data/config/widget.json` and `data/config/preference-center.json`:

```json
{
  "texts": {
    "title": "Wir schätzen Ihre Privatsphäre",
    "description": "Wir verwenden Cookies...",
    "acceptAll": "Alle akzeptieren",
    "rejectAll": "Alle ablehnen"
  }
}
```

## 🔄 Version History

### Version 1.0.0 (Current)
- Initial release
- Core CMP functionality
- Cookie database integration
- Admin dashboard
- Consent logging
- Blocking engine

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please use the GitHub Issues page.

## 🙏 Acknowledgments

- [Open Cookie Database](https://github.com/jkwakman/Open-Cookie-Database) - Cookie categorization data
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- GDPR and CCPA compliance guidelines

## ⚠️ Disclaimer

This software is provided as-is for managing cookie consent. While it implements GDPR and CCPA concepts, it is not a substitute for legal advice. Consult with legal professionals to ensure your website's compliance with applicable privacy laws.

---

**Built with ❤️ for privacy-conscious web developers**