# API Documentation

This document provides comprehensive documentation for all API endpoints in the Cookie Management Platform.

## Base URL

```
https://yourdomain.com/api
```

## Authentication

Admin API endpoints may require authentication. Currently, this is handled through session-based authentication in the admin dashboard.

## Public API Endpoints

### GET /api/config.php

Returns the complete widget configuration for a specific site.

**Parameters:**
- `siteId` (string, required): Unique site identifier

**Example Request:**
```bash
curl "https://yourdomain.com/api/config.php?siteId=demo-site"
```

**Example Response:**
```json
{
  "version": "1.0.0",
  "siteId": "demo-site",
  "widget": {
    "version": "1.0.0",
    "hash": "abc123",
    "layout": "popup",
    "texts": {
      "title": "We value your privacy",
      "description": "We use cookies...",
      "acceptAll": "Accept All",
      "rejectAll": "Reject All",
      "customize": "Customize"
    },
    "theme": {
      "backgroundColor": "#ffffff",
      "textColor": "#333333",
      "primaryColor": "#4F46E5",
      "borderRadius": "8px"
    }
  },
  "preferenceCenter": { ... },
  "blocking": { ... }
}
```

**Status Codes:**
- `200 OK`: Configuration returned successfully
- `500 Internal Server Error`: Failed to load configuration

---

### POST /api/consent.php

Logs a consent event from a user.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "siteId": "demo-site",
  "sessionId": "hashed-session-id",
  "consentState": {
    "necessary": true,
    "preferences": true,
    "analytics": false,
    "marketing": false
  },
  "widgetVersion": "1.0.0",
  "policyVersion": "1.0.0",
  "jurisdiction": "gdpr"
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/consent.php" \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "demo-site",
    "sessionId": "abc123...",
    "consentState": {
      "necessary": true,
      "preferences": true,
      "analytics": false,
      "marketing": false
    }
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Consent logged successfully"
}
```

**Status Codes:**
- `200 OK`: Consent logged successfully
- `405 Method Not Allowed`: Only POST method is accepted
- `500 Internal Server Error`: Failed to log consent

---

## Admin API Endpoints

All admin endpoints are prefixed with `/api/admin/`.

### GET /api/admin/stats.php

Returns consent statistics for the dashboard.

**Parameters:**
- None (uses last 30 days by default)

**Example Request:**
```bash
curl "https://yourdomain.com/api/admin/stats.php"
```

**Example Response:**
```json
{
  "success": true,
  "total": 150,
  "acceptedAll": 85,
  "rejectedAll": 25,
  "customized": 40,
  "byCategory": {
    "analytics": {
      "accepted": 95,
      "rejected": 55
    },
    "marketing": {
      "accepted": 70,
      "rejected": 80
    },
    "preferences": {
      "accepted": 110,
      "rejected": 40
    }
  },
  "byDay": {
    "2024-01-15": 12,
    "2024-01-16": 15,
    ...
  },
  "recentLogs": [...]
}
```

**Status Codes:**
- `200 OK`: Statistics returned successfully
- `500 Internal Server Error`: Failed to load statistics

---

### GET /api/admin/logs.php

Returns paginated consent logs.

**Parameters:**
- `limit` (integer, optional): Maximum logs to return (default: 100, max: 1000)
- `offset` (integer, optional): Offset for pagination (default: 0)

**Example Request:**
```bash
curl "https://yourdomain.com/api/admin/logs.php?limit=50&offset=0"
```

**Example Response:**
```json
{
  "success": true,
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "sessionId": "abc123...",
      "consentState": {
        "necessary": true,
        "preferences": true,
        "analytics": false,
        "marketing": false
      },
      "widgetVersion": "1.0.0",
      "policyVersion": "1.0.0"
    },
    ...
  ],
  "count": 50
}
```

**Status Codes:**
- `200 OK`: Logs returned successfully
- `500 Internal Server Error`: Failed to load logs

---

### GET /api/admin/export.php

Exports consent logs as CSV.

**Parameters:**
- `days` (integer, optional): Number of days to export (default: all, 0 = all)

**Example Request:**
```bash
curl "https://yourdomain.com/api/admin/export.php?days=30" > consent-logs.csv
```

**Example Response:**
```csv
Timestamp,Session ID,Necessary,Preferences,Analytics,Marketing,Widget Version,Policy Version
2024-01-15T10:30:00Z,abc123...,true,true,false,false,1.0.0,1.0.0
...
```

**Status Codes:**
- `200 OK`: CSV exported successfully
- `500 Internal Server Error`: Failed to export logs

---

### POST /api/admin/update-database.php

Updates the cookie database from Open Cookie Database.

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/admin/update-database.php"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Cookie database updated successfully",
  "stats": {
    "total": 5420,
    "byCategory": {
      "necessary": 150,
      "preferences": 200,
      "analytics": 1800,
      "marketing": 2500,
      "uncategorized": 770
    }
  }
}
```

