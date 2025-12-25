<?php
/**
 * CookieDatabase Class
 * 
 * Downloads, parses, and manages the Open Cookie Database.
 * Provides cookie categorization based on name, domain, and wildcards.
 */

require_once __DIR__ . '/FileStorage.php';

class CookieDatabase {
    private $storage;
    private $csvUrl = 'https://raw.githubusercontent.com/jkwakman/Open-Cookie-Database/refs/heads/master/open-cookie-database.csv';
    private $cacheFile = 'cookies/database.json';
    private $database = null;
    
    // Category mapping from CSV to normalized categories
    private $categoryMap = [
        'Strictly Necessary' => 'necessary',
        'Functional' => 'preferences',
        'Performance' => 'analytics',
        'Targeting/Advertising' => 'marketing',
        'Analytics' => 'analytics',
        'Marketing' => 'marketing',
        'Preferences' => 'preferences',
        'Necessary' => 'necessary'
    ];
    
    public function __construct(FileStorage $storage = null) {
        $this->storage = $storage ?: new FileStorage();
    }
    
    /**
     * Download and parse the Open Cookie Database CSV
     * 
     * @param bool $forceRefresh Force re-download even if cached
     * @return bool Success status
     */
    public function updateDatabase($forceRefresh = false) {
        if (!$forceRefresh && $this->storage->exists($this->cacheFile)) {
            try {
                $cached = $this->storage->read($this->cacheFile);
                // Check if cache is recent (less than 7 days old)
                if (isset($cached['lastUpdated'])) {
                    $cacheAge = time() - strtotime($cached['lastUpdated']);
                    if ($cacheAge < 7 * 24 * 60 * 60) {
                        return true; // Use cached version
                    }
                }
            } catch (Exception $e) {
                // Continue to download if cache read fails
            }
        }
        
        // Download CSV
        $csv = @file_get_contents($this->csvUrl);
        
        if ($csv === false) {
            throw new Exception("Failed to download Open Cookie Database");
        }
        
        // Parse CSV
        $lines = explode("\n", $csv);
        $headers = str_getcsv(array_shift($lines));
        
        $cookies = [];
        $stats = [
            'total' => 0,
            'byCategory' => []
        ];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }
            
            $data = str_getcsv($line);
            
            if (count($data) < count($headers)) {
                continue; // Skip malformed lines
            }
            
            $cookie = array_combine($headers, $data);
            
            // Normalize the cookie data
            $normalized = [
                'id' => $cookie['ID'] ?? '',
                'platform' => $cookie['Platform'] ?? '',
                'category' => $this->normalizeCategory($cookie['Category'] ?? ''),
                'name' => $cookie['Cookie / Data Key name'] ?? '',
                'domain' => $cookie['Domain'] ?? '',
                'description' => $cookie['Description'] ?? '',
                'retention' => $cookie['Retention period'] ?? '',
                'dataController' => $cookie['Data Controller'] ?? '',
                'privacyPortal' => $cookie['User Privacy & GDPR Rights Portals'] ?? '',
                'isWildcard' => ($cookie['Wildcard match'] ?? '0') === '1'
            ];
            
            // Skip if no name
            if (empty($normalized['name'])) {
                continue;
            }
            
            $cookies[] = $normalized;
            $stats['total']++;
            
