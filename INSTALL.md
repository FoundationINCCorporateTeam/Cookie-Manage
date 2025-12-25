# Installation Guide

This guide will help you install and configure the Cookie Management Platform on your server.

## Prerequisites

- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP**: Version 7.4 or higher
- **File Permissions**: Write access to the `data/` directory
- **Browser**: Modern browser with JavaScript enabled

## Step 1: Download and Extract

### Option A: Clone from GitHub
```bash
git clone https://github.com/FoundationINCCorporateTeam/Cookie-Manage.git
cd Cookie-Manage
```

### Option B: Download ZIP
1. Download the repository as ZIP
2. Extract to your web server directory
3. Navigate to the extracted folder

## Step 2: Set File Permissions

The web server needs write access to the `data/` directory:

```bash
# For Apache
sudo chown -R www-data:www-data data/
sudo chmod -R 755 data/

# For Nginx
sudo chown -R nginx:nginx data/
sudo chmod -R 755 data/
```

## Step 3: Configure Web Server

### Apache Configuration

Create or edit `.htaccess` in the root directory:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirect API requests
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ api/$1.php [L]
</IfModule>

# Enable CORS for API
<FilesMatch "\.(php)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</FilesMatch>

# Protect data directory from direct access
<Directory "data">
    Order Deny,Allow
    Deny from all
</Directory>

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
```

### Nginx Configuration

Add to your nginx server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/Cookie-Manage;
    index index.html index.php;
    
    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
    
    # Protect data directory
    location /data {
        deny all;
        return 403;
    }
    
    # API routes
    location /api/ {
        try_files $uri $uri/ $uri.php?$query_string;
    }
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
```

## Step 4: Test Installation

1. **Test PHP Processing**
   - Create a file `test.php` with `<?php phpinfo(); ?>`
   - Access via browser: `http://yourdomain.com/test.php`
   - Remove the file after testing

2. **Test File Permissions**
   ```bash
   touch data/test.txt
   # Should succeed without errors
   rm data/test.txt
   ```

3. **Test API Endpoints**
   - Access: `http://yourdomain.com/api/config.php?siteId=test`
   - Should return JSON configuration

## Step 5: Initial Configuration

### Using the Setup Wizard

1. Navigate to: `http://yourdomain.com/admin/wizard.html`
2. Follow the step-by-step wizard:
   - Select jurisdiction (GDPR/CCPA/Custom)
   - Enable/disable cookie categories
   - Choose banner layout
   - Customize colors and text
   - Review and publish

### Manual Configuration

Edit configuration files in `data/config/`:

1. **Widget Configuration** (`widget.json`)
   ```json
   {
     "version": "1.0.0",
     "layout": "popup",
     "texts": {
       "title": "Your Custom Title",
       "description": "Your custom description"
     },
     "theme": {
       "backgroundColor": "#ffffff",
       "primaryColor": "#4F46E5"
     }
   }
   ```

2. **Preference Center** (`preference-center.json`)
   - Configure category names and descriptions

3. **Blocking Rules** (`blocking.json`)
   - Define scripts to block per category

## Step 6: Update Cookie Database

The system uses the Open Cookie Database for automatic categorization:

1. Navigate to admin dashboard: `http://yourdomain.com/admin/`
2. Click "Update Cookie Database"
3. Wait for download and processing to complete

Or update via command line:
```bash
php -r "require 'src/php/FileStorage.php'; require 'src/php/CookieDatabase.php'; \$db = new CookieDatabase(); \$db->updateDatabase(true);"
```

## Step 7: Integrate into Your Website

Add this code before the closing `</body>` tag in your HTML:

```html
<script src="http://yourdomain.com/src/js/cmp.js" data-site-id="YOUR_SITE_ID" data-api-base="/api"></script>
<script src="http://yourdomain.com/src/js/preference-center.js"></script>
```

Replace:
- `http://yourdomain.com` with your actual domain
- `YOUR_SITE_ID` with a unique identifier for your site

## Step 8: Test the Implementation

1. **Clear Browser Cache and Cookies**
2. **Visit Your Website**
   - Cookie banner should appear
