document.addEventListener("change", (e) => {
    if (e.target && e.target.classList.contains("files")) {
        const files = e.target.files;
        if (files.length === 0) return;

        const arquivo = files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const base64Data = event.target.result;
            const novaImageBloco = new ImagemBloco(50, 50, base64Data, 200, 200);

            blocos.push(novaImageBloco);

            saveBloco();
            render();

            e.target.value = "";
        };

        reader.readAsDataURL(arquivo);
    }
});