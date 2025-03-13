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

// Consulta SQL para obtener los registros más recientes por name y phone, ordenados por id DESC
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
          ) AS latest ON c.id = latest.max_id
          WHERE c.is_active = 1
          ORDER BY c.id DESC LIMIT 100"; // Ordenar por id en orden descendente

$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $clientes = [];
    while ($row = $result->fetch_assoc()) {
        $clientes[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $clientes], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["status" => "error", "message" => "No se encontraron clientes activos o error en la consulta"]);
}

$conn->close();
?>