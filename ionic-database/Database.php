<?php
class Database {
    private $host = "localhost";
    private $user = "muebxner_ionic_app";
    private $password = "A3r3@ipZFNCDvMi";
    private $db_name = "muebxner_solaris";
    public $conn;

    public function getConnection() {
        // Reutilizar conexión existente si es válida
        if ($this->conn instanceof mysqli && !$this->conn->connect_errno) {
            return $this->conn;
        }

        try {
            $this->conn = new mysqli(
                $this->host, // Sin conexión persistente
                $this->user,
                $this->password,
                $this->db_name
            );

            if ($this->conn->connect_error) {
                error_log("Error de conexión: " . $this->conn->connect_error);
                return null;
            }

            $this->conn->set_charset("utf8mb4");
            return $this->conn;

        } catch (Exception $e) {
            error_log("Excepción en conexión: " . $e->getMessage());
            return null;
        }
    }

    public function closeConnection() {
        if ($this->conn instanceof mysqli && !$this->conn->connect_errno) {
            @$this->conn->close(); // "@" evita warnings
            $this->conn = null;
        }
    }
}