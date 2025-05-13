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
$date = isset($_GET['date']) ? $_GET['date'] : null;

if (!$user_id || !$date) {
    http_response_code(400);
    echo json_encode(["message" => "Faltan parámetros requeridos (user_id y date)."]);
    exit();
}

try {
    // Obtener logs del día
    $query = "SELECT id, exercise_id, date FROM exercise_logs 
              WHERE user_id = :user_id AND date = :date
              ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
    $stmt->bindParam(":date", $date, PDO::PARAM_STR);
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
            "exercise_id" => $row['exercise_id'],
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
