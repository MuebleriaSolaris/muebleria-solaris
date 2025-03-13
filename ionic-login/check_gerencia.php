<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

// Validar si se recibe el id del usuario
$user_id = isset($_GET['userid']) ? intval($_GET['userid']) : null;

if (!$user_id) {
    echo json_encode(["success" => false, "error" => "Falta el parámetro user_id"]);
    exit();
}

// Consulta para verificar si el usuario tiene gerencia
$sql = "SELECT gerencia FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

// Si se encuentra el usuario, devolvemos el valor de gerencia
if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "isGerente" => $row['gerencia'] == 1 // true si es 1, false si no
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
}

$stmt->close();
$conn->close();
?>
