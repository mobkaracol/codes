<?php
// Informa ao frontend se há um usuário logado (lê a sessão PHP).
session_start();
header("Content-Type: application/json; charset=utf-8");

$logado = isset($_SESSION['logado']) && $_SESSION['logado'] === true;

echo json_encode([
    "logado" => $logado,
    "nome"   => $logado ? ($_SESSION['nome'] ?? null) : null
]);
