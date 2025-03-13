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

// Crear instancia de la conexión
$db = new Database();
$conn = $db->getConnection();

try {
    // Leer datos de entrada
    $data = json_decode(file_get_contents("php://input"), true);

    // Depuración
    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "No se recibieron datos o formato incorrecto",
            "raw_input" => file_get_contents("php://input"),
            "headers" => getallheaders(),
        ]);
        exit;
    }

    // Verificar que los campos requeridos estén presentes
    if (!isset($data['name'], $data['created_at'], $data['updated_at'])) {
        echo json_encode([
            "success" => false,
            "message" => "Faltan campos requeridos"
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Preparar la consulta SQL
    $sql = "
        INSERT INTO brands (name, created_at, updated_at)
        VALUES (?, ?, ?)
    ";
    $stmt = $conn->prepare($sql);

    // Vincular parámetros
    $stmt->bind_param(
        "sss", // Tipos: string, string, string
        $data['name'],
        $data['created_at'],
        $data['updated_at']
    );

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Marca guardada correctamente",
            "id" => $conn->insert_id // Devuelve el ID generado
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al guardar la Marca"
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    $conn->close();
}
