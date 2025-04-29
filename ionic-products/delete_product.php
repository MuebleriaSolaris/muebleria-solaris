<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

// Inicializar statements
$stmtIndex = $stmtInventory = $stmtProducts = null;

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['product_id'])) {
        throw new Exception("ID de producto requerido");
    }

    $product_id = intval($data['product_id']);

    // Verificar primero si el producto existe
    $sqlCheck = "SELECT id FROM products WHERE id = ? LIMIT 1";
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("i", $product_id);
    $stmtCheck->execute();
    
    if ($stmtCheck->get_result()->num_rows === 0) {
        throw new Exception("No se encontró el producto con ID: $product_id");
    }
    $stmtCheck->close();

    // Iniciar transacción
    $conn->begin_transaction();

    // 1. Eliminar de index_inventory primero (relación)
    $sqlIndex = "DELETE FROM index_inventory WHERE product_id = ?";
    $stmtIndex = $conn->prepare($sqlIndex);
    $stmtIndex->bind_param("i", $product_id);
    $stmtIndex->execute();

    // 2. Eliminar de inventory
    $sqlInventory = "DELETE FROM inventory WHERE id_product = ?";
    $stmtInventory = $conn->prepare($sqlInventory);
    $stmtInventory->bind_param("i", $product_id);
    $stmtInventory->execute();

    // 3. Finalmente eliminar de products
    $sqlProducts = "DELETE FROM products WHERE id = ?";
    $stmtProducts = $conn->prepare($sqlProducts);
    $stmtProducts->bind_param("i", $product_id);
    $stmtProducts->execute();

    if ($stmtProducts->affected_rows === 0) {
        throw new Exception("No se pudo eliminar el producto (posiblemente ya fue eliminado)");
    }

    // Confirmar transacción
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Producto eliminado completamente",
        "product_id" => $product_id
    ]);

} catch (Exception $e) {
    // Revertir en caso de error
    if ($conn && $conn->errno) {
        $conn->rollback();
    }
    
    http_response_code(404); // 404 para "no encontrado"
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "product_id" => isset($product_id) ? $product_id : null
    ]);
} finally {
    // Cerrar statements y conexión en orden inverso
    if ($stmtIndex) $stmtIndex->close();
    if ($stmtInventory) $stmtInventory->close();
    if ($stmtProducts) $stmtProducts->close();
    if ($conn) $conn->close();
}