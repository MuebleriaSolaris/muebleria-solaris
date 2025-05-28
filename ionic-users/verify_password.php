<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Habilitar logging de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log file
$logFile = __DIR__ . '/password_verify_errors.log';
file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] Inicio de solicitud\n", FILE_APPEND);

try {
    // Registrar raw input para depuración
    $rawInput = file_get_contents('php://input');
    file_put_contents($logFile, "Raw input: " . $rawInput . "\n", FILE_APPEND);
    
    $input = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }

    // Validar datos de entrada
    $requiredFields = ['user_id', 'password', 'platform'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Campo requerido faltante: $field");
        }
    }

    $user_id = (int)$input['user_id'];
    $password = $input['password'];
    $platform = $input['platform'];

    // Validar plataforma
    $validPlatforms = ['web', 'android', 'ios'];
    if (!in_array($platform, $validPlatforms)) {
        throw new Exception("Plataforma no válida. Use: web, android o ios");
    }

    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    if (!$conn) {
        throw new Exception("No se pudo conectar a la base de datos");
    }

    // Mapeo de columnas
    $columnMap = [
        'web' => 'password',
        'android' => 'android_pass',
        'ios' => 'pass_appcom'
    ];
    
    $passwordColumn = $columnMap[$platform];
    $query = "SELECT $passwordColumn FROM users WHERE id = ?";
    
    file_put_contents($logFile, "Preparando consulta: $query\n", FILE_APPEND);

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $user_id);
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Usuario no encontrado");
    }

    $user = $result->fetch_assoc();
    $storedHash = $user[$passwordColumn];
    
    file_put_contents($logFile, "Hash almacenado: $storedHash\n", FILE_APPEND);

    // Verificar contraseña
    $verificationResult = password_verify($password, $storedHash);
    file_put_contents($logFile, "Resultado verificación: " . ($verificationResult ? 'true' : 'false') . "\n", FILE_APPEND);

    $response = [
        "status" => $verificationResult ? "success" : "error",
        "platform" => $platform,
        "message" => $verificationResult ? "Contraseña verificada correctamente" : "Contraseña incorrecta"
    ];

    echo json_encode($response);

} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    file_put_contents($logFile, "ERROR: $errorMsg\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $errorMsg,
        "platform" => $platform ?? 'unknown'
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] Fin de solicitud\n\n", FILE_APPEND);
}