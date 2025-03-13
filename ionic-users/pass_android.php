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

// Definir la contraseña de Android que deseas asignar
$password_android = 'Gerenciasolaris'; // Cambia esto por la contraseña que desees

// Encriptar la contraseña de Android usando bcrypt
$hashed_password_android = password_hash($password_android, PASSWORD_BCRYPT);

// ID del usuario que deseas actualizar (en este caso, el usuario con ID 1)
$user_id = 23;

// Consulta SQL para actualizar pass_android
$query = "UPDATE users SET pass_appcom = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $hashed_password_android, $user_id);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Contraseña de Android actualizada correctamente para el usuario con ID 1"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al actualizar la contraseña de Android: " . $stmt->error]);
}

// Cerrar la conexión
$stmt->close();
$conn->close();