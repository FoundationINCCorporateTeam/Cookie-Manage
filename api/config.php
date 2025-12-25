<?php
/**
 * Config API Endpoint
 * 
 * Returns configuration for the CMP widget based on site ID
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../src/php/FileStorage.php';

try {
    $storage = new FileStorage(__DIR__ . '/../data');
    
    // Get site ID from query parameter
    $siteId = $_GET['siteId'] ?? 'default';
    
    // Load widget config
    $widgetConfig = $storage->read('config/widget.json');
    
    // Load preference center config
    $preferenceConfig = $storage->read('config/preference-center.json');
    
    // Load blocking config
    $blockingConfig = $storage->read('config/blocking.json');
    
    // Combine into single response
    $response = [
        'version' => '1.0.0',
        'siteId' => $siteId,
        'widget' => $widgetConfig,
        'preferenceCenter' => $preferenceConfig,
        'blocking' => $blockingConfig,
        'policyVersion' => $widgetConfig['version'] ?? '1.0.0'
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load configuration',
        'message' => $e->getMessage()
    ]);
}
