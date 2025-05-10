<?php
class Exercise {
    private $conn;
    private $table_name = "exercises";

    public $id;
    public $name;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT id, name FROM " . $this->table_name . " ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name) VALUES (:name)";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $stmt->bindParam(":name", $this->name);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Insert Exercise Error: " . $e->getMessage());
            return false;
        }
    }
}
?>
