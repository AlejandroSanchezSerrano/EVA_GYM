<?php
class ExerciseLog {
    private $conn;
    private $table_name = "exercise_logs";

    public $id;
    public $user_id;
    public $exercise_id;
    public $date;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (user_id, exercise_id, date)
                  VALUES (:user_id, :exercise_id, :date)";
        $stmt = $this->conn->prepare($query);

        $this->user_id = filter_var($this->user_id, FILTER_VALIDATE_INT);
        $this->exercise_id = filter_var($this->exercise_id, FILTER_VALIDATE_INT);
        $this->date = htmlspecialchars(strip_tags($this->date));

        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        $stmt->bindParam(":exercise_id", $this->exercise_id, PDO::PARAM_INT);
        $stmt->bindParam(":date", $this->date);

        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId(); // obtener ID insertado
                return true;
            }
        } catch (PDOException $e) {
            error_log("Insert ExerciseLog Error: " . $e->getMessage());
        }

        return false;
    }
}
?>
