<?php
$servidorFTP = "server146.web-hosting.com"; // Sin ftpes://
$puertoFTP = 21; // Normalmente 21 para FTPS explícito
$usuarioFTP = "adminms@muebleriasolaris.com";
$passwordFTP = "VT??5CSw3dVn";

// Intentar conexión segura con FTPS (SSL/TLS)
$conexionFTP = ftp_ssl_connect($servidorFTP, $puertoFTP);

if (!$conexionFTP) {
    echo json_encode(["status" => "error", "message" => "No se pudo conectar al servidor FTP en el puerto $puertoFTP."]);
    exit;
}

// Intentar iniciar sesión
$login = ftp_login($conexionFTP, $usuarioFTP, $passwordFTP);

if (!$login) {
    echo json_encode(["status" => "error", "message" => "Error de autenticación: usuario o contraseña incorrectos."]);
    ftp_close($conexionFTP);
    exit;
}

// Si todo está bien
echo json_encode(["status" => "success", "message" => "Conexión FTPS exitosa en el puerto $puertoFTP."]);
ftp_close($conexionFTP);
?>
