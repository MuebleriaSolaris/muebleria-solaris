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
    if (!isset($data['id_product'], $data['adjustment'])) {
        echo json_encode([
            "success" => false,
            "message" => "Faltan campos requeridos: 'id_product' y 'adjustment'."
        ]);
        exit;
    }

    // Consultar el inventario actual
    $sqlSelect = "SELECT current_amount FROM inventory WHERE id_product = ?";
    $stmtSelect = $conn->prepare($sqlSelect);
    $stmtSelect->bind_param("i", $data['id_product']);
    $stmtSelect->execute();
    $result = $stmtSelect->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Producto no encontrado en el inventario."
        ]);
        exit;
    }

    $row = $result->fetch_assoc();
    $currentStock = (int) $row['current_amount'];

    // Calcular el nuevo stock
    $newStock = $currentStock + (int) $data['adjustment'];

    if ($newStock < 0) {
        echo json_encode([
            "success" => false,
            "message" => "El ajuste no puede resultar en un stock negativo."
        ]);
        exit;
    }

    // Actualizar el stock en la base de datos
    $sqlUpdate = "
        UPDATE inventory 
        SET 
            current_amount = ?, 
            last_updated = NOW()
        WHERE id_product = ?
    ";
    $stmtUpdate = $conn->prepare($sqlUpdate);
    $stmtUpdate->bind_param("ii", $newStock, $data['id_product']);
    $stmtUpdate->execute();

    if ($stmtUpdate->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Stock actualizado correctamente.",
            "new_stock" => $newStock
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se pudo actualizar el stock."
        ]);
    }

    // Cerrar declaraciones
    $stmtSelect->close();
    $stmtUpdate->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ]);
} finally {
    // Cerrar la conexión
    $conn->close();
}
