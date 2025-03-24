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

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "No se pudo conectar a la base de datos."]);
    exit;
}

// Obtener el siguiente ID disponible
$query = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'muebxner_solaris' AND TABLE_NAME = 'products'";
$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Error al preparar la consulta: " . $conn->error]);
    exit;
}

// Ejecutar la consulta
if ($stmt->execute()) {
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $next_id = $row['AUTO_INCREMENT'];
    echo json_encode(["status" => "success", "next_id" => $next_id]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al obtener el siguiente ID: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>