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

// Establecer la codificación de caracteres
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión: " . $conn->connect_error]);
    exit();
}

$searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';

if (empty($searchTerm)) {
    echo json_encode(['data' => []]); // Si no hay término de búsqueda, devolver un array vacío
    exit();
}

// Dividir el término de búsqueda en palabras individuales
$searchWords = explode(' ', $searchTerm);
$searchWords = array_filter($searchWords); // Eliminar palabras vacías

// Construir la consulta SQL
$sql = "SELECT 
            id,
            name,
            address,
            phone,
            type
        FROM customers
        WHERE is_active = 1 AND (";

// Añadir condiciones para cada palabra en el término de búsqueda
$conditions = [];
$params = [];
$paramTypes = '';

foreach ($searchWords as $word) {
    $conditions[] = "(name COLLATE utf8mb4_unicode_ci LIKE ? OR 
                      address COLLATE utf8mb4_unicode_ci LIKE ? OR 
                      phone COLLATE utf8mb4_unicode_ci LIKE ?)";
    $params[] = "%$word%";
    $params[] = "%$word%";
    $params[] = "%$word%";
    $paramTypes .= 'sss'; // Cada palabra necesita tres parámetros
}

$sql .= implode(' AND ', $conditions); // Unir las condiciones con AND
$sql .= ") ORDER BY id DESC LIMIT 20"; // Ordenar por ID y limitar a 20 registros

// Preparar la consulta
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Error en la preparación de la consulta: " . $conn->error]);
    $conn->close();
    exit();
}

// Vincular los parámetros dinámicamente
if (!empty($params)) {
    $stmt->bind_param($paramTypes, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
