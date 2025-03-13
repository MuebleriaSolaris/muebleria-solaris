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

// Establecer la codificación de caracteres
$conn->set_charset("utf8mb4");

// Check for connection errors
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection error: " . $conn->connect_error]);
    exit();
}

// Check if 'id' parameter is provided
if (!isset($_GET['id'])) {
    echo json_encode(["status" => "error", "message" => "No customer ID provided"]);
    exit();
}

$customerId = intval($_GET['id']); // Get and sanitize the customer ID

// Prepare and execute the SQL query to fetch customer details
$query = "SELECT id, name, address, phone, type, updated_at FROM customers WHERE id = ? AND is_active = 1";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $customerId);
$stmt->execute();
$result = $stmt->get_result();

// Check if the customer exists and return their data
if ($result && $result->num_rows > 0) {
    $customer = $result->fetch_assoc();
    echo json_encode(["status" => "success", "data" => $customer],JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} else {
    echo json_encode(["status" => "error", "message" => "Customer not found or inactive"],JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// Close connections
$stmt->close();
$conn->close();
