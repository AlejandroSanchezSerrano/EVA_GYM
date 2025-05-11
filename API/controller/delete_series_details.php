<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Manejar preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validar que el método sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

require_once '../model/database.php';
$db = (new Database())->getConnection();

$data = json_decode(file_get_contents("php://input"));
if (!isset($data->exercise_log_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Falta exercise_log_id"]);
    exit;
}

try {
    $stmt = $db->prepare("DELETE FROM exercise_series_details WHERE exercise_log_id = :id");
    $stmt->bindParam(":id", $data->exercise_log_id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en servidor"]);
}
