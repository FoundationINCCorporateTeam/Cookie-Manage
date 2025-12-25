<?php
/**
 * Admin Save Config API
 * 
 * Saves widget configuration from the setup wizard
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

require_once __DIR__ . '/../../src/php/FileStorage.php';

try {
    // Get JSON payload
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON payload');
    }
    
    $storage = new FileStorage(__DIR__ . '/../../data');
    
    // Save widget configuration
    if (isset($data['widget'])) {
        $storage->write('config/widget.json', $data['widget']);
    }
    
    // Save preference center configuration
    if (isset($data['preferenceCenter'])) {
        $storage->write('config/preference-center.json', $data['preferenceCenter']);
    }
    
    // Save wizard state
    if (isset($data['wizard'])) {
        $storage->write('config/wizard.json', $data['wizard']);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Configuration saved successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save configuration',
        'message' => $e->getMessage()
    ]);
}
