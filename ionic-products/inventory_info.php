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

try {
    // Parámetros de búsqueda
    $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;
    $search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
    $sub_category_id = isset($_GET['sub_category_id']) ? intval($_GET['sub_category_id']) : null;

    // Consulta SQL simplificada
    $sql = "
        SELECT
            p.image as image_url,
            p.id AS product_id,
            p.name AS product_name,
            p.credit_price AS credit_price,
            p.updated_at AS updated_at,
            i.current_amount AS current_stock,
            i.max_amount as max_amount,
            pr.name AS provider_name,
            p.prov_price AS prov_price,
            p.category_id as category_id,
            p.sub_category_id as sub_category_id,
            ii.position_index,
            ii.global_position,
            i.hide_product as hide_product
        FROM 
            products p
        INNER JOIN 
            inventory i ON p.id = i.id_product
        INNER JOIN 
            provedores pr ON p.id_proveedor = pr.id
        LEFT JOIN
            index_inventory ii ON p.id = ii.product_id
    ";

    $where = [];
    $params = [];
    $types = '';

    // Filtros básicos
    if (!empty($product_id)) {
        $where[] = "p.id = ?";
        $params[] = $product_id;
        $types .= 'i';
    }

    if (!empty($search)) {
        $where[] = "(p.id LIKE CONCAT('%', ?, '%') OR 
                    p.name LIKE CONCAT('%', ?, '%') OR 
                    pr.name LIKE CONCAT('%', ?, '%'))";
        $params = array_merge($params, [$search, $search, $search]);
        $types .= 'sss';
    }

    if (!empty($sub_category_id)) {
        $where[] = "p.sub_category_id = ?";
        $params[] = $sub_category_id;
        $types .= 'i';
    }

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    // Ordenamiento simplificado
    $sql .= " ORDER BY ";
    if (!empty($sub_category_id)) {
        $sql .= "ii.position_index IS NULL, ii.position_index ASC"; // Primero los no nulos, luego orden ascendente
    } else {
        $sql .= "ii.global_position IS NULL, ii.global_position ASC"; // Primero los no nulos, luego orden ascendente
    }

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        // Asegurar valores numéricos o null para las posiciones
        $row['position_index'] = isset($row['position_index']) ? (int)$row['position_index'] : null;
        $row['global_position'] = isset($row['global_position']) ? (int)$row['global_position'] : null;
        $row['hide_product'] = isset($row['hide_product']) ? (int)$row['hide_product'] : 0; // Valor por defecto 0
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $data,
        "debug_info" => [
            "position_stats" => [
                "with_position_index" => count(array_filter($data, fn($item) => $item['position_index'] !== null)),
                "with_global_position" => count(array_filter($data, fn($item) => $item['global_position'] !== null))
            ]
        ]
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