            $category = $normalized['category'];
            if (!isset($stats['byCategory'][$category])) {
                $stats['byCategory'][$category] = 0;
            }
            $stats['byCategory'][$category]++;
        }
        
        // Build indexes for faster lookup
        $indexes = $this->buildIndexes($cookies);
        
        // Save to cache
        $cacheData = [
            'version' => '1.0.0',
            'lastUpdated' => date('c'),
            'source' => $this->csvUrl,
            'stats' => $stats,
            'cookies' => $cookies,
            'indexes' => $indexes
        ];
        
        $this->storage->write($this->cacheFile, $cacheData);
        $this->database = $cacheData;
        
        return true;
    }
    
    /**
     * Build indexes for faster cookie lookup
     * 
     * @param array $cookies Cookie array
     * @return array Indexes
     */
    private function buildIndexes($cookies) {
        $indexes = [
            'byName' => [],
            'byDomain' => [],
            'wildcards' => []
        ];
        
        foreach ($cookies as $index => $cookie) {
            $name = strtolower($cookie['name']);
            $domain = strtolower($cookie['domain']);
            
            if ($cookie['isWildcard']) {
                $indexes['wildcards'][] = [
                    'pattern' => $name,
                    'index' => $index
                ];
            } else {
                if (!isset($indexes['byName'][$name])) {
                    $indexes['byName'][$name] = [];
                }
                $indexes['byName'][$name][] = $index;
            }
            
            if (!empty($domain)) {
                if (!isset($indexes['byDomain'][$domain])) {
                    $indexes['byDomain'][$domain] = [];
                }
                $indexes['byDomain'][$domain][] = $index;
            }
        }
        
        return $indexes;
    }
    
    /**
     * Normalize category name to standard categories
     * 
     * @param string $category Category from CSV
     * @return string Normalized category
     */
    private function normalizeCategory($category) {
        $category = trim($category);
        
        if (isset($this->categoryMap[$category])) {
            return $this->categoryMap[$category];
        }
        
        // Fuzzy matching
        $lower = strtolower($category);
        foreach ($this->categoryMap as $key => $value) {
            if (stripos($lower, strtolower($key)) !== false) {
                return $value;
            }
        }
        
        return 'uncategorized';
    }
    
    /**
     * Load database from cache
     * 
     * @return bool Success status
     */
    public function loadDatabase() {
        if ($this->database !== null) {
            return true;
        }
        
        if (!$this->storage->exists($this->cacheFile)) {
            // Try to download if not cached
            return $this->updateDatabase();
        }
        
        try {
            $this->database = $this->storage->read($this->cacheFile);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Categorize a cookie by name and domain
     * 
     * @param string $name Cookie name
     * @param string $domain Cookie domain
     * @return array Category info with matched cookie data
     */
    public function categorize($name, $domain = '') {
        $this->loadDatabase();
        
        if ($this->database === null) {
            return [
                'category' => 'uncategorized',
                'confidence' => 'none',
                'matched' => null
            ];
        }
        
        $name = strtolower($name);
        $domain = strtolower($domain);
        
        // Check overrides first
        $overrides = $this->getOverrides();
        $overrideKey = $name . ($domain ? '@' . $domain : '');
        
        if (isset($overrides[$overrideKey])) {
            return [
                'category' => $overrides[$overrideKey]['category'],
                'confidence' => 'override',
                'matched' => $overrides[$overrideKey]
            ];
        }
        
        // 1. Try exact name match
        if (isset($this->database['indexes']['byName'][$name])) {
            $indexes = $this->database['indexes']['byName'][$name];
            
            // If domain provided, try to match domain too
            if (!empty($domain)) {
                foreach ($indexes as $idx) {
                    $cookie = $this->database['cookies'][$idx];
                    $cookieDomain = strtolower($cookie['domain']);
                    
                    if ($cookieDomain === $domain || $this->domainMatches($domain, $cookieDomain)) {
                        return [
                            'category' => $cookie['category'],
                            'confidence' => 'exact',
                            'matched' => $cookie
                        ];
                    }
                }
            }
            
            // Return first match if no domain match
            $cookie = $this->database['cookies'][$indexes[0]];
            return [
                'category' => $cookie['category'],
                'confidence' => 'exact',
                'matched' => $cookie
            ];
        }
        
        // 2. Try wildcard match
        foreach ($this->database['indexes']['wildcards'] as $wildcard) {
            $pattern = $wildcard['pattern'];
            
            if ($this->wildcardMatch($name, $pattern)) {
                $cookie = $this->database['cookies'][$wildcard['index']];
                
                // Check domain if provided
                if (!empty($domain) && !empty($cookie['domain'])) {
                    $cookieDomain = strtolower($cookie['domain']);
                    if ($cookieDomain !== $domain && !$this->domainMatches($domain, $cookieDomain)) {
                        continue;
                    }
                }
                
                return [
                    'category' => $cookie['category'],
                    'confidence' => 'wildcard',
                    'matched' => $cookie
                ];
            }
        }
        
        // 3. Try domain-only match
        if (!empty($domain) && isset($this->database['indexes']['byDomain'][$domain])) {
            $indexes = $this->database['indexes']['byDomain'][$domain];
            $cookie = $this->database['cookies'][$indexes[0]];
            
            return [
                'category' => $cookie['category'],
                'confidence' => 'domain',
                'matched' => $cookie
            ];
        }
        
        // No match found
        return [
            'category' => 'uncategorized',
            'confidence' => 'none',
            'matched' => null
        ];
    }
    
    /**
     * Check if a cookie name matches a wildcard pattern
     * 
     * @param string $name Cookie name
     * @param string $pattern Wildcard pattern (* supported)
     * @return bool
     */
    private function wildcardMatch($name, $pattern) {
        $pattern = strtolower($pattern);
        $name = strtolower($name);
        
        // Convert wildcard pattern to regex
        $regex = '/^' . str_replace(['*', '?'], ['.*', '.'], preg_quote($pattern, '/')) . '$/';
        
        return preg_match($regex, $name) === 1;
    }
    
    /**
     * Check if domain matches (supports subdomains)
     * 
     * @param string $domain Cookie domain
     * @param string $pattern Domain pattern
     * @return bool
     */
    private function domainMatches($domain, $pattern) {
        $domain = strtolower($domain);
        $pattern = strtolower($pattern);
        
        // Exact match
        if ($domain === $pattern) {
            return true;
        }
        
        // Subdomain match (e.g., .example.com matches sub.example.com)
        if (strpos($pattern, '.') === 0) {
            return substr($domain, -(strlen($pattern))) === $pattern;
        }
        
        // Parent domain match
        return substr($domain, -(strlen($pattern) + 1)) === '.' . $pattern;
    }
    
    /**
     * Get user overrides
     * 
     * @return array Overrides
     */
    private function getOverrides() {
        try {
            $data = $this->storage->read('cookies/overrides.json');
            return $data['overrides'] ?? [];
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Add or update an override
     * 
     * @param string $name Cookie name
     * @param string $domain Cookie domain
     * @param string $category New category
     * @param string $reason Reason for override
     * @return bool Success status
     */
    public function addOverride($name, $domain, $category, $reason = '') {
        try {
            $data = $this->storage->read('cookies/overrides.json');
        } catch (Exception $e) {
            $data = ['version' => '1.0.0', 'overrides' => []];
        }
        
        $key = strtolower($name) . ($domain ? '@' . strtolower($domain) : '');
        
        $data['overrides'][$key] = [
            'name' => $name,
            'domain' => $domain,
            'category' => $category,
            'reason' => $reason,
            'timestamp' => date('c')
        ];
        
        $data['lastModified'] = date('c');
        
        $this->storage->write('cookies/overrides.json', $data);
        
        return true;
    }
    
    /**
     * Get database statistics
     * 
     * @return array Statistics
     */
    public function getStats() {
        $this->loadDatabase();
        
        if ($this->database === null) {
            return null;
        }
        
        return $this->database['stats'] ?? [];
    }
    
    /**
     * Search cookies by name, domain, or description
     * 
     * @param string $query Search query
     * @param int $limit Maximum results
     * @return array Matching cookies
     */
    public function search($query, $limit = 50) {
        $this->loadDatabase();
        
        if ($this->database === null || empty($query)) {
            return [];
        }
        
        $query = strtolower($query);
        $results = [];
        
        foreach ($this->database['cookies'] as $cookie) {
            if (count($results) >= $limit) {
                break;
            }
            
            $searchFields = [
                strtolower($cookie['name']),
                strtolower($cookie['domain']),
                strtolower($cookie['description']),
                strtolower($cookie['platform'])
            ];
            
            foreach ($searchFields as $field) {
                if (stripos($field, $query) !== false) {
                    $results[] = $cookie;
                    break;
                }
            }
        }
        
        return $results;
    }
}
