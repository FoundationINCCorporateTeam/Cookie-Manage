<?php
/**
 * FileStorage Class
 * 
 * Provides safe, atomic file operations for JSON data storage.
 * Implements file locking to prevent race conditions.
 */
class FileStorage {
    private $basePath;
    
    public function __construct($basePath = __DIR__ . '/../../data') {
        $this->basePath = realpath($basePath) ?: $basePath;
    }
    
    /**
     * Read JSON file with lock
     * 
     * @param string $path Relative path from base
     * @param bool $associative Return as associative array
     * @return mixed Decoded JSON data
     * @throws Exception If file cannot be read
     */
    public function read($path, $associative = true) {
        $fullPath = $this->resolvePath($path);
        
        if (!file_exists($fullPath)) {
            throw new Exception("File not found: $path");
        }
        
        $handle = fopen($fullPath, 'r');
        if ($handle === false) {
            throw new Exception("Cannot open file: $path");
        }
        
        // Acquire shared lock for reading
        if (!flock($handle, LOCK_SH)) {
            fclose($handle);
            throw new Exception("Cannot lock file for reading: $path");
        }
        
        $content = stream_get_contents($handle);
        
        // Release lock
        flock($handle, LOCK_UN);
        fclose($handle);
        
        $data = json_decode($content, $associative);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON in file: $path - " . json_last_error_msg());
        }
        
        return $data;
    }
    
    /**
     * Write JSON file atomically with lock
     * 
     * @param string $path Relative path from base
     * @param mixed $data Data to encode as JSON
     * @param int $options JSON encode options
     * @return bool Success status
     * @throws Exception If write fails
     */
    public function write($path, $data, $options = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) {
        $fullPath = $this->resolvePath($path);
        $dir = dirname($fullPath);
        
        // Ensure directory exists
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new Exception("Cannot create directory: $dir");
            }
        }
        
        $json = json_encode($data, $options);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON encode error: " . json_last_error_msg());
        }
        
        // Write to temporary file first
        $tempPath = $fullPath . '.tmp.' . uniqid();
        
        $handle = fopen($tempPath, 'w');
        if ($handle === false) {
            throw new Exception("Cannot create temporary file: $tempPath");
        }
        
        // Acquire exclusive lock for writing
        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            unlink($tempPath);
            throw new Exception("Cannot lock file for writing: $path");
        }
        
        $written = fwrite($handle, $json);
        
        // Release lock
        flock($handle, LOCK_UN);
        fclose($handle);
        
        if ($written === false) {
            unlink($tempPath);
            throw new Exception("Cannot write to file: $path");
        }
        
        // Atomic rename
        if (!rename($tempPath, $fullPath)) {
            unlink($tempPath);
            throw new Exception("Cannot rename temporary file: $path");
        }
        
        return true;
    }
    
    /**
     * Append line to JSONL file (for consent logs)
     * 
     * @param string $path Relative path from base
     * @param mixed $data Data to encode as JSON (single line)
     * @return bool Success status
     * @throws Exception If append fails
     */
    public function append($path, $data) {
        $fullPath = $this->resolvePath($path);
        $dir = dirname($fullPath);
        
        // Ensure directory exists
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new Exception("Cannot create directory: $dir");
            }
        }
        
        $json = json_encode($data, JSON_UNESCAPED_SLASHES);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON encode error: " . json_last_error_msg());
        }
        
        $handle = fopen($fullPath, 'a');
        if ($handle === false) {
            throw new Exception("Cannot open file for appending: $path");
        }
        
        // Acquire exclusive lock
        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            throw new Exception("Cannot lock file for appending: $path");
        }
        
        $written = fwrite($handle, $json . PHP_EOL);
        
        // Release lock
        flock($handle, LOCK_UN);
        fclose($handle);
        
        if ($written === false) {
            throw new Exception("Cannot write to file: $path");
        }
        
        return true;
    }
    
    /**
     * Read JSONL file (one JSON object per line)
     * 
     * @param string $path Relative path from base
     * @param int $limit Maximum number of lines to read (0 = all)
     * @param int $offset Offset to start reading from
     * @return array Array of decoded objects
     * @throws Exception If file cannot be read
     */
    public function readLines($path, $limit = 0, $offset = 0) {
        $fullPath = $this->resolvePath($path);
        
        if (!file_exists($fullPath)) {
            return [];
        }
        
        $handle = fopen($fullPath, 'r');
        if ($handle === false) {
            throw new Exception("Cannot open file: $path");
        }
        
        // Acquire shared lock
        if (!flock($handle, LOCK_SH)) {
            fclose($handle);
            throw new Exception("Cannot lock file for reading: $path");
        }
        
        $lines = [];
        $lineNum = 0;
        
        while (($line = fgets($handle)) !== false) {
            if ($lineNum >= $offset) {
                $trimmed = trim($line);
                if (!empty($trimmed)) {
                    $decoded = json_decode($trimmed, true);
                    if ($decoded !== null) {
                        $lines[] = $decoded;
                        
                        if ($limit > 0 && count($lines) >= $limit) {
                            break;
                        }
                    }
                }
            }
            $lineNum++;
        }
        
        // Release lock
        flock($handle, LOCK_UN);
        fclose($handle);
        
        return $lines;
    }
    
    /**
     * Check if file exists
     * 
     * @param string $path Relative path from base
     * @return bool
     */
    public function exists($path) {
        return file_exists($this->resolvePath($path));
    }
    
    /**
     * Delete file
     * 
     * @param string $path Relative path from base
     * @return bool Success status
     */
    public function delete($path) {
        $fullPath = $this->resolvePath($path);
        
        if (!file_exists($fullPath)) {
            return true;
        }
        
        return unlink($fullPath);
    }
    
    /**
     * Resolve relative path to full path
     * 
     * @param string $path Relative path
     * @return string Full path
     */
    private function resolvePath($path) {
        // Remove leading slash if present
        $path = ltrim($path, '/');
        return $this->basePath . '/' . $path;
    }
    
    /**
     * Get base path
     * 
     * @return string
     */
    public function getBasePath() {
        return $this->basePath;
    }
}
