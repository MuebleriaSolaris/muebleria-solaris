<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Check for a valid user ID in the query parameters
if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit();
}

$userId = $_GET['id'];

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

// Database connection
$db = new Database();
$conn = $db->getConnection();

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit();
}

// Prepare the SQL statement to fetch user data
$stmt = $conn->prepare("SELECT name, username, email, company_name, address, phone, role FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

// Check if the user was found
if ($result->num_rows > 0) {
    // Fetch user data
    $user = $result->fetch_assoc();
    echo json_encode($user, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} else {
    echo json_encode(["status" => "error", "message" => "User not found"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// Close connections
$stmt->close();
$conn->close();
