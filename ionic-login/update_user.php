<?php
// Configuración estricta de headers
header_remove();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Buffer de salida
ob_start();

// Respuesta JSON
$response = [
    'status' => 'error',
    'message' => 'Error desconocido',
    'updated' => false,
    'userId' => null
];

try {
    // Manejar preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }

    // Validar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        throw new Exception("Método no permitido", 405);
    }

    // Validar ID
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("ID de usuario no válido", 400);
    }
    $userId = (int)$_GET['id'];

    // Obtener datos JSON
    $json = file_get_contents('php://input');
    if (empty($json)) {
        throw new Exception("Datos no proporcionados", 400);
    }
    
    $inputData = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido", 400);
    }

    // Validar campos requeridos
    if (!isset($inputData['name']) || !isset($inputData['username'])) {
        throw new Exception("Faltan campos requeridos", 400);
    }

    // Conexión a la base de datos
    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");
    
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos", 500);
    }

    // Consulta preparada
    $stmt = $conn->prepare("UPDATE users SET name = ?, username = ? WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta", 500);
    }

    $stmt->bind_param("ssi", $inputData['name'], $inputData['username'], $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la actualización", 500);
    }

    $response = [
        'status' => 'success',
        'message' => 'Usuario actualizado correctamente',
        'updated' => ($stmt->affected_rows > 0),
        'userId' => $userId,
        'changes' => [ // Incluir los cambios realizados
            'name' => $inputData['name'],
            'username' => $inputData['username']
        ]
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