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

    // Verificar que los campos requeridos estén presentes
    if (!isset($data['name'], $data['category_id'], $data['sub_category_id'], $data['brand_id'], $data['credit_price'], $data['id_proveedor'])) {
        echo json_encode([
            "success" => false,
            "message" => "Faltan campos requeridos"
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Asignar valores predeterminados para los campos no enviados
    $model_no = $data['model_no'] ?? null;
    $qty = $data['qty'] ?? 0;
    $image = $data['image'] ?? null;
    $product_details = $data['product_details'] ?? null;
    $is_active = $data['is_active'] ?? 1; // Por defecto, está activo
    $barcode_symbology = $data['barcode_symbology'] ?? null;
    $unit = $data['unit'] ?? null;
    $alert_qty = $data['alert_qty'] ?? null;
    $price = $data['price'] ?? 0;
    $novedad_act = $data['novedad_act'] ?? 0;

    // Preparar la consulta SQL
    $sql = "
        INSERT INTO products (
            name, 
            category_id, 
            sub_category_id, 
            brand_id, 
            model_no, 
            qty, 
            image, 
            product_details, 
            is_active, 
            barcode_symbology, 
            unit, 
            alert_qty, 
            price, 
            credit_price, 
            created_at, 
            updated_at, 
            id_proveedor, 
            novedad_act
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
    ";
    $stmt = $conn->prepare($sql);

    // Vincular parámetros
    $stmt->bind_param(
        "siisissssssdii",
        $data['name'],
        $data['category_id'],
        $data['sub_category_id'],
        $data['brand_id'],
        $model_no,
        $qty,
        $image,
        $product_details,
        $is_active,
        $barcode_symbology,
        $unit,
        $alert_qty,
        $price,
        $credit_price['credit_price'],
        $data['id_proveedor'],
        $novedad_act
    );

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Producto guardado correctamente",
            "id" => $conn->insert_id // Devuelve el ID generado
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al guardar el producto"
        ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ], JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    $conn->close();
}
?>
