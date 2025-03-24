<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Verificar si se recibió el ID del producto
if (!isset($_POST["product_id"])) {
    echo json_encode(["status" => "error", "message" => "El ID del producto no fue proporcionado.", "debug" => $_POST]);
    exit;
}

$product_id = $_POST["product_id"];

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

// Actualizar la columna `image` en la tabla `products` a NULL
$query = "UPDATE products SET image = NULL WHERE id = ?";
$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Error al preparar la consulta: " . $conn->error]);
    exit;
}

// Vincular parámetros
$stmt->bind_param("i", $product_id);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Imagen eliminada correctamente."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al actualizar la base de datos: " . $stmt->error]);
}

// Cerrar la declaración
$stmt->close();
$conn->close();
?>