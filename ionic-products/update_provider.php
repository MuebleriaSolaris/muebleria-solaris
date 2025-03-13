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

    // Verificar que los datos necesarios estén presentes
    if (!isset($data['id']) || !isset($data['name'])) {
        echo json_encode([
            "success" => false,
            "message" => "Datos incompletos. Se requieren 'id' y 'name'."
        ]);
        exit;
    }

    // Sanitizar los datos recibidos
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);
    $last_updated = date("Y-m-d H:i:s"); // Fecha y hora actual

    // Preparar la consulta SQL para actualizar el proveedor
    $sql = "UPDATE provedores SET name = ?, last_updated = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Error en la preparación de la consulta: " . $conn->error
        ]);
        exit;
    }

    // Vincular los parámetros
    $stmt->bind_param("ssi", $name, $last_updated, $id);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        // Verificar si se realizó alguna actualización
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Proveedor actualizado correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No se realizaron cambios. Verifica el ID del proveedor."
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al ejecutar la consulta: " . $stmt->error
        ]);
    }

    // Cerrar la declaración
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ]);
} finally {
    // Cerrar la conexión
    $conn->close();
}