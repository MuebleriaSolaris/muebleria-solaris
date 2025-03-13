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

try {
    // Leer datos de entrada
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar que el ID del producto esté presente
    if (!isset($data['product_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "El ID del producto es requerido."
        ]);
        exit;
    }

    // Depuración: Verificar los datos recibidos
    error_log(print_r($data, true));

    // Iniciar una transacción
    $conn->begin_transaction();

    // Actualizar la tabla 'products'
    $sqlProducts = "
        UPDATE products 
        SET 
            name = IFNULL(?, name),
            credit_price = IFNULL(?, credit_price),
            id_proveedor = IFNULL(?, id_proveedor),
            prov_price = IFNULL(?, prov_price),
            updated_at = NOW()
        WHERE id = ?
    ";
    $stmtProducts = $conn->prepare($sqlProducts);
    $stmtProducts->bind_param(
        "sddii", 
        $data['name'],         // Primero: name
        $data['credit_price'], // Segundo: credit_price
        $data['provider_id'],  // Tercero: id_proveedor
        $data['prov_price'],   // Cuarto: prov_price
        $data['product_id']    // Quinto: product_id
    );
    $stmtProducts->execute();

    // Actualizar la tabla 'inventory'
    $sqlInventory = "
        UPDATE inventory 
        SET 
            current_amount = IFNULL(?, current_amount),
            max_amount = IFNULL(?, max_amount),
            last_updated = NOW()
        WHERE id_product = ?
    ";
    $stmtInventory = $conn->prepare($sqlInventory);
    $stmtInventory->bind_param(
        "dii", 
        $data['current_stock'], 
        $data['max_amount'], 
        $data['product_id']
    );
    $stmtInventory->execute();

    // Confirmar la transacción
    $conn->commit();

    // Verificar si se realizaron actualizaciones
    if ($stmtProducts->affected_rows > 0 || $stmtInventory->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Producto actualizado correctamente."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se realizaron cambios o el producto no existe."
        ]);
    }

    // Cerrar las declaraciones
    $stmtProducts->close();
    $stmtInventory->close();
} catch (Exception $e) {
    // Revertir transacciones en caso de error
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ]);
} finally {
    // Cerrar la conexión
    $conn->close();
}