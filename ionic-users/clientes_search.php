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

$searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$perPage = 10;
$offset = ($page - 1) * $perPage;

if (empty($searchTerm)) {
    echo json_encode(['data' => [], 'total' => 0, 'current_page' => 1, 'per_page' => $perPage]);
    exit();
}

// Dividir el término de búsqueda en palabras individuales
$searchWords = explode(' ', $searchTerm);
$searchWords = array_filter($searchWords);

// Consulta para obtener el conteo total
$countSql = "SELECT COUNT(*) as total FROM (
    SELECT c.id
    FROM customers c
    LEFT JOIN customer_changes cc ON c.id = cc.id_customer AND cc.phone IS NOT NULL
    WHERE c.is_active = 1 AND (";
    
$countConditions = [];
$countParams = [];
$countParamTypes = '';

foreach ($searchWords as $word) {
    $countConditions[] = "(c.name COLLATE utf8mb4_unicode_ci LIKE ? OR 
                         c.address COLLATE utf8mb4_unicode_ci LIKE ? OR 
                         c.phone COLLATE utf8mb4_unicode_ci LIKE ?)";
    $countParams[] = "%$word%";
    $countParams[] = "%$word%";
    $countParams[] = "%$word%";
    $countParamTypes .= 'sss';
}

$countSql .= implode(' AND ', $countConditions);
$countSql .= ")
    UNION
    SELECT c.id
    FROM customers c
    JOIN customer_changes cc ON c.id = cc.id_customer
    WHERE c.is_active = 1 AND cc.phone IS NOT NULL AND cc.phone LIKE ?
) AS combined_results";

$countParams[] = "%$searchTerm%";
$countParamTypes .= 's';

$countStmt = $conn->prepare($countSql);
$countStmt->bind_param($countParamTypes, ...$countParams);
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalCount = $countResult->fetch_assoc()['total'];
$countStmt->close();

// Consulta principal con paginación
$sql = "SELECT 
            c.id,
            c.name,
            c.address,
            c.phone,
            c.type,
            CASE WHEN cc.id IS NOT NULL THEN 1 ELSE 0 END AS has_pending_changes
        FROM customers c
        LEFT JOIN customer_changes cc ON c.id = cc.id_customer AND cc.phone IS NOT NULL
        WHERE c.is_active = 1 AND (";

$conditions = [];
$params = [];
$paramTypes = '';

foreach ($searchWords as $word) {
    $conditions[] = "(c.name COLLATE utf8mb4_unicode_ci LIKE ? OR 
                     c.address COLLATE utf8mb4_unicode_ci LIKE ? OR 
                     c.phone COLLATE utf8mb4_unicode_ci LIKE ?)";
    $params[] = "%$word%";
    $params[] = "%$word%";
    $params[] = "%$word%";
    $paramTypes .= 'sss';
}

$sql .= implode(' AND ', $conditions);
$sql .= ") 
        UNION
        SELECT 
            c.id,
            c.name,
            c.address,
            c.phone,
            c.type,
            1 AS has_pending_changes
        FROM customers c
        JOIN customer_changes cc ON c.id = cc.id_customer
        WHERE c.is_active = 1 AND cc.phone IS NOT NULL AND cc.phone LIKE ?
        ORDER BY id DESC
        LIMIT ?, ?";

$params[] = "%$searchTerm%";
$paramTypes .= 'sii';
$params[] = $offset;
$params[] = $perPage;

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Error en la preparación de la consulta: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param($paramTypes, ...$params);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

foreach ($data as &$customer) {
    $customer['has_pending_changes'] = (bool)$customer['has_pending_changes'];
}

echo json_encode([
    'data' => $data,
    'total' => $totalCount,
    'current_page' => $page,
    'per_page' => $perPage
], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>