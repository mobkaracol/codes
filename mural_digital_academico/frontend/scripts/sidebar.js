/* ==================================================
   SIDEBAR
   Carrega o componente da barra lateral e ativa as
   funcoes de recolher/expandir e o tema claro/escuro.
   ================================================== */

fetch("components/sidebar.html")
    .then((res) => res.text())
    .then((data) => {
        const container = document.getElementById("sidebar-container");
        if (!container) return;

        container.innerHTML = data;
        initSidebar();
        marcarLinkAtivo();
    })
    .catch((err) => console.error("Erro ao carregar a sidebar:", err));

/* Liga os eventos da sidebar depois que o HTML foi injetado */
function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggler = document.querySelector(".sidebar-toggler");
    const themeButton = document.getElementById("theme-toggle");

    // se algum elemento essencial faltar, evita quebrar a pagina
    if (!sidebar || !sidebarToggler || !themeButton) return;

    const themeIcon = themeButton.querySelector("span");

    /* ----- Recolher / expandir ----- */
    function aplicarRecolhido(estado) {
        sidebar.classList.toggle("collapsed", estado);
        // espelha no body para o mural ajustar o espaco reservado
        document.body.classList.toggle("sidebar-collapsed", estado);
    }

    sidebarToggler.addEventListener("click", () => {
        const recolhido = !sidebar.classList.contains("collapsed");
        aplicarRecolhido(recolhido);
        localStorage.setItem("sidebarCollapsed", recolhido);
    });

    // mantem o estado escolhido entre paginas
    aplicarRecolhido(localStorage.getItem("sidebarCollapsed") === "true");

    /* ----- Tema claro / escuro ----- */
    function updateThemeIcon() {
        themeIcon.textContent = document.body.classList.contains("dark")
            ? "light_mode"
            : "dark_mode";
    }

    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(
            "theme",
            document.body.classList.contains("dark") ? "dark" : "light"
        );
        updateThemeIcon();

        // se estivermos no mural, redesenha com as cores do novo tema
        if (typeof render === "function") render();
    });

    updateThemeIcon();
}

/* Destaca o link da pagina atual na sidebar */
function marcarLinkAtivo() {
    const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".sidebar-nav a[href]").forEach((link) => {
        const destino = link.getAttribute("href");
        if (destino && destino === paginaAtual) {
            link.classList.add("ativo");
        }
    });
}
