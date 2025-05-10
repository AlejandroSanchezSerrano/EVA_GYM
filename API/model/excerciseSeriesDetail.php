<?php
class ExerciseSeriesDetail {
    private $conn;
    private $table_name = "exercise_series_details";

    public $id;
    public $exercise_log_id;
    public $series_number;
    public $repetitions;
    public $weight;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
            (exercise_log_id, series_number, repetitions, weight) 
            VALUES (:exercise_log_id, :series_number, :repetitions, :weight)";
        $stmt = $this->conn->prepare($query);

        $this->exercise_log_id = filter_var($this->exercise_log_id, FILTER_VALIDATE_INT);
        $this->series_number = filter_var($this->series_number, FILTER_VALIDATE_INT);
        $this->repetitions = filter_var($this->repetitions, FILTER_VALIDATE_INT);
        $this->weight = filter_var($this->weight, FILTER_VALIDATE_FLOAT);

        $stmt->bindParam(":exercise_log_id", $this->exercise_log_id, PDO::PARAM_INT);
        $stmt->bindParam(":series_number", $this->series_number, PDO::PARAM_INT);
        $stmt->bindParam(":repetitions", $this->repetitions, PDO::PARAM_INT);
        $stmt->bindParam(":weight", $this->weight);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Insert SeriesDetail Error: " . $e->getMessage());
            return false;
        }
    }
}
?>
