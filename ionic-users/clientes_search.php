<?php
// Configuración de errores (registrar pero no mostrar en producción)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Headers de seguridad y CORS
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("X-Content-Type-Options: nosniff");

// Buffer de salida para manejar errores correctamente
ob_start();

// Respuesta inicial
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
    
    if ($conn->connect_error) {
        throw new Exception("Error en la conexión: " . $conn->connect_error);
    }

    // Obtener parámetros de búsqueda
    $searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = 10;
    $offset = ($page - 1) * $perPage;

    if (empty($searchTerm)) {
        $response['status'] = 'success';
        $response['message'] = 'Búsqueda vacía';
        ob_end_clean();
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Normalizar el término de búsqueda (remover acentos y caracteres especiales)
    $normalizedSearch = preg_replace('/[´`¨\'"]/', '', $searchTerm);
    $normalizedSearch = iconv('UTF-8', 'ASCII//TRANSLIT', $normalizedSearch);
    $searchWords = preg_split('/\s+/', $normalizedSearch);
    $searchWords = array_filter($searchWords);

    // Consulta para obtener el conteo total
    $countSql = "SELECT COUNT(DISTINCT c.id) as total FROM customers c
                LEFT JOIN customer_changes cc ON c.id = cc.id_customer AND cc.phone IS NOT NULL
                WHERE c.is_active = 1 AND (";
    
    $countConditions = [];
    $countParams = [];
    $countParamTypes = '';

    foreach ($searchWords as $word) {
        $wordParam = "%" . $conn->real_escape_string($word) . "%";
        $countConditions[] = "(REPLACE(REPLACE(REPLACE(REPLACE(c.name, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ? OR 
                             REPLACE(REPLACE(REPLACE(REPLACE(c.address, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ? OR 
                             c.phone LIKE ?)";
        $countParams[] = $wordParam;
        $countParams[] = $wordParam;
        $countParams[] = $wordParam;
        $countParamTypes .= 'sss';
    }

    $countSql .= implode(' AND ', $countConditions) . ")";

    $countStmt = $conn->prepare($countSql);
    if (!$countStmt) {
        throw new Exception("Error en la preparación del conteo: " . $conn->error);
    }
    $countStmt->bind_param($countParamTypes, ...$countParams);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalCount = $countResult->fetch_assoc()['total'];
    $countStmt->close();

    // Calcular última página
    $lastPage = ceil($totalCount / $perPage);

    // Consulta principal con priorización de campos y paginación
    $sql = "SELECT 
                c.id,
                c.name,
                c.address,
                c.phone,
                c.type,
                CASE WHEN cc.id IS NOT NULL THEN 1 ELSE 0 END AS has_pending_changes,
                -- Puntaje de coincidencia (mayor puntaje = mejor coincidencia)
                (
                    -- Prioridad 1: Coincidencia exacta en nombre (10 puntos por palabra)
                    SUM(IF(REPLACE(REPLACE(REPLACE(REPLACE(c.name, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ?, 10, 0)) +
                    -- Prioridad 2: Coincidencia parcial en nombre (5 puntos por palabra)
                    SUM(IF(REPLACE(REPLACE(REPLACE(REPLACE(c.name, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE CONCAT('%', ?, '%'), 5, 0)) +
                    -- Prioridad 3: Coincidencia exacta en dirección (3 puntos por palabra)
                    SUM(IF(REPLACE(REPLACE(REPLACE(REPLACE(c.address, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ?, 3, 0)) +
                    -- Prioridad 4: Coincidencia parcial en dirección (2 puntos por palabra)
                    SUM(IF(REPLACE(REPLACE(REPLACE(REPLACE(c.address, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE CONCAT('%', ?, '%'), 2, 0)) +
                    -- Prioridad 5: Coincidencia en teléfono (1 punto por palabra)
                    SUM(IF(c.phone LIKE CONCAT('%', ?, '%'), 1, 0))
                ) AS match_score
            FROM customers c
            LEFT JOIN customer_changes cc ON c.id = cc.id_customer AND cc.phone IS NOT NULL
            WHERE c.is_active = 1 AND (";

    $conditions = [];
    $params = [];
    $paramTypes = '';

    foreach ($searchWords as $word) {
        $wordParam = "%" . $conn->real_escape_string($word) . "%";
        $conditions[] = "(REPLACE(REPLACE(REPLACE(REPLACE(c.name, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ? OR 
                         REPLACE(REPLACE(REPLACE(REPLACE(c.address, '´', ''), '`', ''), '\'', ''), '\"', '') LIKE ? OR 
                         c.phone LIKE ?)";
        $params[] = $wordParam;
        $params[] = $wordParam;
        $params[] = $wordParam;
        $paramTypes .= 'sss';
    }

    $sql .= implode(' AND ', $conditions) . ")
            GROUP BY c.id
            -- Ordenar por puntaje de coincidencia descendente
            ORDER BY match_score DESC, c.name ASC
            LIMIT ?, ?";

    // Agregar parámetros para el cálculo del match_score (uno por cada palabra)
    foreach ($searchWords as $word) {
        $wordParam = $conn->real_escape_string($word);
        $params[] = $wordParam;
        $params[] = $wordParam;
        $params[] = $wordParam;
        $params[] = $wordParam;
        $params[] = $wordParam;
        $paramTypes .= 'sssss';
    }

    // Agregar parámetros de paginación
    $params[] = $offset;
    $params[] = $perPage;
    $paramTypes .= 'ii';

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conn->error);
    }

    $stmt->bind_param($paramTypes, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $clientes = $result->fetch_all(MYSQLI_ASSOC);

    // Convertir has_pending_changes a booleano
    foreach ($clientes as &$cliente) {
        $cliente['has_pending_changes'] = (bool)$cliente['has_pending_changes'];
    }

    // Construir respuesta
    $response = [
        'status' => 'success',
        'message' => '',
        'data' => $clientes,
        'pagination' => [
            'total' => (int)$totalCount,
            'current_page' => (int)$page,
            'per_page' => (int)$perPage,
            'last_page' => (int)$lastPage
        ]
    ];

} catch (Exception $e) {
    error_log("Error en API de búsqueda de clientes: " . $e->getMessage());
    $response['status'] = 'error';
    $response['message'] = 'Ocurrió un error al procesar la solicitud';
    
} finally {
    ob_end_clean();
    if (isset($stmt)) $stmt->close();
    if (isset($countStmt)) $countStmt->close();
    if (isset($conn)) $conn->close();
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}
?>