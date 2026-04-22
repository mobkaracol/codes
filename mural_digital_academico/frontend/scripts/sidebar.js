fetch("components/sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;

    const sidebar = document.querySelector(".sidebar");   
    const sidebarToggler = document.querySelector(".sidebar-toggler");
    const themeButton = document.getElementById("theme-toggle");
    const themeIcon = themeButton.querySelector("span");

    //toggle sidebar collapsed state
    sidebarToggler.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
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
    })