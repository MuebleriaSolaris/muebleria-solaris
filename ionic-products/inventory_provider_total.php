<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

try {
    // Consulta para obtener productos con inventario
    $sql = "
        SELECT 
            products.id AS product_id,
            products.name AS product_name,
            products.prov_price AS prov_price,
            inventory.current_amount AS current_stock
        FROM 
            inventory
        INNER JOIN 
            products ON products.id = inventory.id_product
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    // Verificar si hay datos
    if ($result->num_rows > 0) {
        $data = [];
        $totalInventario = 0;

        while ($row = $result->fetch_assoc()) {
            // Multiplicación del stock por el precio
            $subtotal = floatval($row["prov_price"]) * intval($row["current_stock"]);
            $totalInventario += $subtotal;

            $data[] = [
                "product_id" => $row["product_id"],
                "product_name" => htmlspecialchars($row["product_name"], ENT_QUOTES, 'UTF-8'),
                "prov_price" => floatval($row["prov_price"]),
                "current_stock" => intval($row["current_stock"]),
                "subtotal" => $subtotal
            ];
        }

        echo json_encode([
            "success" => true,
            "total_inventario" => $totalInventario,
            "data" => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode(["success" => false, "message" => "No hay productos en inventario"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
} finally {
    $stmt->close();
    $conn->close();
}
?>
