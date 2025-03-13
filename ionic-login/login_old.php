<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

// Database connection
$db = new Database();
$conn = $db->getConnection();

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

// Capture JSON input
$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'];
$password = $input['password'];

// Retrieve the user ID, role, and hashed password from the database
$stmt = $conn->prepare("SELECT id, role, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Use password_verify to compare the entered password with the hashed password
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "role" => $user['role'],
            "userId" => $user['id'] // Include user ID in the response
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode(["status" => "fail", "message" => "Invalid credentials"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "Invalid credentials"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// Close connections
$stmt->close();
$conn->close();
?>