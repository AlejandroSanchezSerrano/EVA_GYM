<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Mostrar errores para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Manejo de solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../model/database.php';

$database = new Database();
$db = $database->getConnection();

// Validar parámetros
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
$exercise_id = isset($_GET['exercise_id']) ? intval($_GET['exercise_id']) : null;

if (!$user_id || !$exercise_id) {
    http_response_code(400);
    echo json_encode(["message" => "Faltan parámetros requeridos (user_id y exercise_id)."]);
    exit();
}

try {
    // Obtener logs
    $query = "SELECT id, date FROM exercise_logs 
              WHERE user_id = :user_id AND exercise_id = :exercise_id 
              ORDER BY date DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
    $stmt->bindParam(":exercise_id", $exercise_id, PDO::PARAM_INT);
    $stmt->execute();

    $logs = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $log_id = $row['id'];

        // Obtener series asociadas
        $seriesQuery = "SELECT repetitions, weight 
                        FROM exercise_series_details 
                        WHERE exercise_log_id = :log_id 
                        ORDER BY series_number ASC";
        $seriesStmt = $db->prepare($seriesQuery);
        $seriesStmt->bindParam(":log_id", $log_id, PDO::PARAM_INT);
        $seriesStmt->execute();
        $series = $seriesStmt->fetchAll(PDO::FETCH_ASSOC);

        $logs[] = [
            "id" => $log_id,
            "date" => $row['date'],
            "series" => $series
        ];
    }

    http_response_code(200);
    echo json_encode($logs);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error en el servidor: " . $e->getMessage()]);
}
?>
