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

// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer los datos JSON enviados
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar que se envió el ID del cliente
    if (!isset($input['id'])) {
        echo json_encode(["status" => "error", "message" => "ID del cliente no proporcionado"]);
        exit();
    }

    $id = intval($input['id']);

    // Eliminar el cliente
    $query = "DELETE FROM customers WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Cliente eliminado exitosamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al eliminar cliente"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Método HTTP no permitido"]);
}

// Cerrar la conexión
$conn->close();
