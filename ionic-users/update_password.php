<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Habilitar logging para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Archivo de log
$logFile = __DIR__ . '/password_update_errors.log';
file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] Inicio de solicitud\n", FILE_APPEND);

try {
    // Registrar input recibido
    $rawInput = file_get_contents('php://input');
    file_put_contents($logFile, "Raw input: " . $rawInput . "\n", FILE_APPEND);
    
    $input = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }

    // Validar datos requeridos
    $requiredFields = ['user_id', 'new_password', 'platform', 'column_name'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field])) {  // Corregí el paréntesis faltante aquí
            throw new Exception("Campo requerido faltante: $field");
        }
    }

    $user_id = (int)$input['user_id'];
    $new_password = $input['new_password'];
    $platform = $input['platform'];
    $column_name = $input['column_name'];

    // Validar combinaciones plataforma/columna
    $validCombinations = [
        'web' => 'password',
        'android' => 'android_pass',
        'ios' => 'pass_appcom'
    ];

    if (!isset($validCombinations[$platform])) {  // Corregí el paréntesis faltante aquí
        throw new Exception("Plataforma no válida");
    }

    if ($validCombinations[$platform] !== $column_name) {
        throw new Exception("Inconsistencia entre plataforma ($platform) y columna ($column_name)");
    }

    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    if (!$conn) {
        throw new Exception("No se pudo conectar a la base de datos");
    }

    // Encriptar nueva contraseña
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    file_put_contents($logFile, "Hash generado: $hashed_password\n", FILE_APPEND);

    // Preparar consulta
    $query = "UPDATE users SET $column_name = ? WHERE id = ?";
    file_put_contents($logFile, "Consulta SQL: $query\n", FILE_APPEND);
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta: " . $conn->error);
    }
    
    $stmt->bind_param("si", $hashed_password, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar consulta: " . $stmt->error);
    }

    $response = [
        "status" => "success",
        "message" => "Contraseña $platform actualizada correctamente",
        "platform" => $platform
    ];

} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    file_put_contents($logFile, "ERROR: $errorMsg\n", FILE_APPEND);
    
    http_response_code(500);
    $response = [
        "status" => "error",
        "message" => $errorMsg,
        "platform" => $platform ?? 'unknown'
    ];
} finally {
    echo json_encode($response);
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] Fin de solicitud\n\n", FILE_APPEND);
}