<?php
header("Content-Type: application/json; charset=utf-8");
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

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión: " . $conn->connect_error]);
    exit();
}

// Parámetros de paginación
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$perPage = 10;
$offset = ($page - 1) * $perPage;

// Consulta para el conteo total exacto
$countQuery = "SELECT COUNT(*) as total 
               FROM (
                   SELECT MAX(id) as max_id
                   FROM customers
                   WHERE is_active = 1
                   GROUP BY name, phone
               ) as derived_table";
$countResult = $conn->query($countQuery);
$totalCount = $countResult->fetch_assoc()['total'];

// Consulta principal con paginación
$query = "SELECT 
            c.id,
            c.name,
            c.address,
            c.phone,
            c.type
          FROM customers c
          INNER JOIN (
              SELECT 
                  name,
                  phone,
                  MAX(id) AS max_id
              FROM customers
              WHERE is_active = 1
              GROUP BY name, phone
              ORDER BY max_id DESC
              LIMIT ?, ?
          ) AS latest ON c.id = latest.max_id
          WHERE c.is_active = 1
          ORDER BY c.id DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $offset, $perPage);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $clientes = [];
    while ($row = $result->fetch_assoc()) {
        $clientes[] = $row;
    }
    echo json_encode([
        "status" => "success", 
        "data" => $clientes,
        "total" => $totalCount,
        "current_page" => $page,
        "per_page" => $perPage
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["status" => "success", "data" => [], "total" => $totalCount]);
}

$stmt->close();
$conn->close();
?>