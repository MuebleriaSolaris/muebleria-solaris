<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

try {
    // Manejar preflight CORS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Solo permitir método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "error" => "Método no permitido. Use POST"
        ]);
        exit();
    }

    // Obtener datos del cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "JSON inválido en el cuerpo de la solicitud"
        ]);
        exit();
    }

    // Validar parámetros requeridos
    if (!isset($input['product_id']) || !isset($input['hide_product'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Se requieren product_id y hide_product"
        ]);
        exit();
    }

    $product_id = intval($input['product_id']);
    $hide_product = intval($input['hide_product']);

    // Validar valores
    if ($product_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "ID de producto inválido"
        ]);
        exit();
    }

    if ($hide_product !== 0 && $hide_product !== 1) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "hide_product debe ser 0 (visible) o 1 (oculto)"
        ]);
        exit();
    }

    // Consulta SQL para actualizar
    $sql = "UPDATE inventory SET hide_product = ? WHERE id_product = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->bind_param("ii", $hide_product, $product_id);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "error" => "Producto no encontrado o sin cambios"
        ]);
        exit();
    }

    // Respuesta exitosa
    echo json_encode([
        "success" => true,
        "message" => "Visibilidad del producto actualizada",
        "product_id" => $product_id,
        "hide_product" => $hide_product
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    if (isset($stmt)) $stmt->close();
    $db->closeConnection();
}
?>