<?php
/**
 * Admin Update Database API
 * 
 * Updates the cookie database from Open Cookie Database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../src/php/FileStorage.php';
require_once __DIR__ . '/../../src/php/CookieDatabase.php';

try {
    $storage = new FileStorage(__DIR__ . '/../../data');
    $db = new CookieDatabase($storage);
    
    // Force refresh of the database
    $success = $db->updateDatabase(true);
    
    if ($success) {
        $stats = $db->getStats();
        
        echo json_encode([
            'success' => true,
            'message' => 'Cookie database updated successfully',
            'stats' => $stats
        ]);
    } else {
        throw new Exception('Failed to update database');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update database',
        'message' => $e->getMessage()
    ]);
}
