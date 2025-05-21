<?php
// Configuración estricta de headers
header_remove();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Buffer de salida
ob_start();

// Respuesta estándar
$response = [
    'status' => 'error',
    'message' => 'Error desconocido',
    'created' => false,
    'userId' => null
];

try {
    // Manejar preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }

    // Validar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    // Obtener y validar datos JSON
    $json = file_get_contents('php://input');
    if (empty($json)) {
        throw new Exception("Datos no proporcionados", 400);
    }
    
    $inputData = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido", 400);
    }

    // Validar campos requeridos
    $requiredFields = ['name', 'username', 'email', 'password', 'role'];
    foreach ($requiredFields as $field) {
        if (!isset($inputData[$field])) {
            throw new Exception("Falta el campo requerido: $field", 400);
        }
    }

    // Conexión a la base de datos
    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");
    
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos", 500);
    }

    // Preparar datos
    $name = $conn->real_escape_string($inputData['name']);
    $username = $conn->real_escape_string($inputData['username']);
    $email = $conn->real_escape_string($inputData['email']);
    $password = password_hash($inputData['password'], PASSWORD_BCRYPT);
    $role = $conn->real_escape_string($inputData['role']);
    $company_name = isset($inputData['company_name']) ? $conn->real_escape_string($inputData['company_name']) : null;
    $address = isset($inputData['address']) ? $conn->real_escape_string($inputData['address']) : null;
    $phone = isset($inputData['phone']) ? $conn->real_escape_string($inputData['phone']) : null;
    $remember_token = bin2hex(random_bytes(32));
    $created_at = date("Y-m-d H:i:s");

    // Consulta preparada
    $stmt = $conn->prepare("INSERT INTO users (
        name, username, email, company_name, address, phone, 
        role, password, remember_token, created_at, updated_at,
        android_pass, pass_appcom, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta", 500);
    }

    $stmt->bind_param(
        "sssssssssssss",
        $name, $username, $email, $company_name, $address, $phone,
        $role, $password, $remember_token, $created_at, $created_at,
        $password, $password
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error al crear usuario", 500);
    }

    $response = [
        'status' => 'success',
        'message' => 'Usuario creado correctamente',
        'created' => true,
        'userId' => $stmt->insert_id,
        'remember_token' => $remember_token
    ];
    
    $stmt->close();

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    $response['message'] = $e->getMessage();
    
} finally {
    // Limpiar buffer y asegurar salida JSON válida
    if (ob_get_length()) ob_end_clean();
    
    // Cerrar conexión sin generar warnings
    if (isset($db)) {
        @$db->closeConnection();
    }
    
    // Forzar salida JSON
    die(json_encode($response));
}