3. **Test Actions**
   - Click "Accept All" - all scripts should execute
   - Click "Reject All" - only necessary scripts execute
   - Click "Customize" - preference center should open
4. **Check Logs**
   - Visit admin dashboard: `http://yourdomain.com/admin/`
   - Verify consent logs are being recorded

## Troubleshooting

### Banner Not Appearing

1. **Check JavaScript Console**
   - Open browser DevTools (F12)
   - Look for errors in Console tab

2. **Verify File Paths**
   - Ensure `cmp.js` is accessible
   - Check network tab for 404 errors

3. **Check Configuration**
   - Verify `data/config/widget.json` exists
   - Ensure API endpoint returns valid JSON

### Consent Not Logging

1. **Check File Permissions**
   ```bash
   ls -la data/consent/
   # Should be writable by web server
   ```

2. **Test API Endpoint**
   ```bash
   curl -X POST http://yourdomain.com/api/consent.php \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"test123","consentState":{"necessary":true}}'
   ```

3. **Check PHP Error Log**
   ```bash
   tail -f /var/log/apache2/error.log
   # or
   tail -f /var/log/nginx/error.log
   ```

### Scripts Not Blocking

1. **Verify Script Tags**
   - Ensure `type="text/plain"`
   - Include `data-category` attribute
   ```html
   <script type="text/plain" data-category="analytics" src="analytics.js"></script>
   ```

2. **Check Blocking Configuration**
   - Review `data/config/blocking.json`
   - Ensure `enabled: true`

### Admin Dashboard Issues

1. **Clear Browser Cache**
2. **Check PHP Version**
   ```bash
   php -v
   # Should be 7.4 or higher
   ```

3. **Verify All APIs Respond**
   - `/api/admin/stats.php`
   - `/api/admin/logs.php`
   - `/api/admin/export.php`

## Security Hardening

### 1. Change Default Admin Password

Edit `data/admin/users.json`:
```bash
php -r "echo password_hash('YourNewPassword', PASSWORD_BCRYPT);"
# Copy the hash and replace in users.json
```

### 2. Restrict Admin Access by IP

Apache `.htaccess`:
```apache
<Directory "admin">
    Order Deny,Allow
    Deny from all
    Allow from 192.168.1.100
    Allow from 10.0.0.0/8
</Directory>
```

Nginx:
```nginx
location /admin {
    allow 192.168.1.100;
    allow 10.0.0.0/8;
    deny all;
}
```

### 3. Enable HTTPS

Always use HTTPS in production:
```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

### 4. Regular Backups

Backup the `data/` directory regularly:
```bash
# Create backup script
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz data/
# Move to backup location
mv backup-*.tar.gz /path/to/backups/
```

## Performance Optimization

### 1. Enable Gzip Compression

Apache:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Enable Browser Caching

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
</IfModule>
```

### 3. Use CDN for TailwindCSS

The demo uses TailwindCSS from CDN. For production, consider:
- Using a local copy
- Building a custom TailwindCSS file with only used classes

## Upgrading

### From Version X.X to Y.Y

1. **Backup Current Installation**
   ```bash
   cp -r Cookie-Manage Cookie-Manage-backup
   ```

2. **Download New Version**
   ```bash
   git pull origin main
   # or download and extract new version
   ```

3. **Preserve Configuration**
   ```bash
   cp Cookie-Manage-backup/data/config/* Cookie-Manage/data/config/
   ```

4. **Test Thoroughly**
   - Check admin dashboard
   - Test consent widget
   - Verify logs are recording

## Support

If you encounter issues:

1. **Check Documentation**: Review README.md and this guide
2. **Search Issues**: Check GitHub Issues for similar problems
3. **Enable Debug Mode**: Check browser console and PHP error logs
4. **Ask for Help**: Create a new GitHub Issue with:
   - PHP version
   - Web server (Apache/Nginx)
   - Error messages
   - Steps to reproduce

## Next Steps

- Customize the widget appearance in the Setup Wizard
- Configure blocking rules for your specific tracking scripts
- Set up automated backups
- Monitor consent logs regularly
- Review and update cookie database periodically

---

**Congratulations!** Your Cookie Management Platform is now installed and ready to use.
