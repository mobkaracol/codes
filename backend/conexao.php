<?php

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "mural"
);

if ($conn->connect_error) {
    die("Erro de conexão");
}

?>