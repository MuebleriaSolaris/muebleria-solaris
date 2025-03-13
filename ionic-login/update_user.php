<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

// Conexión a la base de datos
$db = new Database();
$conn = $db->getConnection();

try {
    // Obtener el ID del usuario desde la URL
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode(["status" => "error", "message" => "ID de usuario no proporcionado"]);
        exit();
    }

    $userId = $_GET['id'];

    // Obtener los datos del cuerpo de la solicitud
    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData)) {
        echo json_encode(["status" => "error", "message" => "Datos no proporcionados"]);
        exit();
    }

    if ($conn->connect_error) {
        echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
        exit();
    }

    // Preparar la consulta SQL para actualizar el usuario
    $sql = "UPDATE users SET 
            name = ?, 
            email = ?, 
            company_name = ?, 
            address = ?, 
            phone = ?, 
            role = ? 
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Error al preparar la consulta"]);
        exit();
    }

    // Vincular los parámetros
    $stmt->bind_param(
        "ssssssi",
        $inputData['name'],
        $inputData['email'],
        $inputData['company_name'],
        $inputData['address'],
        $inputData['phone'],
        $inputData['role'],
        $userId
    );

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Usuario actualizado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el usuario"]);
    }

    // Cerrar la conexión
    $stmt->close();
}catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ]);
} finally {
    // Cerrar la conexión
    $conn->close();
}