**Status Codes:**
- `200 OK`: Database updated successfully
- `405 Method Not Allowed`: Only POST method is accepted
- `500 Internal Server Error`: Failed to update database

---

### POST /api/admin/save-config.php

Saves widget configuration from the setup wizard.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "widget": {
    "version": "1.0.0",
    "layout": "popup",
    "texts": { ... },
    "theme": { ... }
  },
  "preferenceCenter": { ... },
  "wizard": { ... }
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/admin/save-config.php" \
  -H "Content-Type: application/json" \
  -d @config.json
```

**Example Response:**
```json
{
  "success": true,
  "message": "Configuration saved successfully"
}
```

**Status Codes:**
- `200 OK`: Configuration saved successfully
- `405 Method Not Allowed`: Only POST method is accepted
- `500 Internal Server Error`: Failed to save configuration

---

## JavaScript SDK API

The frontend SDK is loaded via:

```html
<script src="/src/js/cmp.js" data-site-id="YOUR_SITE_ID"></script>
```

### CMP Object

Global `CMP` object provides the following API:

#### CMP.init()

Initialize the CMP. Called automatically on page load.

```javascript
CMP.init();
```

#### CMP.getConsent()

Returns the current consent state.

```javascript
const consent = CMP.getConsent();
// Returns: { necessary: true, preferences: false, analytics: true, marketing: false }
// Or null if no consent given yet
```

#### CMP.updateConsent(consentState)

Updates the consent state.

```javascript
CMP.updateConsent({
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: false
});
```

#### CMP.resetConsent()

Clears the consent and reloads the page.

```javascript
CMP.resetConsent();
```

#### CMP.PreferenceCenter.show()

Shows the preference center modal.

```javascript
CMP.PreferenceCenter.show();
// Or use the global helper:
showCookiePreferences();
```

#### CMP.PreferenceCenter.hide()

Hides the preference center modal.

```javascript
CMP.PreferenceCenter.hide();
```

---

## Events

The CMP dispatches custom events that you can listen to:

### cmp:initialized

Fired when the CMP is fully initialized.

```javascript
window.addEventListener('cmp:initialized', () => {
  console.log('CMP is ready');
  const consent = CMP.getConsent();
});
```

### cmp:consent-changed

Fired when the user updates their consent.

```javascript
window.addEventListener('cmp:consent-changed', (event) => {
  console.log('Consent updated:', event.detail.consent);
  // event.detail.consent = { necessary: true, ... }
});
```

### cmp:show-preferences

Fired when the preference center should be shown.

```javascript
window.addEventListener('cmp:show-preferences', () => {
  console.log('Preference center requested');
});
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error types:
- `invalid_request`: Request is malformed or missing required fields
- `not_found`: Requested resource not found
- `internal_error`: Server-side error occurred

---

## Rate Limiting

Currently, there are no rate limits on API endpoints. In production, consider implementing rate limiting to prevent abuse.

---

## CORS

All API endpoints support CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

For production, consider restricting CORS to specific domains.

---

## Data Storage

All data is stored in JSON files:
- Configurations: `/data/config/`
- Consent logs: `/data/consent/consent-log.jsonl`
- Cookie database: `/data/cookies/database.json`

The JSONL format for consent logs means one JSON object per line, making it efficient for append operations and parsing.

---

## Security Considerations

1. **Session IDs**: Always hash session IDs before sending to the API
2. **HTTPS**: Always use HTTPS in production
3. **Input Validation**: All inputs are validated server-side
4. **File Permissions**: Ensure proper file permissions on the `/data/` directory
5. **Admin Access**: Restrict admin endpoints to authorized users only

---

## Examples

### Complete Integration Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>
  
  <!-- Your content -->
  
  <!-- Analytics script (blocked until consent) -->
  <script type="text/plain" data-category="analytics">
    // Google Analytics
    gtag('config', 'GA_MEASUREMENT_ID');
  </script>
  
  <!-- Marketing script (blocked until consent) -->
  <script type="text/plain" data-category="marketing">
    // Facebook Pixel
    fbq('init', 'YOUR_PIXEL_ID');
  </script>
  
  <!-- Load CMP SDK -->
  <script src="/src/js/cmp.js" data-site-id="my-site"></script>
  <script src="/src/js/preference-center.js"></script>
  
  <!-- Listen for consent changes -->
  <script>
    window.addEventListener('cmp:consent-changed', (e) => {
      console.log('User updated consent:', e.detail.consent);
      
      // Perform actions based on consent
      if (e.detail.consent.analytics) {
        // Enable analytics tracking
      }
    });
  </script>
</body>
</html>
```

---

## Support

For issues or questions about the API, please refer to:
- README.md for general information
- INSTALL.md for installation instructions
- GitHub Issues for bug reports and feature requests
