<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="frontend/css/index.css">
    <link rel="stylesheet" href="frontend/css/style.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <title>Login — Mural Digital</title>
</head>
<body class="login-page">

    <!-- Botão de alternar tema (claro/escuro) -->
    <button type="button" id="theme-toggle" class="login-theme-btn" title="Alternar tema">
        <span class="material-symbols-outlined">dark_mode</span>
    </button>

    <div id="Background">

        <div id="login-card">

            <!-- Cabeçalho do card -->
            <div class="login-header">
                <span class="material-symbols-outlined login-icon">person</span>
                <h1 class="login-title">Mural Digital</h1>
                <p class="login-subtitle">Faça seu login para continuar</p>
            </div>

            <!-- Mensagem de erro (renderizada pelo PHP) -->
            <?php if (isset($_GET['erro'])): ?>
            <div class="error-msg">
                <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">error</span>
                <span><?php echo $_GET['erro'] === 'login'
                    ? 'Faça login para acessar o mural.'
                    : 'Usuário ou senha incorretos.'; ?></span>
            </div>
            <?php endif; ?>

            <!-- Formulário (envia para o backend PHP) -->
            <form id="login-form" method="POST" action="backend/Login.php" autocomplete="off">

                <div class="field-group">
                    <label for="input-user" class="field-label">Usuário</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined input-icon">badge</span>
                        <input
                            type="text"
                            id="input-user"
                            name="nome"
                            class="field-input"
                            placeholder="Digite seu usuário..."
                            autocomplete="username"
                            required
                        />
                    </div>
                </div>

                <div class="field-group">
                    <label for="input-password" class="field-label">Senha</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined input-icon">lock</span>
                        <input
                            type="password"
                            id="input-password"
                            name="senha"
                            class="field-input"
                            placeholder="Digite sua senha..."
                            autocomplete="current-password"
                            required
                        />
                        <button type="button" id="toggle-pass" class="toggle-pass-btn" title="Mostrar/ocultar senha">
                            <span class="material-symbols-outlined" id="toggle-pass-icon">visibility</span>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-entrar">
                    <span>Entrar</span>
                </button>

            </form>

            <footer class="login-footer">
                Centro Paula Souza &nbsp;|&nbsp; Alfredo dos Barros Santos &nbsp;|&nbsp; 2026
            </footer>

        </div>

    </div>

    <script>
        // ── Mostrar/ocultar senha ──────────────────────────────
        document.getElementById('toggle-pass').addEventListener('click', () => {
            const input = document.getElementById('input-password');
            const icon  = document.getElementById('toggle-pass-icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });

        // ── Tema claro/escuro (mesma preferência do mural) ──────
        const themeButton = document.getElementById('theme-toggle');
        const themeIcon   = themeButton.querySelector('span');

        function updateThemeIcon() {
            themeIcon.textContent = document.body.classList.contains('dark') ? 'light_mode' : 'dark_mode';
        }

        themeButton.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
            updateThemeIcon();
        });

        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
        }
        updateThemeIcon();
    </script>

</body>
</html>
