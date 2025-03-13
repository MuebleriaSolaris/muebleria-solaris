<?php

header("Access-Control-Allow-Origin: https://muebleriasolaris.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class Database {
    private $host = "localhost"; // Cambia localhost si el servidor está remoto
    private $user = "muebxner_ionic_app"; // Nuevo usuario
    private $password = "A3r3@ipZFNCDvMi"; // Nueva contraseña
    private $db_name = "muebxner_solaris"; // Nombre de la base de datos
    public $conn;

    // Método para obtener la conexión
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->user, $this->password, $this->db_name);
            
            // Verificar si hay error de conexión
            if ($this->conn->connect_error) {
                return null; // Si hay error, devolver null
            }
        } catch (Exception $e) {
            return null; // Retornar null si ocurre una excepción
        }

        return $this->conn; // Devolver el objeto de conexión si todo es exitoso
    }

    // Método para cerrar la conexión
    public function closeConnection() {
        if ($this->conn) {
            $this->conn->close(); // Cerrar la conexión si está abierta
        }
    }
}

