<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

function validateInput($input) {
    if (!isset($input['product_ids']) || !is_array($input['product_ids'])) {
        throw new Exception("Se requiere un array de product_ids");
    }
    
    if (empty($input['product_ids'])) {
        throw new Exception("El array product_ids no puede estar vacío");
    }
}

try {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }
    
    validateInput($input);
    
    $isGlobal = isset($input['is_global']) && $input['is_global'];
    $subCategoryId = $isGlobal ? null : ($input['sub_category_id'] ?? null);
    $productIds = array_map('intval', $input['product_ids']);
    $productIds = array_unique($productIds);

    if (empty($productIds)) {
        throw new Exception("No hay IDs de productos válidos");
    }

    // Verificación de productos existentes y que estén en index_inventory
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));
    $checkSql = "SELECT p.id 
                FROM products p
                INNER JOIN index_inventory i ON p.id = i.product_id
                WHERE p.id IN ($placeholders)";
    
    $checkStmt = $conn->prepare($checkSql);
    if (!$checkStmt) {
        throw new Exception("Error al preparar verificación: " . $conn->error);
    }

    $checkStmt->bind_param(str_repeat('i', count($productIds)), ...$productIds);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $existingIds = [];
    while ($row = $result->fetch_assoc()) {
        $existingIds[] = $row['id'];
    }
    $checkStmt->close();

    $missingIds = array_diff($productIds, $existingIds);
    if (!empty($missingIds)) {
        throw new Exception("Los siguientes productos no existen o no están en el índice: " . implode(', ', $missingIds));
    }

    $conn->begin_transaction();
    
    // Primero resetear las posiciones de los productos afectados
    $resetSql = "UPDATE index_inventory SET ";
    if ($isGlobal) {
        $resetSql .= "global_position = NULL";
    } else {
        $resetSql .= "position_index = NULL";
    }
    $resetSql .= " WHERE product_id IN ($placeholders)";
    
    $resetStmt = $conn->prepare($resetSql);
    if (!$resetStmt) {
        throw new Exception("Error al preparar RESET: " . $conn->error);
    }
    $resetStmt->bind_param(str_repeat('i', count($productIds)), ...$productIds);
    if (!$resetStmt->execute()) {
        throw new Exception("Error al resetear posiciones: " . $resetStmt->error);
    }
    $resetStmt->close();

    // Luego asignar las nuevas posiciones comenzando desde 0
    foreach ($productIds as $index => $productId) {
        $position = $index; // Comenzamos desde 0
        
        if ($isGlobal) {
            // Actualizar solo global_position
            $updateSql = "UPDATE index_inventory SET 
                         global_position = ?
                         WHERE product_id = ?";
            
            $updateStmt = $conn->prepare($updateSql);
            if (!$updateStmt) {
                throw new Exception("Error al preparar UPDATE global: " . $conn->error);
            }
            $updateStmt->bind_param("ii", $position, $productId);
        } else {
            // Actualizar position_index y sub_category_id
            $updateSql = "UPDATE index_inventory SET 
                         position_index = ?,
                         sub_category_id = ?
                         WHERE product_id = ?";
            
            $updateStmt = $conn->prepare($updateSql);
            if (!$updateStmt) {
                throw new Exception("Error al preparar UPDATE categoría: " . $conn->error);
            }
            $updateStmt->bind_param("iii", $position, $subCategoryId, $productId);
        }
        
        if (!$updateStmt->execute()) {
            throw new Exception("Error al actualizar posición para producto ID $productId: " . $updateStmt->error);
        }
        $updateStmt->close();
    }

    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Orden actualizado correctamente (0 a X)",
        "affected_rows" => count($productIds),
        "is_global" => $isGlobal,
        "sub_category_id" => $subCategoryId,
        "position_start" => 0,
        "position_end" => count($productIds) - 1
    ]);

} catch (Exception $e) {
    if (isset($conn) && $conn->errno) {
        $conn->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "sql_error" => $conn->error ?? null
    ]);
} finally {
    if (isset($db)) {
        $db->closeConnection();
    }
}
?>