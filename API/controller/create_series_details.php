<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Mostrar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Manejar preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Requerir archivos
require_once '../model/database.php';
require_once '../model/excerciseSeriesDetail.php';

// Conexión DB
$database = new Database();
$conn = $database->getConnection();

// Leer datos
$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->exercise_log_id) || !isset($data->series) || !is_array($data->series)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos o incompletos."]);
    exit();
}

$success = true;

foreach ($data->series as $index => $serie) {
    if (!isset($serie->repetitions) || !isset($serie->weight)) {
        $success = false;
        break;
    }

    $detail = new ExerciseSeriesDetail($conn);
    $detail->exercise_log_id = intval($data->exercise_log_id);
    $detail->series_number = $index + 1;
    $detail->repetitions = intval($serie->repetitions);
    $detail->weight = floatval($serie->weight);

    if (!$detail->create()) {
        $success = false;
        break;
    }
}

if ($success) {
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Series guardadas correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar las series."]);
}
?>
