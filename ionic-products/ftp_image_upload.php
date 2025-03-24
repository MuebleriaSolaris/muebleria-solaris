<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Fecha en el pasado

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cargar el archivo de conexión a la base de datos
require_once __DIR__ . '/../ionic-database/Database.php';

// Crear instancia de la clase Database
$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "No se pudo conectar a la base de datos."]);
    exit;
}

// Configuración del servidor FTP
$ftp_server = "server146.web-hosting.com";
$ftp_user = "adminms@muebleriasolaris.com";
$ftp_pass = "VT??5CSw3dVn";

if ($_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "Error al subir el archivo."]);
    exit;
}

$product_id = $_POST["product_id"]; // ID del producto recibido desde Ionic
$remote_dir = "images_products/" . $product_id . "_product_image/"; // Carpeta específica para el producto
$remote_file = $remote_dir . "product_" . $product_id . ".jpg"; // Ruta en FTP

$conn_id = ftp_ssl_connect($ftp_server);
$login_result = ftp_login($conn_id, $ftp_user, $ftp_pass);
ftp_pasv($conn_id, true);

if (!$conn_id || !$login_result) {
    echo json_encode(["status" => "error", "message" => "No se pudo conectar al FTP."]);
    exit;
}

// Crear la carpeta si no existe
if (!ftp_nlist($conn_id, $remote_dir)) {
    if (!ftp_mkdir($conn_id, $remote_dir)) {
        echo json_encode(["status" => "error", "message" => "No se pudo crear la carpeta en el servidor FTP."]);
        ftp_close($conn_id);
        exit;
    }
}

// Subir el archivo
if (ftp_put($conn_id, $remote_file, $_FILES["image"]["tmp_name"], FTP_BINARY)) {
    // URL de la imagen subida
    $image_url = "https://muebleriasolaris.com/" . $remote_file;

    // Actualizar la columna `image` en la tabla `products`
    $query = "UPDATE products SET image = ? WHERE id = ?";
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }

    // Vincular parámetros
    $stmt->bind_param("si", $image_url, $product_id);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Imagen subida y base de datos actualizada correctamente.", "image_url" => $image_url]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al ejecutar la consulta: " . $stmt->error]);
    }

    // Cerrar la declaración
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Error al subir la imagen"]);
}

ftp_close($conn_id);
?>