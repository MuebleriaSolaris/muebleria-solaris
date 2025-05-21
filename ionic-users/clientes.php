<?php
// Configuración de errores (solo registrar, no mostrar)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Headers para CORS y tipo de contenido
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("X-Content-Type-Options: nosniff");

// Buffer de salida para evitar corrupción de JSON
ob_start();

$response = [
    'status' => 'error',
    'message' => 'Error desconocido',
    'data' => [],
    'pagination' => [
        'total' => 0,
        'current_page' => 1,
        'per_page' => 10,
        'last_page' => 1
    ]
];

try {
    require_once __DIR__ . '/../ionic-database/Database.php';
    
    $db = new Database();
    $conn = $db->getConnection();
    $conn->set_charset("utf8mb4");
    
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . ($conn ? $conn->connect_error : "Conexión nula"));
    }

    // Configuración de paginación
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = 10;
    $offset = ($page - 1) * $perPage;

    // Consulta para el conteo total (optimizada)
    $countQuery = "SELECT COUNT(DISTINCT CONCAT(name, phone)) as total FROM customers WHERE is_active = 1";
    $countResult = $conn->query($countQuery);
    
    if (!$countResult) {
        throw new Exception("Error en consulta de conteo: " . $conn->error);
    }
    
    $totalCount = $countResult->fetch_assoc()['total'];
    $lastPage = ceil($totalCount / $perPage);

    // Consulta principal con paginación (optimizada)
    $query = "SELECT 
                c.id,
                c.name,
                c.address,
                c.phone,
                c.type
              FROM customers c
              INNER JOIN (
                  SELECT 
                      name,
                      phone,
                      MAX(id) AS max_id
                  FROM customers
                  WHERE is_active = 1
                  GROUP BY name, phone
                  ORDER BY max_id DESC
                  LIMIT ?, ?
              ) AS latest ON c.id = latest.max_id
              ORDER BY c.id DESC";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta: " . $conn->error);
    }

    $stmt->bind_param("ii", $offset, $perPage);
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar consulta: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $clientes = [];

    while ($row = $result->fetch_assoc()) {
        $clientes[] = $row;
    }

    $response = [
        'status' => 'success',
        'data' => $clientes,
        'pagination' => [
            'total' => (int)$totalCount,
            'current_page' => (int)$page,
            'per_page' => (int)$perPage,
            'last_page' => (int)$lastPage
        ]
    ];

} catch (Exception $e) {
    error_log("Error en clientes.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
    
} finally {
    // Limpiar buffer y cerrar conexiones
    ob_end_clean();
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}