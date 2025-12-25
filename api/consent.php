<?php
/**
 * Consent API Endpoint
 * 
 * Logs consent events from the frontend SDK
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../src/php/FileStorage.php';
require_once __DIR__ . '/../src/php/ConsentLogger.php';

try {
    // Get JSON payload
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON payload');
    }
    
    // Validate required fields
    if (!isset($data['consentState']) || !isset($data['sessionId'])) {
        throw new Exception('Missing required fields');
    }
    
    $storage = new FileStorage(__DIR__ . '/../data');
    $logger = new ConsentLogger($storage);
    
    // Log the consent
    $success = $logger->log(
        $data['consentState'],
        $data['sessionId'],
        $data['widgetVersion'] ?? '1.0.0',
        $data['policyVersion'] ?? '1.0.0',
        [
            'siteId' => $data['siteId'] ?? 'default',
            'jurisdiction' => $data['jurisdiction'] ?? 'unknown'
        ]
    );
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Consent logged successfully'
        ]);
    } else {
        throw new Exception('Failed to log consent');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to log consent',
        'message' => $e->getMessage()
    ]);
}
