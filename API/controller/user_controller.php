<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../model/database.php';
include_once '../model/user.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Leer entrada JSON
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "No se recibieron datos."]);
    exit();
}

if (!isset($data->action)) {
    http_response_code(400);
    echo json_encode(["message" => "No se especificó ninguna acción."]);
    exit();
}

switch ($data->action) {
    case 'getDailyCalories':
        if (empty($data->user_id)) {
            http_response_code(400);
            echo json_encode(["message" => "Falta el user_id."]);
            exit();
        }

        $user->id = intval($data->user_id);
        $userData = $user->getById();

        if ($userData !== false) {
            http_response_code(200);
            echo json_encode(["daily_calories" => $userData['daily_calories']]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Usuario no encontrado."]);
        }
        break;

    // Puedes añadir más acciones aquí, como updateUser, deleteUser, etc.

    default:
        http_response_code(400);
        echo json_encode(["message" => "Acción no válida."]);
        break;
}
?>
