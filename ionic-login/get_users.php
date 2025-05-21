<?php
// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Buffer de salida
ob_start();

$response = [
    'status' => 'error',
    'message' => 'Error desconocido',
    'data' => []
];

try {
    require_once __DIR__ . '/../ionic-database/Database.php';
    
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");

    if (!$conn) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Consulta modificada (sin el filtro por status que no existe)
    $query = "SELECT 
                id, 
                name, 
                username, 
                email, 
                company_name as company, 
                address, 
                phone, 
                role 
              FROM users 
              ORDER BY name ASC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'username' => $row['username'],
            'email' => $row['email'],
            'company' => $row['company'] ?? null,
            'address' => $row['address'] ?? null,
            'phone' => $row['phone'] ?? null,
            'role' => (int)$row['role']
        ];
    }

    $response = [
        'status' => 'success',
        'message' => count($users) . ' usuarios encontrados',
        'data' => $users
    ];

} catch (Exception $e) {
    error_log("Error en get_users.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
    
} finally {
    // Limpiar buffer
    ob_end_clean();
    
    // Cerrar conexión de manera segura
    if (isset($db)) {
        try {
            $db->closeConnection();
        } catch (Exception $e) {
            error_log("Error al cerrar conexión: " . $e->getMessage());
        }
    }
    
    // Enviar respuesta
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}