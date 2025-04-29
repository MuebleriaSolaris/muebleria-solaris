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

// Crear instancia de la clase Database
$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

try {
    // Obtener `provider_id` desde los parámetros
    $provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : null;

    // Validar que el `provider_id` esté presente
    if (empty($provider_id)) {
        echo json_encode([
            "success" => false,
            "error" => "El parámetro provider_id es requerido."
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Consulta SQL actualizada para incluir hide_product
    $sql = "
        SELECT 
            products.id AS product_id,
            products.name AS product_name,
            inventory.current_amount AS current_stock,
            inventory.max_amount AS max_amount,
            products.credit_price AS credit_price,
            inventory.last_updated AS updated_at,
            provedores.name AS provider_name,
            inventory.hide_product AS hide_product
        FROM 
            inventory
        INNER JOIN 
            products ON products.id = inventory.id_product
        INNER JOIN
            provedores ON products.id_proveedor = provedores.id
        WHERE 
            products.id_proveedor = ?
    ";

    // Preparar y ejecutar la consulta
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $provider_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Procesar los resultados
    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                "product_id" => $row["product_id"],
                "product_name" => htmlspecialchars($row["product_name"], ENT_QUOTES, 'UTF-8'),
                "current_stock" => (int)$row["current_stock"],
                "max_amount" => (int)$row["max_amount"],
                "credit_price" => (float)$row["credit_price"],
                "updated_at" => $row["updated_at"],
                "provider_name" => $row["provider_name"],
                "hide_product" => (int)$row["hide_product"] // Asegurar que es integer
            ];
        }

        echo json_encode([
            "success" => true,
            "data" => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode([
            "success" => true,
            "data" => []
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    // Cerrar recursos
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>