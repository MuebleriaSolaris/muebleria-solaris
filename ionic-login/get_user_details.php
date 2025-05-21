<?php
// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Buffer de salida
ob_start();

$response = [
    'status' => 'error',
    'message' => 'Error desconocido',
    'data' => null
];

try {
    // Validar ID de usuario - FORMA CORRECTA
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception("ID de usuario no proporcionado");
    }

    $userId = (int)$_GET['id'];
    if ($userId <= 0) {
        throw new Exception("ID de usuario inválido");
    }

    // Conexión a la base de datos
    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Consulta preparada
    $stmt = $conn->prepare("SELECT id, name, username, email, company_name, address, phone, role FROM users WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Usuario no encontrado");
    }

    // Obtener datos
    $user = $result->fetch_assoc();
    
    $response = [
        'status' => 'success',
        'data' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'username' => $user['username'],
            'email' => $user['email'],
            'company' => $user['company_name'] ?? null,
            'address' => $user['address'] ?? null,
            'phone' => $user['phone'] ?? null,
            'role' => (int)$user['role']
        ]
    ];

} catch (Exception $e) {
    error_log("Error en get_user_details.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
    
} finally {
    // Limpiar buffer y enviar respuesta
    ob_end_clean();
    
    // Cerrar conexiones
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->closeConnection();
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

