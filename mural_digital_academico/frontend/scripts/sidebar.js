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

    const runningOnBackendHost = ["localhost:3000", "127.0.0.1:3000"].includes(window.location.host);
    const API_BASE = (window.location.protocol === "file:" || !runningOnBackendHost)
        ? "http://localhost:3000"
        : "";

    let loggedIn = false;

    function setLoginVisualState(isLoggedIn) {
        loggedIn = isLoggedIn;
        loginLink.title = isLoggedIn ? "Logout" : "Login";
        loginLabel.textContent = isLoggedIn ? "Logout" : "Login";
        loginIcon.textContent = isLoggedIn ? "logout" : "person";
        loginLink.href = isLoggedIn ? "#" : "telaLogin.html";
    }

    async function syncAuthState() {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setLoginVisualState(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/me`, {
                headers: { Authorization: "Bearer " + token }
            });

            if (res.ok) {
                setLoginVisualState(true);
                return;
            }
        } catch {
            // Sem conexão com backend: mantém opção de logout se token existir.
            setLoginVisualState(true);
            return;
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        setLoginVisualState(false);
    }

    async function doLogout() {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                await fetch(`${API_BASE}/api/logout`, {
                    method: "POST",
                    headers: { Authorization: "Bearer " + token }
                });
            } catch {
                // Mesmo em erro de rede, o logout local precisa acontecer.
            }
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        setLoginVisualState(false);
        window.location.href = "telaLogin.html";
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

    loginLink.addEventListener("click", async (event) => {
        if (!loggedIn) return;
        event.preventDefault();
        await doLogout();
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