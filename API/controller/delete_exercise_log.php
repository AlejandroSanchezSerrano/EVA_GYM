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

// Incluir conexión y modelos
require_once '../model/database.php';

$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->log_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta log_id']);
    exit;
}

try {
    // Eliminar primero los detalles de series
    $stmt1 = $db->prepare("DELETE FROM exercise_series_details WHERE exercise_log_id = :log_id");
    $stmt1->bindParam(":log_id", $data->log_id, PDO::PARAM_INT);
    $stmt1->execute();

    // Luego el log
    $stmt2 = $db->prepare("DELETE FROM exercise_logs WHERE id = :log_id");
    $stmt2->bindParam(":log_id", $data->log_id, PDO::PARAM_INT);
    $stmt2->execute();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log("Delete Log Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al eliminar el log']);
}
?>
