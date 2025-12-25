<?php
/**
 * ConsentLogger Class
 * 
 * Logs consent events to a JSONL file (one JSON object per line).
 * Provides proof of consent for GDPR/CCPA compliance.
 * Does not store any personal data.
 */

require_once __DIR__ . '/FileStorage.php';

class ConsentLogger {
    private $storage;
    private $logFile = 'consent/consent-log.jsonl';
    
    public function __construct(FileStorage $storage = null) {
        $this->storage = $storage ?: new FileStorage();
    }
    
    /**
     * Log a consent event
     * 
     * @param array $consentState State per category (e.g., ['necessary' => true, 'analytics' => false])
     * @param string $sessionId Anonymous session identifier (should be hashed)
     * @param string $widgetVersion Version hash of the widget
     * @param string $policyVersion Version of privacy policy
     * @param array $metadata Additional metadata (optional)
     * @return bool Success status
     */
    public function log($consentState, $sessionId, $widgetVersion = '1.0.0', $policyVersion = '1.0.0', $metadata = []) {
        // Validate consent state
        if (!is_array($consentState) || empty($consentState)) {
            throw new Exception("Invalid consent state");
        }
        
        // Ensure session ID is hashed (basic check)
        if (strlen($sessionId) < 32) {
            // Hash it if not already hashed
            $sessionId = hash('sha256', $sessionId . $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        }
        
        $entry = [
            'timestamp' => date('c'), // ISO-8601 format
            'sessionId' => $sessionId,
            'consentState' => $consentState,
            'widgetVersion' => $widgetVersion,
            'policyVersion' => $policyVersion,
            'metadata' => array_merge([
                'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'jurisdiction' => $metadata['jurisdiction'] ?? 'unknown'
            ], $metadata)
        ];
        
        try {
            $this->storage->append($this->logFile, $entry);
            return true;
        } catch (Exception $e) {
            // Log error but don't throw - consent should not block page load
            error_log("Failed to log consent: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get recent consent logs
     * 
     * @param int $limit Maximum number of logs to retrieve
     * @param int $offset Offset for pagination
     * @return array Consent logs
     */
    public function getLogs($limit = 100, $offset = 0) {
        try {
            $logs = $this->storage->readLines($this->logFile, $limit, $offset);
            
            // Reverse to show most recent first
            return array_reverse($logs);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get consent statistics
     * 
     * @param int $days Number of days to analyze (0 = all)
     * @return array Statistics
     */
    public function getStats($days = 30) {
        try {
            $logs = $this->storage->readLines($this->logFile);
        } catch (Exception $e) {
            return null;
        }
        
        if (empty($logs)) {
            return [
                'total' => 0,
                'byCategory' => [],
                'byDay' => []
            ];
        }
        
        $cutoff = $days > 0 ? strtotime("-$days days") : 0;
        
        $stats = [
            'total' => 0,
            'byCategory' => [],
            'byDay' => [],
            'acceptedAll' => 0,
            'rejectedAll' => 0,
            'customized' => 0
        ];
        
        foreach ($logs as $log) {
            $timestamp = strtotime($log['timestamp']);
            
            if ($cutoff > 0 && $timestamp < $cutoff) {
                continue;
            }
            
            $stats['total']++;
            
            // Count by category
            $consentState = $log['consentState'] ?? [];
            $allAccepted = true;
            $allRejected = true;
            
            foreach ($consentState as $category => $accepted) {
                if (!isset($stats['byCategory'][$category])) {
                    $stats['byCategory'][$category] = [
                        'accepted' => 0,
                        'rejected' => 0
                    ];
                }
                
                if ($accepted) {
                    $stats['byCategory'][$category]['accepted']++;
                    $allRejected = false;
                } else {
                    $stats['byCategory'][$category]['rejected']++;
                    
                    // Don't count 'necessary' in allAccepted check
                    if ($category !== 'necessary') {
                        $allAccepted = false;
                    }
                }
            }
            
            // Count consent types
            if ($allAccepted) {
                $stats['acceptedAll']++;
            } elseif ($allRejected) {
                $stats['rejectedAll']++;
            } else {
                $stats['customized']++;
            }
            
            // Count by day
            $day = date('Y-m-d', $timestamp);
            if (!isset($stats['byDay'][$day])) {
                $stats['byDay'][$day] = 0;
            }
            $stats['byDay'][$day]++;
        }
        
        return $stats;
    }
    
    /**
     * Get consent for a specific session
     * 
     * @param string $sessionId Session identifier
     * @return array|null Latest consent for session or null if not found
     */
    public function getSessionConsent($sessionId) {
        try {
            $logs = $this->storage->readLines($this->logFile);
        } catch (Exception $e) {
            return null;
        }
        
        // Search from end (most recent) to beginning
        for ($i = count($logs) - 1; $i >= 0; $i--) {
            if ($logs[$i]['sessionId'] === $sessionId) {
                return $logs[$i];
            }
        }
        
        return null;
    }
    
    /**
     * Export logs to CSV format
     * 
     * @param int $days Number of days to export (0 = all)
     * @return string CSV content
     */
    public function exportToCSV($days = 0) {
        try {
            $logs = $this->storage->readLines($this->logFile);
        } catch (Exception $e) {
            return '';
        }
        
        if (empty($logs)) {
            return '';
        }
        
        $cutoff = $days > 0 ? strtotime("-$days days") : 0;
        
        // Build CSV
        $csv = "Timestamp,Session ID,Necessary,Preferences,Analytics,Marketing,Widget Version,Policy Version\n";
        
        foreach ($logs as $log) {
            $timestamp = strtotime($log['timestamp']);
            
            if ($cutoff > 0 && $timestamp < $cutoff) {
                continue;
            }
            
            $consentState = $log['consentState'] ?? [];
            
            $row = [
                $log['timestamp'],
                $log['sessionId'],
                $consentState['necessary'] ?? 'false',
                $consentState['preferences'] ?? 'false',
                $consentState['analytics'] ?? 'false',
                $consentState['marketing'] ?? 'false',
                $log['widgetVersion'] ?? '',
                $log['policyVersion'] ?? ''
            ];
            
            // Convert booleans to strings
            foreach ($row as &$value) {
                if (is_bool($value)) {
                    $value = $value ? 'true' : 'false';
                }
            }
            
            $csv .= implode(',', $row) . "\n";
        }
        
        return $csv;
    }
    
    /**
     * Clear all consent logs (use with caution!)
     * 
     * @param string $confirmationToken Security token to prevent accidental deletion
     * @return bool Success status
     */
    public function clearLogs($confirmationToken) {
        // Simple security check
        if ($confirmationToken !== hash('sha256', 'CLEAR_CONSENT_LOGS')) {
            throw new Exception("Invalid confirmation token");
        }
        
        try {
            return $this->storage->delete($this->logFile);
        } catch (Exception $e) {
            return false;
        }
    }
}
