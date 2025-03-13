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

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

try {
    $id_customer = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id_customer <= 0) {
        echo json_encode(["success" => false, "message" => "ID del cliente inválido : '.$id_customer.'"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    $sql = "SELECT 
                name,
                address, 
                phone, 
                type, 
                is_active, 
                created_at, 
                change_timestamp, 
                change_reason 
            FROM customer_changes 
            WHERE id_customer = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_customer);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["success" => true, "data" => $data], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    $stmt->close();
    $conn->close();
}
