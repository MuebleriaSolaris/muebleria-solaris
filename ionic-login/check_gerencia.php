<?php
// Desactivar visualización de errores EN PRODUCCIÓN (pero registrarlos)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Buffer de salida para capturar posibles errores
ob_start();

try {
    require_once __DIR__ . '/../ionic-database/Database.php';
    
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");
    
    if (!$conn) {
        throw new Exception("Error de conexión a la base de datos");
    }

    $user_id = isset($_GET['userid']) ? intval($_GET['userid']) : null;

    if (!$user_id) {
        throw new Exception("Falta el parámetro user_id");
    }

    $sql = "SELECT gerencia FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $response = [
            "success" => true,
            "isGerente" => $row['gerencia'] == 1
        ];
    } else {
        throw new Exception("Usuario no encontrado");
    }

} catch (Exception $e) {
    error_log("Error en check_gerencia: " . $e->getMessage());
    $response = [
        "success" => false,
        "error" => $e->getMessage()
    ];
} finally {
    // Limpiar buffer y enviar solo JSON
    ob_end_clean();
    echo json_encode($response ?? ["success" => false, "error" => "Error desconocido"]);
    
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->closeConnection();
    exit();
}