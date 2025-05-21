<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../ionic-database/Database.php';

ob_start();

try {
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");

    if (!$conn) {
        throw new Exception("Sin conexión a la base de datos");
    }

    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input['username']) || !isset($input['password']) || !isset($input['platform'])) {
        throw new Exception("Datos incompletos: usuario, contraseña o plataforma faltante");
    }

    $username = $input['username'];
    $password = $input['password'];
    $platform = strtolower($input['platform']); // Normalizar a minúsculas

    // Definir qué columna usar según la plataforma
    $passwordColumns = [
        'android' => 'android_pass',
        'ios' => 'pass_appcom',
        'web' => 'password' // Agregué esta opción por si acaso
    ];

    // Verificar que la plataforma sea válida
    if (!array_key_exists($platform, $passwordColumns)) {
        throw new Exception("Plataforma no soportada");
    }

    $passwordColumn = $passwordColumns[$platform];

    $stmt = $conn->prepare("SELECT id, role, password, android_pass, pass_appcom FROM users WHERE username = ?");
    
    if ($stmt === false) {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Usuario no encontrado");
    }

    $user = $result->fetch_assoc();
    
    // Verificar la contraseña según la plataforma
    if (password_verify($password, $user[$passwordColumn])) {
        $response = [
            "status" => "success",
            "message" => "Login exitoso",
            "role" => $user['role'],
            "userId" => $user['id']
        ];
    } else {
        // Para depuración - registrar qué contraseña falló
        error_log("Falló la verificación para usuario: $username, plataforma: $platform");
        throw new Exception("Credenciales incorrectas");
    }
} catch (Exception $e) {
    error_log("Error en login API: " . $e->getMessage());
    $response = [
        "status" => (strpos($e->getMessage(), 'incorrectas') !== false) ? "fail" : "error",
        "message" => $e->getMessage()
    ];
} finally {
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->closeConnection();
    exit();
}