<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

// Database connection
$db = new Database();
$conn = $db->getConnection();

// Verificar si la conexión fue exitosa
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Sin conexión a la base de datos"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

// Capture JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Verificar si los datos necesarios están presentes
if (!isset($input['username']) || !isset($input['password']) || !isset($input['platform'])) {
    echo json_encode(["status" => "fail", "message" => "Usuario y/o Contraseña Faltante"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

$username = $input['username'];
$password = $input['password'];
$platform = $input['platform']; // 'web', 'android' o 'ios'

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Determinar la columna de contraseña según la plataforma
    $passwordColumn = ($platform === 'android') ? 'android_pass' : (($platform === 'ios') ? 'pass_appcom' : 'pass_appcom');

    // Consultar la base de datos para obtener el ID, rol y la contraseña cifrada
    $stmt = $conn->prepare("SELECT id, role, $passwordColumn as password FROM users WHERE username = ?");
    
    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => "Error en la consulta SQL: " . $conn->error], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Usar password_verify para comparar la contraseña ingresada con la almacenada
        if (password_verify($password, $user['password'])) {
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "role" => $user['role'],
                "userId" => $user['id'] // Incluir el ID de usuario en la respuesta
            ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            echo json_encode(["status" => "fail", "message" => "Usuario y/o Contraseña Incorrectos!"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
    } else {
        echo json_encode(["status" => "fail", "message" => "Usuario y/o Contraseña Incorrectos!"], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    // Cerrar las conexiones
    $stmt->close();
    $conn->close();
}
?>