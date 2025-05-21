<?php
// Desactivar visualización de errores en producción (pero registrarlos)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET");

// Iniciar buffer de salida
ob_start();

try {
    // Validar ID de usuario
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception("User ID is required");
    }

    $userId = intval($_GET['id']);

    // Cargar conexión a la base de datos
    require_once __DIR__ . '/../ionic-database/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Preparar y ejecutar consulta
    $stmt = $conn->prepare("SELECT name, username, email, company_name, address, phone, role FROM users WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("User not found");
    }

    $user = $result->fetch_assoc();
    $response = [
        'status' => 'success',
        'data' => $user
    ];

} catch (Exception $e) {
    error_log("Error in login_usuario.php: " . $e->getMessage());
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
} finally {
    // Limpiar buffer y enviar respuesta JSON
    ob_end_clean();
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // Cerrar conexiones
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->closeConnection();
    exit();
}