<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Reporte de errores para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Manejo de solicitudes OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../model/database.php';
include_once '../model/calorie.php';

$database = new Database();
$db = $database->getConnection();
$calorie = new Calorie($db);

// Leer los datos de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "No se recibieron datos."]);
    exit();
}

// Verificar si viene un campo 'action'
if (!isset($data->action)) {
    http_response_code(400);
    echo json_encode(["message" => "No se especificó ninguna acción."]);
    exit();
}

switch ($data->action) {
    case 'create':
        if (empty($data->user_id) || empty($data->calories_consumed)) {
            http_response_code(400);
            echo json_encode(["message" => "Faltan los campos obligatorios: user_id o calories_consumed."]);
            exit();
        }

        $calorie->user_id = intval($data->user_id);
        $calorie->calories_consumed = intval($data->calories_consumed);
        $calorie->date = isset($data->date) ? htmlspecialchars(strip_tags($data->date)) : date('Y-m-d');

        if ($calorie->create()) {
            http_response_code(201);
            echo json_encode(["message" => "Registro de calorías creado correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al registrar las calorías."]);
        }
        break;

    case 'update':
        if (empty($data->id) || empty($data->calories_consumed) || empty($data->date)) {
            http_response_code(400);
            echo json_encode(["message" => "Faltan los campos necesarios para actualizar (id, calories_consumed, date)."]);
            exit();
        }

        $calorie->id = intval($data->id);
        $calorie->calories_consumed = intval($data->calories_consumed);
        $calorie->date = htmlspecialchars(strip_tags($data->date));

        if ($calorie->update()) {
            http_response_code(200);
            echo json_encode(["message" => "Registro de calorías actualizado correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al actualizar el registro de calorías."]);
        }
        break;

    case 'delete':
        if (empty($data->id)) {
            http_response_code(400);
            echo json_encode(["message" => "Falta el id para eliminar el registro."]);
            exit();
        }

        $calorie->id = intval($data->id);

        if ($calorie->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Registro de calorías eliminado correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al eliminar el registro de calorías."]);
        }
        break;

    case 'getByUserId':
        if (empty($data->user_id)) {
            http_response_code(400);
            echo json_encode(["message" => "Falta el id del usuario para obtener los registros."]);
            exit();
        }

        $calorie->user_id = intval($data->user_id);
        $calories = $calorie->getByUserId();

        if ($calories !== false) {
            http_response_code(200);
            echo json_encode($calories);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al obtener los registros de calorías."]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["message" => "Acción no válida."]);
        break;
}
?>
