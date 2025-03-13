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
    // Leer los datos JSON enviados desde el frontend
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar que se enviaron los campos necesarios
    if (!isset($input['name']) || !isset($input['address']) || !isset($input['phone']) || !isset($input['type'])) {
        echo json_encode(["status" => "error", "message" => "Faltan datos necesarios"]);
        exit();
    }

    // Sanitizar los datos recibidos
    $name = $conn->real_escape_string($input['name']);
    $address = $conn->real_escape_string($input['address']);
    $phone = $conn->real_escape_string($input['phone']);
    $type = intval($input['type']);

    // Definir valores predeterminados
    $is_active = 1; // Siempre activo
    $created_at = date("Y-m-d H:i:s");
    $updated_at = $created_at;

    // Insertar la información del cliente
    $query = "INSERT INTO customers (name, company_name, address, phone, type, is_active, created_at, updated_at) 
              VALUES (?, NULL, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssiiss", $name, $address, $phone, $type, $is_active, $created_at, $created_at);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Cliente agregado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al agregar cliente"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Método HTTP no permitido"]);
}

// Cerrar la conexión
$conn->close();
