<?php
session_start();
include("conexao.php");

$nome = $_POST['nome'] ?? '';
$senha = $_POST['senha'] ?? '';

$sql = "SELECT * FROM tblUsuario WHERE usuNome = ? LIMIT 1";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    header("Location: ../index.php?erro=1");
    exit;
}

$stmt->bind_param("s", $nome);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if ($senha == $user['usuSenha']) {

        $_SESSION['logado'] = true;
        $_SESSION['nome'] = $user['usuNome'];

        header("Location: ../frontend/index.php");
        exit;

    } else {
        header("Location: ../index.php?erro=1");
        exit;
    }

} else {
    header("Location: ../index.php?erro=1");
    exit;
}
?>