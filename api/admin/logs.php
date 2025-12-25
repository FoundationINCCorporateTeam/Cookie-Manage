<?php
/**
 * Admin Logs API
 * 
 * Returns consent logs for the admin dashboard
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../src/php/FileStorage.php';
require_once __DIR__ . '/../../src/php/ConsentLogger.php';

try {
    $storage = new FileStorage(__DIR__ . '/../../data');
    $logger = new ConsentLogger($storage);
    
    // Get parameters
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Get logs
    $logs = $logger->getLogs($limit, $offset);
    
    $response = [
        'success' => true,
        'logs' => $logs,
        'count' => count($logs)
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load logs',
        'message' => $e->getMessage()
    ]);
}
