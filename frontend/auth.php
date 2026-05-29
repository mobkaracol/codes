<?php
/*
 * GUARDA DE AUTENTICAÇÃO
 * Incluído no topo de toda página interna do mural.
 * Se não houver sessão logada, devolve o usuário para a tela de login.
 */
session_start();

if (empty($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    header('Location: ../index.php?erro=login');
    exit;
}
