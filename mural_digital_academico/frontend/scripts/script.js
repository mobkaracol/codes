/* SCRIPT PRINCIPAL
CONFIGURAÇÃo DO CANVAS */

const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");

function ajustarCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

ajustarCanvas();
window.addEventListener("resize", () => {
    ajustarCanvas();
    render();
});

let blocos = [];

/* CLASSE BLOCO 
blocos que serão colocados no mural */

class Bloco {
        /**
        * @param {number} x 
        * @param {number} y
        * @param {string} title 
        * @param {string} content
        * @param {string} color
    */
    constructor(x, y, title, content, color, font = "18px TimesNewRoman") {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 150;
        this.title = title;
        this.content = content;
        this.color = color;
        this.font = font;

        //propriedades de arrastar
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

        /**
        * @param {string} text
        * @param {number} x
        * @param {number} y
        * @param {number} maxWidth
        * @param {number} lineHeight
        */
    
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = "";
        let currentY = y;
        const maxLines = 5;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + " ";
                currentY += lineHeight;
                lineCount++;

                if (lineCount >= maxLines) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, currentY);

    }
        /** *
        * @param {number} x
        * @param {number} y
        * @returns {boolean}
        */
    
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
                y >= this.y && y <= this.y + this.height;
    }
        /**
        * @param {number} x
        * @param {number} y
        * @returns {boolean}
        */
    isCloseButton(x, y) {
        const closeX = this.x + this.width - 15;
        const closeY = this.y + 15;

        const distance = Math.sqrt((x - closeX) ** 2 + (y - closeY) ** 2);
        return distance <= 8;
    }
}

/* GERENCIAMENTO DE BLOCOS */

function loadBloco() {
    const savedBloco = localStorage.getItem('muralBloco');
    const bemVindoCriado = localStorage.getItem('mural_bemVindoCriado');

    if (savedBloco) {
        const blocoData = JSON.parse(savedBloco);
        blocos = blocoData.map(p => new Bloco(p.x, p.y, p.title, p.content, p.color, p.font));
    } 

    if (!bemVindoCriado) {
        blocos.push(new Bloco (
            50, 50,
            "Bem-Vindo!", "Este é o Mural Digital Acadêmico!",
            "#ffe4b5",
        ));

        localStorage.setItem('mural_bemVindoCriado', 'true');
        savedBloco();

        }
    }
    

function savedBloco() {
    const blocoData = blocos.map(p => ({
        x: p.x,
        y: p.y,
        title: p.title,
        content: p.content,
        color: p.color,
        font: p.font
    }));

    localStorage.setItem('muralBloco', JSON.stringify(blocoData));
}

/* UTILIDADES */

/** 
 * @param {MouseEvent} e
 * @returns {{x:number, y:number}}
*/

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

    /* RENDERIZAÇÃO GERAL */

