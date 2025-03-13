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
    // Obtener parámetros de búsqueda
    $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;
    $search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';

    // Consulta SQL base
    $sql = "
        SELECT 
            products.id AS product_id,
            products.name AS product_name,
            products.credit_price AS credit_price,
            products.updated_at AS updated_at,
            inventory.current_amount AS current_stock,
            inventory.max_amount as max_amount,
            provedores.name AS provider_name,
            products.prov_price AS prov_price
        FROM 
            products
        INNER JOIN 
            inventory
        ON 
            products.id = inventory.id_product
        INNER JOIN 
            provedores
        ON 
            products.id_proveedor = provedores.id
    ";

    // Si se proporciona `product_id`, filtrar por ID
    if (!empty($product_id)) {
        $sql .= " WHERE products.id = ?";
    } elseif (!empty($search)) {
        // Si se proporciona `search`, agregar condición de búsqueda
        $sql .= " WHERE 
            products.id LIKE '%$search%' OR 
            products.name LIKE '%$search%' OR 
            provedores.name LIKE '%$search%'";
    }

    $stmt = $conn->prepare($sql);

    // Vincular parámetro si es necesario
    if (!empty($product_id)) {
        $stmt->bind_param('i', $product_id);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $row['product_name'] = htmlspecialchars($row['product_name'], ENT_QUOTES, 'UTF-8');
            $row['provider_name'] = htmlspecialchars($row['provider_name'], ENT_QUOTES, 'UTF-8');
            $data[] = $row;
        }

        echo json_encode([
            "success" => true,
            "data" => $data
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode([
            "success" => true,
            "data" => []
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    if ($stmt) {
        $stmt->close();
    }
    if ($conn) {
        $db->closeConnection();
    }
}
?>
