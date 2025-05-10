<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(["message" => "Método no permitido"]);
    exit();
}

// Requerir archivos
require_once '../model/database.php';
require_once '../model/excercise.php';

// Conexión a la base de datos
$db = new Database();
$conn = $db->getConnection();

$exercise = new Exercise($conn);
$result = $exercise->getAll();

if ($result !== false) {
    http_response_code(200);
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error al obtener los ejercicios."]);
}
?>
