fetch("components/sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;

    const sidebar = document.querySelector(".sidebar");
    const sidebarToggler = document.querySelector(".sidebar-toggler");
    const themeButton = document.getElementById("theme-toggle");
    const themeIcon = themeButton.querySelector("span");
    const loginLink = document.getElementById("login");
    const loginIcon = document.getElementById("login-icon");
    const loginLabel = document.getElementById("login-label");

    if (!sidebar || !themeButton || !themeIcon || !loginLink || !loginIcon || !loginLabel) return;

    // Caminho do backend PHP a partir das páginas dentro de /frontend
    const LOGIN_PAGE  = "../index.php";
    const LOGOUT_URL  = "../backend/Logout.php";
    const SESSION_URL = "../backend/sessao.php";

    let loggedIn = false;

    function setLoginVisualState(isLoggedIn, nome) {
        loggedIn = isLoggedIn;
        if (isLoggedIn) {
            loginLink.title = "Sair";
            loginLabel.textContent = nome ? `Sair (${nome})` : "Sair";
            loginIcon.textContent = "logout";
            loginLink.href = "#";
        } else {
            loginLink.title = "Login";
            loginLabel.textContent = "Login";
            loginIcon.textContent = "person";
            loginLink.href = LOGIN_PAGE;
        }
    }

    // Consulta a sessão PHP para saber se o usuário está logado
    async function syncAuthState() {
        try {
            const res = await fetch(SESSION_URL, { credentials: "same-origin" });
            if (res.ok) {
                const data = await res.json();
                setLoginVisualState(!!data.logado, data.nome);
                return;
            }
        } catch {
            // Sem backend disponível: assume deslogado
        }
        setLoginVisualState(false);
    }

    function doLogout() {
        // O logout em si acontece no PHP (destrói a sessão e redireciona)
        window.location.href = LOGOUT_URL;
    }

    function syncSidebarForViewport() {
        if (window.innerWidth <= 640) {
            sidebar.classList.remove("collapsed");
            return;
        }

        if (window.innerWidth <= 900) {
            sidebar.classList.add("collapsed");
        }
    }

    //toggle sidebar collapsed state
    if (sidebarToggler) {
        sidebarToggler.addEventListener("click", () => {
            if (window.innerWidth <= 640) return;
            sidebar.classList.toggle("collapsed");
        });
    }

    loginLink.addEventListener("click", (event) => {
        if (!loggedIn) return; // deslogado: segue o link normal para a tela de login
        event.preventDefault();
        doLogout();
    });

    /* SCRIPT DO BOTÃO DARKMODE */

    /* muda o icone */
    function updateThemeIcon() {
        if(document.body.classList.contains("dark")) {
            themeIcon.textContent = "light_mode";
        } else {
            themeIcon.textContent = "dark_mode";
        }
    }

    /* muda o tema do fundo */
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if(document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        }else{
            localStorage.setItem("theme","light");
        }

        updateThemeIcon();

    });

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark");
    }

    syncAuthState();
    updateThemeIcon();
    syncSidebarForViewport();
    window.addEventListener("resize", syncSidebarForViewport);
    })
