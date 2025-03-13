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
// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer los datos JSON enviados desde el frontend
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar que se enviaron los campos necesarios
    if (!isset($input['id']) || !isset($input['name']) || !isset($input['address']) || !isset($input['phone']) || !isset($input['type'])) {
        echo json_encode(["status" => "error", "message" => "Faltan datos necesarios"]);
        exit();
    }

    // Sanitizar los datos recibidos
    $id = intval($input['id']);
    $name = $conn->real_escape_string($input['name']);
    $address = $conn->real_escape_string($input['address']);
    $phone = $conn->real_escape_string($input['phone']);
    $type = intval($input['type']);

    // Actualizar la información del cliente
    $query = "UPDATE customers SET name = ?, address = ?, phone = ?, type = ?, updated_at = NOW() WHERE id = ? AND is_active = 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssii", $name, $address, $phone, $type, $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Cliente actualizado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar cliente"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Método HTTP no permitido"]);
}

// Cerrar la conexión
$conn->close();
