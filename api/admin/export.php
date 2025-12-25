<?php
/**
 * Admin Export API
 * 
 * Exports consent logs as CSV
 */

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="consent-logs-' . date('Y-m-d') . '.csv"');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../src/php/FileStorage.php';
require_once __DIR__ . '/../../src/php/ConsentLogger.php';

try {
    $storage = new FileStorage(__DIR__ . '/../../data');
    $logger = new ConsentLogger($storage);
    
    // Get days parameter (0 = all)
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 0;
    
    // Export to CSV
    $csv = $logger->exportToCSV($days);
    
    echo $csv;
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Failed to export logs',
        'message' => $e->getMessage()
    ]);
}
