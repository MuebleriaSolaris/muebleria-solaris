<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if (!$conn) {
        throw new Exception("No se pudo conectar a la base de datos");
    }

    // Contraseñas diferentes para cada plataforma
    $password_web = 'GerenciaSolaris';    // Contraseña para acceso web
    $password_android = 'GerenciaSolarisAndro'; // Contraseña para app Android
    $password_ios = 'GerenciaSolaris';    // Contraseña para app iOS

    // Encriptar las contraseñas
    $hashed_web = password_hash($password_web, PASSWORD_BCRYPT);
    $hashed_android = password_hash($password_android, PASSWORD_BCRYPT);
    $hashed_ios = password_hash($password_ios, PASSWORD_BCRYPT);

    // ID del usuario a actualizar
    $user_id = 23;

    // Consulta SQL para actualizar las tres columnas
    $query = "UPDATE users SET 
              password = ?, 
              android_pass = ?, 
              pass_appcom = ? 
              WHERE id = ?";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    // Vincular los cuatro parámetros (3 contraseñas + ID)
    $stmt->bind_param("sssi", $hashed_web, $hashed_android, $hashed_ios, $user_id);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response = [
                "status" => "success", 
                "message" => "Todas las contraseñas fueron actualizadas correctamente",
                "details" => [
                    "user_id" => $user_id,
                    "web_updated" => true,
                    "android_updated" => true,
                    "ios_updated" => true
                ]
            ];
        } else {
            $response = [
                "status" => "warning", 
                "message" => "La operación se ejecutó pero no se modificaron filas",
                "suggestion" => "Verifica que el usuario con ID $user_id existe"
            ];
        }
    } else {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

} catch (Exception $e) {
    $response = [
        "status" => "error", 
        "message" => $e->getMessage(),
        "error_details" => $e->getFile() . " - Line: " . $e->getLine()
    ];
} finally {
    // Mostrar respuesta en formato JSON
    echo json_encode($response, JSON_PRETTY_PRINT);
    
    // Cerrar conexiones
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}