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
            "message" => "ID de marca requerido"
        ]);
        exit;
    }

    $brandId = intval($data['id']);

    // Eliminar la marca
    $sql = "DELETE FROM brands WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $brandId);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Marca eliminada correctamente"
        ]);
    } else {
        throw new Exception("Error al eliminar la marca: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}