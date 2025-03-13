<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        echo json_encode([
            "success" => false,
            "message" => "ID de proveedor requerido"
        ]);
        exit;
    }

    $providerId = $data['id'];

    // Eliminar el proveedor
    $sql = "DELETE FROM provedores WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $providerId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Proveedor eliminado correctamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el proveedor"
        ]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al eliminar: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}