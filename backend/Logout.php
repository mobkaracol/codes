<?php
// Encerra a sessão do usuário e volta para a tela de login.
session_start();
$_SESSION = [];
session_destroy();

header("Location: ../index.php");
exit;
