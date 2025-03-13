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
$conn->set_charset("utf8mb4");

try {
    // Leer los datos JSON enviados desde el frontend
    $input = json_decode(file_get_contents("php://input"), true);

    // Validar que los datos necesarios estén presentes
    if (
        !isset($input['name']) ||
        !isset($input['category_id']) ||
        !isset($input['sub_category_id']) ||
        !isset($input['brand_id']) ||
        !isset($input['credit_price']) ||
        !isset($input['proveedor_id']) ||
        !isset($input['product_details'])
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Faltan datos necesarios."
        ]);
        exit;
    }

    // Sanitizar los datos recibidos
    $name = $conn->real_escape_string($input['name']);
    $category_id = intval($input['category_id']);
    $sub_category_id = intval($input['sub_category_id']);
    $brand_id = intval($input['brand_id']);
    $credit_price = floatval($input['credit_price']);
    $proveedor_id = intval($input['proveedor_id']);
    $product_details = $conn->real_escape_string($input['product_details']);
    $novedad_act = isset($input['novedad_act']) ? intval($input['novedad_act']) : 0; // Valor predeterminado: 0 (inactivo)
    $created_at = date("Y-m-d H:i:s"); // Fecha y hora actual
    $updated_at = $created_at;

    // Iniciar una transacción
    $conn->begin_transaction();

    // Insertar en la tabla `products`
    $sqlProducts = "
        INSERT INTO products (
            name,
            category_id,
            sub_category_id,
            brand_id,
            credit_price,
            id_proveedor,
            product_details,
            novedad_act,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $stmtProducts = $conn->prepare($sqlProducts);
    $stmtProducts->bind_param(
        "siiidisiss",
        $name,
        $category_id,
        $sub_category_id,
        $brand_id,
        $credit_price,
        $proveedor_id,
        $product_details,
        $novedad_act,
        $created_at,
        $updated_at
    );

    if (!$stmtProducts->execute()) {
        throw new Exception("Error al insertar en la tabla products: " . $stmtProducts->error);
    }

    // Obtener el ID del producto recién insertado
    $product_id = $stmtProducts->insert_id;

    // Insertar en la tabla `inventory`
    $sqlInventory = "
        INSERT INTO inventory (
            id_product,
            provedor_id,
            max_amount,
            current_amount,
            created_at,
            last_updated
        ) VALUES (?, ?, 15, 10, ?, ?)
    ";
    $stmtInventory = $conn->prepare($sqlInventory);
    $stmtInventory->bind_param(
        "iiss",
        $product_id,
        $proveedor_id,
        $created_at,
        $updated_at
    );

    if (!$stmtInventory->execute()) {
        throw new Exception("Error al insertar en la tabla inventory: " . $stmtInventory->error);
    }

    // Confirmar la transacción
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Producto e inventario agregados correctamente.",
        "product_id" => $product_id
    ]);
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
} finally {
    // Cerrar las declaraciones y la conexión
    if (isset($stmtProducts)) $stmtProducts->close();
    if (isset($stmtInventory)) $stmtInventory->close();
    $conn->close();
}