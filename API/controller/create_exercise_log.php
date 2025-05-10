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

// Requerir archivos necesarios
require_once '../model/database.php';
require_once '../model/excerciseLog.php';

// Conexión DB
$database = new Database();
$conn = $database->getConnection();
$log = new ExerciseLog($conn);

// Leer datos
$data = json_decode(file_get_contents("php://input"));

// Validación de datos
if (!$data || empty($data->user_id) || empty($data->exercise_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (user_id o exercise_id)."]);
    exit();
}

// Asignar valores
$log->user_id = intval($data->user_id);
$log->exercise_id = intval($data->exercise_id);
$log->date = isset($data->date) ? htmlspecialchars(strip_tags($data->date)) : date('Y-m-d');

// Crear log
if ($log->create()) {
    echo json_encode([
        "success" => true,
        "exercise_log_id" => $log->id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar el log."]);
}
?>
