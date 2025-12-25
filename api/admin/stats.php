<?php
/**
 * Admin Stats API
 * 
 * Returns consent statistics for the admin dashboard
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../src/php/FileStorage.php';
require_once __DIR__ . '/../../src/php/ConsentLogger.php';

try {
    $storage = new FileStorage(__DIR__ . '/../../data');
    $logger = new ConsentLogger($storage);
    
    // Get statistics for last 30 days
    $stats = $logger->getStats(30);
    
    // Get recent logs
    $recentLogs = $logger->getLogs(5);
    
    $response = [
        'success' => true,
        'total' => $stats['total'] ?? 0,
        'acceptedAll' => $stats['acceptedAll'] ?? 0,
        'rejectedAll' => $stats['rejectedAll'] ?? 0,
        'customized' => $stats['customized'] ?? 0,
        'byCategory' => $stats['byCategory'] ?? [],
        'byDay' => $stats['byDay'] ?? [],
        'recentLogs' => $recentLogs
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load statistics',
        'message' => $e->getMessage()
    ]);
}
