<?php
class Calorie {
    private $conn;
    private $table_name = "calories";

    public $id;
    public $user_id;
    public $date;
    public $calories_consumed;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (user_id, date, calories_consumed) 
                  VALUES (:user_id, :date, :calories_consumed)";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->user_id = filter_var($this->user_id, FILTER_VALIDATE_INT);
        $this->date = htmlspecialchars(strip_tags($this->date));
        $this->calories_consumed = filter_var($this->calories_consumed, FILTER_VALIDATE_INT);

        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":calories_consumed", $this->calories_consumed, PDO::PARAM_INT);

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch (PDOException $e) {
            error_log("Database Insert Error (Calorie): " . $e->getMessage());
        }

        return false;
    }

    public function getByUserId() {
        $query = "SELECT id, date, calories_consumed FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  ORDER BY date DESC";

        $stmt = $this->conn->prepare($query);

        $this->user_id = filter_var($this->user_id, FILTER_VALIDATE_INT);
        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);

        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Fetch Calories Error: " . $e->getMessage());
        }

        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $this->id = filter_var($this->id, FILTER_VALIDATE_INT);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch (PDOException $e) {
            error_log("Delete Calorie Error: " . $e->getMessage());
        }

        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET date = :date, calories_consumed = :calories_consumed 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->date = htmlspecialchars(strip_tags($this->date));
        $this->calories_consumed = filter_var($this->calories_consumed, FILTER_VALIDATE_INT);
        $this->id = filter_var($this->id, FILTER_VALIDATE_INT);

        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":calories_consumed", $this->calories_consumed, PDO::PARAM_INT);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch (PDOException $e) {
            error_log("Update Calorie Error: " . $e->getMessage());
        }

        return false;
    }
}
?>
