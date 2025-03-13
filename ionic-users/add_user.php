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

// Verificar la conexión a la base de datos
if (!$conn) {
    die(json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]));
}

// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer los datos JSON enviados desde el frontend
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar que se enviaron los campos necesarios
    if (
        !isset($input['name']) ||
        !isset($input['username']) ||
        !isset($input['email']) ||
        !isset($input['password']) ||
        !isset($input['role'])
    ) {
        echo json_encode(["status" => "error", "message" => "Faltan datos necesarios"]);
        exit();
    }

    // Sanitizar los datos recibidos
    $name = $conn->real_escape_string($input['name']);
    $username = $conn->real_escape_string($input['username']);
    $email = $conn->real_escape_string($input['email']);
    $company_name = isset($input['company_name']) ? $conn->real_escape_string($input['company_name']) : null;
    $address = isset($input['address']) ? $conn->real_escape_string($input['address']) : null;
    $phone = isset($input['phone']) ? $conn->real_escape_string($input['phone']) : null;
    $role = $conn->real_escape_string($input['role']);
    $password = password_hash($input['password'], PASSWORD_BCRYPT); // Encriptar la contraseña
    $is_active = 1; // Usuario activo por defecto
    $created_at = date("Y-m-d H:i:s");
    $updated_at = $created_at;

    // Generar un token único para "remember_token"
    $remember_token = bin2hex(random_bytes(32)); // Token de 64 caracteres

    // Insertar la información del usuario
    $query = "INSERT INTO users (
                name, 
                username, 
                email, 
                company_name, 
                address, 
                phone, 
                role, 
                is_active,
                password,  
                created_at, 
                updated_at,
                remember_token,
                android_pass,
                pass_appcom
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);

    // Verificar si la preparación de la consulta fue exitosa
    if (!$stmt) {
        die(json_encode(["status" => "error", "message" => "Error en la preparación de la consulta: " . $conn->error]));
    }

    // Vincular parámetros y ejecutar la consulta
    $stmt->bind_param(
        "ssssssssssisss", // Añadir una 's' adicional para cada columna de contraseña
        $name,
        $username,
        $email,
        $company_name,
        $address,
        $phone,
        $role,
        $is_active,
        $password,  // La contraseña cifrada se almacena en password
        $created_at,
        $updated_at,
        $remember_token,
        $password,  // La contraseña cifrada se almacena en password
        $password  // La misma contraseña cifrada se almacena en pass_appcom
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Usuario creado correctamente",
            "remember_token" => $remember_token // Opcional: devolver el token en la respuesta
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al crear usuario: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Método HTTP no permitido"]);
}

// Cerrar la conexión
$conn->close();
?>