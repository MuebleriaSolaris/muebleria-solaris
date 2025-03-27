<?php
// Agrega esto a tu API existente (subcategories.php o crea categories.php)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../ionic-database/Database.php';

$db = new Database();
$conn = $db->getConnection();
$conn->set_charset("utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint para obtener información de categoría por ID
    if (isset($_GET['id'])) {
        $categoryId = $_GET['id'];
        $query = "SELECT id, name FROM categories WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode([
                "success" => true,
                "data" => $result->fetch_assoc()
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Categoría no encontrada"
            ]);
        }
        $stmt->close();
        exit;
    }
}
?>