function render() {

    ctx.fillStyle = "rgb(240, 242, 247)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (blocos.length === 0) {
        ctx.fillStyle = "#95a5a6";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Nenhum bloco criado ainda... Crie seu primeiro bloco!", 
        canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
        return;
    }

    blocos.forEach(bloco => {
        ctx.fillStyle = bloco.color;
        ctx.fillRect(bloco.x, bloco.y, bloco.width, bloco.height);

        ctx.fillStyle = "black";
        ctx.font = bloco.font;
        ctx.fillText(bloco.title, bloco.x + 10, bloco.y + 25);

        ctx.font = bloco.font;
        bloco.wrapText(
            bloco.content,
            bloco.x + 10,
            bloco.y + 55,
            bloco.width - 20,
            20
        );

        ctx.beginPath();
        ctx.arc(bloco.x + bloco.width - 15, bloco.y + 15, 8, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = bloco.font;
        ctx.fillText("X", bloco.x + bloco.width - 19, bloco.y + 19);
    });
}


    /* EVENT LISTENERS 
    (interações com o mouse) */

    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);

        /* Verifica o clique no botão 
            de fechar um bloco */
        for (let i = blocos.length - 1; i >= 0; i--) {
            if (blocos[i].isCloseButton(pos.x, pos.y)) {
                blocos.splice(i, 1); // remove bloco do array
                savedBloco();       // salva as alterações
                render();          // renderiza novamente
                return;
            }
        }

        /* Verifica o clique para
            arrastar um bloco */
        for (let i = blocos.length - 1; i >= 0; i--) {
            if (blocos[i].contains(pos.x, pos.y)) {
                blocos[i].isDragging = true; //marca quando o bloco está sendo arrastado
                
                blocos[i].offsetX = pos.x - blocos[i].x;
                blocos[i].offsetY = pos.y - blocos[i].y; // calcula offset do mouse em relaçã ao canto do bloco

                canvas.style.cursor = 'grabbing'; //muda o cursos para agarrar

                const bloco = blocos.splice(i, 1)[0];
                blocos.push(bloco); //move o bloco para o final do array
                break;
            }
        }
    });

        /* MOVIMENTAÇÃO DO MOUSE */
        
        canvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);

        let isDragging = false;
        blocos.forEach(bloco => {
            if (bloco.isDragging) {

                bloco.x = pos.x - bloco.offsetX;
                bloco.y = pos.y - bloco.offsetY; //atualiza a posição dos blocos

                bloco.x = Math.max(0, Math.min(bloco.x, canvas.width - bloco.width));
                bloco.y = Math.max(0, Math.min(bloco.y, canvas.height - bloco.height)); 
                // limita a posição dos blocos de acordo os limites do canvas

                isDragging = true;
                render(); //renderiza de forma contínua cada movimento
            }
        });

        /* Atualiza o cursor */
        if (!isDragging) {
            let overBloco = false; //verifica se o cursor está sobre algum bloco
            for (let i = blocos.length - 1; i >= 0; i--) {
                if (blocos[i].contains(pos.x, pos.y) || blocos[i].isCloseButton(pos.x, pos.y)) {
                    canvas.style.cursor = 'pointer';
                    overBloco = true;
                    break;
                }
            }

            if(!overBloco) {
                canvas.style.cursor = 'default'; //quando não está sobre nenhum bloco, o cursor volta ao padrão
            }
        }
});

    /* MOUSEUP (detectar quando soltar 
        o botão do mouse) */

    canvas.addEventListener('mouseup', () => {
        blocos.forEach(bloco => {
            if (bloco.isDragging) {
                bloco.isDragging = false; //marca que o bloco não está mais sendo arrastado
                savedBloco(); 
            }
        });
        canvas.style.cursor = 'default'; 
    });

    /* MOUSELEAVE (detectar quando o mouse
        sair da area do canvas) */

    canvas.addEventListener('mouseleave', () => {
        blocos.forEach(bloco => {
            if (bloco.isDragging) {
                bloco.isDragging = false;
                savedBloco(); 
            }
        });
        canvas.style.cursor = 'default';
    });

    /* AUXILIARES */

    /** 
    * @param {string} title
    * @param {string} content
    * @param {string} color
    */

    window.addNewBloco = function(title, content, color) {
        const x = Math.random() * (canvas.width - 220) + 10;
        const y = Math.random() * (canvas.height - 170) + 10;

        blocos.push(new Bloco(x, y, title, content, color));
        savedBloco();
        render();

    };

    /* Listener para Storage Events que sincroniza entre AbstractRange, 
    atualmente não utilizado */

    window.addEventListener('storage', (e) => {
        if (e.key === 'newBloco') {
            const newBlocoData = JSON.parse(e.value);
            blocos.push(new Bloco(
                newBlocoData.x,
                newBlocoData.y,
                newBlocoData.title,
                newBlocoData.content,
                newBlocoData.color
            ));
            savedBloco();
            render();
            localStorage.removeItem('newBloco');
        }
    });

    /* INICIALIZAÇÃO DO SITE */

    loadBloco(); //carrega os blocos salvos
    render();   //renderiza o mural pela primeira vez

    console.log('Mural Digital Acadêmico carregando!');
    console.log(`${blocos.length} Blocos carregados.`);