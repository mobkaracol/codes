<?php
session_start(); // salvar o login (nome de usuario)

// só usuários logados podem enviar imagens
if (empty($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    header("Location: index.php?erro=login");
    exit;
}

if(isset($_FILES['imagem'])) {

    $arquivo = $_FILES['imagem'];

    if($arquivo['error'] === 0) {

        $pasta = __DIR__ . "/uploads/";

        if(!is_dir($pasta)){
            mkdir($pasta, 0755, true);
        }

        
        $usuario = $_SESSION['nome'] ?? "anonimo";

        
        $usuario = preg_replace('/[^a-zA-Z0-9]/', '_', $usuario);

        
        $nomeOriginal = pathinfo($arquivo['name'], PATHINFO_BASENAME);

        
        $nomeArquivo = $usuario . "-" . uniqid() . "-" . $nomeOriginal;

        $caminho = $pasta . $nomeArquivo;

        if(move_uploaded_file($arquivo['tmp_name'], $caminho)){
            // volta ao mural enviando o nome do arquivo para virar um bloco de imagem
            header("Location: frontend/index.php?img=" . urlencode($nomeArquivo));
            exit;
        } else {
            header("Location: frontend/index.php?upload=erro");
            exit;
        }

    }
}

// sem arquivo válido: volta ao mural
header("Location: frontend/index.php");
exit;