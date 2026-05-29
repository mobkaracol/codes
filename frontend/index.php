<?php require __DIR__ . '/auth.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/index.css">

    <!-- link do google fonts para icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

    <title>Mural Digital Acadêmico</title>

</head>
<body>

    <!-- PARTE PRINCIPAL DO MURAL

    é onde mostra a barra de menu e os botôes
    principais do Mural, incluindo o botão de criação -->

    <div id="sidebar-container"></div>
    <script src="scripts/sidebar.js"></script>

    <!-- CANVAS -->

    <main>
    <canvas id="tela"></canvas>
    </main>

    <!-- 🎮 cortesia do BRRgamer12 -->


    <!-- SCRIPTS IMPORTANTES PARA O
        FUNCIONAMENTO DO MURAL -->

    <script src="scripts/script.js" defer></script>

</body>
</html>
