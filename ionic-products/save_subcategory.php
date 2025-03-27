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

// Determinar el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Obtener todas las subcategorías
            if (isset($_GET['id'])) {
                // Obtener una subcategoría específica por ID
                $id = $_GET['id'];
                $sql = "SELECT * FROM sub_categories WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $subcategory = $result->fetch_assoc();
                    echo json_encode([
                        "success" => true,
                        "data" => $subcategory
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Subcategoría no encontrada"
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                }
                $stmt->close();
            } else {
                // Listar todas las subcategorías
                $sql = "SELECT * FROM sub_categories ORDER BY created_at DESC";
                $result = $conn->query($sql);
                
                $subcategories = [];
                while ($row = $result->fetch_assoc()) {
                    $subcategories[] = $row;
                }
                
                echo json_encode([
                    "success" => true,
                    "data" => $subcategories
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
            break;

        case 'POST':
            // Crear una nueva subcategoría
            $data = json_decode(file_get_contents("php://input"), true);

            // Verificar que el campo name esté presente
            if (!isset($data['name'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "El campo 'name' es requerido"
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }

            // Establecer fechas actuales
            $currentDate = date('Y-m-d H:i:s');
            $name = $data['name'];
            $category_id = 14; // Valor por defecto como solicitaste

            // Preparar la consulta SQL
            $sql = "
                INSERT INTO sub_categories (name, category_id, created_at, updated_at)
                VALUES (?, ?, ?, ?)
            ";
            $stmt = $conn->prepare($sql);

            // Vincular parámetros
            $stmt->bind_param(
                "siss", // Tipos: string, integer, string, string
                $name,
                $category_id,
                $currentDate,
                $currentDate
            );

            // Ejecutar la consulta
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Subcategoría creada correctamente",
                    "id" => $conn->insert_id // Devuelve el ID generado
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Error al crear la subcategoría"
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }

            $stmt->close();
            break;

            case 'PUT':
                // Actualizar una subcategoría existente
                $data = json_decode(file_get_contents("php://input"), true);
            
                // Verificar que todos los campos requeridos estén presentes
                if (!isset($data['name'], $data['id'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Campos requeridos faltantes: name y id"
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            
                $currentDate = date('Y-m-d H:i:s');
                $name = $data['name'];
                $id = $data['id']; // Obtenemos el ID del cuerpo de la petición
            
                $sql = "UPDATE sub_categories 
                        SET name = ?, updated_at = ?
                        WHERE id = ?";
                $stmt = $conn->prepare($sql);
            
                if (!$stmt) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Error al preparar la consulta: " . $conn->error
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            
                $stmt->bind_param("ssi", $name, $currentDate, $id);
            
                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        echo json_encode([
                            "success" => true,
                            "message" => "Subcategoría actualizada correctamente",
                            "updated_at" => $currentDate
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    } else {
                        echo json_encode([
                            "success" => false,
                            "message" => "No se encontró la subcategoría con el ID proporcionado o no hubo cambios"
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    }
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Error al actualizar la subcategoría: " . $stmt->error
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                }
            
                $stmt->close();
                break;

        case 'DELETE':
            // Eliminar una subcategoría
            $id = $_GET['id'];

            $sql = "DELETE FROM sub_categories WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Subcategoría eliminada correctamente"
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "No se encontró la subcategoría con el ID proporcionado"
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                }
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Error al eliminar la subcategoría"
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }

            $stmt->close();
            break;

        case 'OPTIONS':
            // Respuesta para preflight requests
            http_response_code(200);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                "success" => false,
                "message" => "Método no permitido"
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} finally {
    $conn->close();
}