<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

// Inicializar variables para statements
$stmtProducts = $stmtInventory = $stmtIndex = $stmtSubcatPos = null;

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (
        !isset($input['name']) ||
        !isset($input['category_id']) ||
        !isset($input['sub_category_id']) ||
        !isset($input['brand_id']) ||
        !isset($input['credit_price']) ||
        !isset($input['proveedor_id']) ||
        !isset($input['product_details']) ||
        !isset($input['prov_price'])
    ) {
        throw new Exception("Faltan datos necesarios.");
    }

    // Sanitizar datos
    $name = $conn->real_escape_string($input['name']);
    $category_id = intval($input['category_id']);
    $sub_category_id = intval($input['sub_category_id']);
    $brand_id = intval($input['brand_id']);
    $credit_price = floatval($input['credit_price']);
    $proveedor_id = intval($input['proveedor_id']);
    $product_details = $conn->real_escape_string($input['product_details']);
    $novedad_act = isset($input['novedad_act']) ? intval($input['novedad_act']) : 0;
    $created_at = date("Y-m-d H:i:s");
    $updated_at = $created_at;
    $prov_price = floatval($input['prov_price']);
    $image_url = isset($input['image_url']) ? $conn->real_escape_string($input['image_url']) : null;
    $max_amount = isset($input['max_amount']) ? intval($input['max_amount']) : 15;
    $current_amount = isset($input['current_amount']) ? intval($input['current_amount']) : 10;

    // Iniciar transacción principal
    $conn->begin_transaction();

    // 1. Insertar en products
    $sqlProducts = "INSERT INTO products (
        name, category_id, sub_category_id, brand_id, credit_price, 
        id_proveedor, product_details, novedad_act, created_at, 
        updated_at, prov_price, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmtProducts = $conn->prepare($sqlProducts);
    if (!$stmtProducts) {
        throw new Exception("Error al preparar products: " . $conn->error);
    }
    
    $stmtProducts->bind_param(
        "siiidississs",
        $name, $category_id, $sub_category_id, $brand_id, $credit_price,
        $proveedor_id, $product_details, $novedad_act, $created_at,
        $updated_at, $prov_price, $image_url
    );
    
    if (!$stmtProducts->execute()) {
        throw new Exception("Error al insertar products: " . $stmtProducts->error);
    }
    
    $product_id = $stmtProducts->insert_id;
    $stmtProducts->close();

    // 2. Insertar en inventory
    $sqlInventory = "INSERT INTO inventory (
        id_product, provedor_id, max_amount, current_amount, 
        created_at, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmtInventory = $conn->prepare($sqlInventory);
    if (!$stmtInventory) {
        throw new Exception("Error al preparar inventory: " . $conn->error);
    }
    
    $stmtInventory->bind_param(
        "iiisss",
        $product_id, $proveedor_id, $max_amount, $current_amount, 
        $created_at, $updated_at
    );
    
    if (!$stmtInventory->execute()) {
        throw new Exception("Error al insertar inventory: " . $stmtInventory->error);
    }
    $stmtInventory->close();

    // 3. Insertar en index_inventory (en la misma transacción)
    $sqlGlobalPos = "SELECT IFNULL(MAX(global_position), -1) + 1 AS next_global_pos FROM index_inventory";
    $result = $conn->query($sqlGlobalPos);
    $nextGlobalPos = $result->fetch_assoc()['next_global_pos'];
    
    $nextSubcatPos = 0;
    if ($sub_category_id > 0) {
        $sqlSubcatPos = "SELECT IFNULL(MAX(position_index), -1) + 1 AS next_pos 
                         FROM index_inventory 
                         WHERE sub_category_id = ?";
        $stmtSubcatPos = $conn->prepare($sqlSubcatPos);
        $stmtSubcatPos->bind_param("i", $sub_category_id);
        $stmtSubcatPos->execute();
        $result = $stmtSubcatPos->get_result();
        $nextSubcatPos = $result->fetch_assoc()['next_pos'];
        $stmtSubcatPos->close();
    }
    
    $sqlIndex = "INSERT INTO index_inventory (
        sub_category_id, product_id, position_index, global_position
    ) VALUES (?, ?, ?, ?)";
    
    $stmtIndex = $conn->prepare($sqlIndex);
    if (!$stmtIndex) {
        throw new Exception("Error al preparar index_inventory: " . $conn->error);
    }
    
    $stmtIndex->bind_param(
        "iiii",
        $sub_category_id, $product_id, $nextSubcatPos, $nextGlobalPos
    );
    
    if (!$stmtIndex->execute()) {
        throw new Exception("Error al insertar index_inventory: " . $stmtIndex->error);
    }
    $stmtIndex->close();

    // Confirmar toda la transacción
    $conn->commit();

    // Respuesta única y completa
    $response = [
        "success" => true,
        "message" => "Producto, inventario y orden actualizados correctamente.",
        "product_id" => $product_id,
        "global_position" => $nextGlobalPos,
        "position_index" => $nextSubcatPos
    ];

    echo json_encode($response);
    exit; // Asegurar que no se ejecute más código después

} catch (Exception $e) {
    // Revertir en caso de error
    if ($conn && $conn->errno) {
        $conn->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
} finally {
    // Cerrar conexión de manera segura
    if ($conn) {
        $conn->close();
    }
}