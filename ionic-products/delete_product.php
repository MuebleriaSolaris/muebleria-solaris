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

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['product_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "ID de producto requerido"
        ]);
        exit;
    }

    $product_id = $data['product_id'];

    // Iniciar transacción
    $conn->begin_transaction();

    // 1. Eliminar de inventory
    $sqlInventory = "DELETE FROM inventory WHERE id_product = ?";
    $stmtInventory = $conn->prepare($sqlInventory);
    $stmtInventory->bind_param("i", $product_id);
    $stmtInventory->execute();

    // 2. Eliminar de products
    $sqlProducts = "DELETE FROM products WHERE id = ?";
    $stmtProducts = $conn->prepare($sqlProducts);
    $stmtProducts->bind_param("i", $product_id);
    $stmtProducts->execute();

    // Confirmar transacción
    $conn->commit();

    if ($stmtProducts->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Producto eliminado completamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el producto"
        ]);
    }

    $stmtInventory->close();
    $stmtProducts->close();
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error al eliminar: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}