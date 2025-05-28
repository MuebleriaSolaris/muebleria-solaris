<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../ionic-database/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if (!$conn) {
        throw new Exception("No se pudo conectar a la base de datos");
    }

    // Obtener ID de usuario desde la solicitud
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    
    if ($user_id <= 0) {
        throw new Exception("ID de usuario no válido");
    }

    // Consulta SQL para obtener las contraseñas
    $query = "SELECT password, android_pass, pass_appcom FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Usuario no encontrado");
    }

    $user = $result->fetch_assoc();
    
    $response = [
        "status" => "success",
        "data" => [
            "web_password" => $user['password'],
            "android_password" => $user['android_pass'],
            "ios_password" => $user['pass_appcom']
        ]
    ];

} catch (Exception $e) {
    $response = [
        "status" => "error", 
        "message" => $e->getMessage()
    ];
} finally {
    echo json_encode($response);
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}