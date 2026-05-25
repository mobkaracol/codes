# DOC_CLAUDE.md — Diário de Desenvolvimento

> Registro de mudanças, decisões e aprendizados do projeto
> Mural Digital Acadêmico ("Feli's Box").
> Entradas mais recentes no topo.

---

## 25/05/2026 — Botão de voltar na página "Sobre" + melhorias da revisão

**O que foi feito:**
A página `aboutUs.html` não tinha **nenhuma** forma de voltar ao mural (só o
botão "voltar" do navegador). Foi adicionado o mesmo botão "x" (`.botao_fechar`)
que a tela de criação usa. Na mesma revisão: o idioma da página foi corrigido
(`lang="en"` → `pt-BR`), um "criad0" digitado errado virou "criado", e um trecho
de *lorem ipsum* esquecido ("adipiscing elit") foi removido. As imagens enviadas
pela sidebar agora **nascem em posições variadas** em vez de empilharem todas em
(50, 50). A fonte da página "Sobre" foi unificada para Poppins.

**Por quê:**
Pedido do dev (faltava o botão de voltar) + achados de uma revisão rápida do
código (idioma errado, erro de digitação, texto de teste esquecido e imagens
nascendo todas no mesmo ponto, uma escondendo a outra).

**Arquivos alterados:**
- `frontend/aboutUs.html` — botão de voltar, `lang="pt-BR"`, link da fonte de ícones, correção de texto
- `frontend/css/aboutUs.css` — estilo do `.botao_fechar` e fonte unificada (Poppins)
- `frontend/scripts/scriptImage.js` — nova função `posicaoInicial()` para variar onde a imagem aparece

**Código relevante:**
```javascript
// posicao variada: imagens nao empilham mais exatamente no mesmo ponto
function posicaoInicial(largura, altura) {
    const tela = document.getElementById("tela");
    const limiteX = Math.max(10, (tela ? tela.clientWidth : 800) - largura - 10);
    const limiteY = Math.max(10, (tela ? tela.clientHeight : 600) - altura - 10);
    return { x: 10 + Math.random() * (limiteX - 10), y: 10 + Math.random() * (limiteY - 10) };
}
```

**Aprendizado:**
Páginas que não têm a sidebar precisam de uma saída própria — senão o usuário
fica "preso" e só volta pelo botão do navegador. Reaproveitar a mesma classe
(`.botao_fechar`) mantém o site consistente.

**Próximos passos sugeridos:**
- [ ] Avaliar se a página "Sobre" também deveria carregar a sidebar

---

## 25/05/2026 — Login e Criação unificados ao design system

**O que foi feito:**
As telas de **login** (`style.css`) e **criação** (`criacao.css`) tinham fugido
do design system: usavam fonte Georgia, cores chumbadas (azul/marrom/cinza) e
medidas em `vw/vh`. Foram reescritas em cima das variáveis de tema. Dois bugs
visuais reais foram corrigidos: o **botão "Entrar" ficava branco com texto
branco** (invisível) e o **rodapé do login sumia** no fundo claro. Na criação,
três cores foram alinhadas: a bolinha mostrava um tom mas o bloco salvava outro.

**Por quê:**
Pedido de refatoração visual mantendo a essência (lilás + Poppins). O dark mode
não funcionava nessas duas telas porque as cores estavam fixas no CSS, e o botão
invisível impedia de ver onde clicar.

**Arquivos alterados:**
- `frontend/css/style.css` — login no design system; corrige botão e rodapé invisíveis
- `frontend/css/criacao.css` — formulário e prévia com variáveis de tema, foco acessível e layout responsável
- `frontend/criacao.html` — `value` de 3 cores alinhado à bolinha (o que escolhe = o que salva)

**Código relevante:**
```css
/* antes: botao branco sobre fundo branco (texto sumia) */
.button { background-color: var(--bg-sidebar); color: var(--text-hover); }
/* depois: usa a cor de destaque, sempre legível */
.button { background-color: var(--accent); color: var(--text-on-accent); }
```

**Aprendizado:**
Quando a cor de fundo e a cor do texto vêm da mesma variável (ou de variáveis
que no tema claro são quase iguais), o elemento "some". Usar `--accent` para
fundo e `--text-on-accent` para o texto garante contraste em qualquer tema.

**Próximos passos sugeridos:**
- [ ] Ligar o botão "Entrar" à autenticação real (bug #4, ainda aberto)

---

## 25/05/2026 — Lógica das notas reescrita (HiDPI, ResizeObserver, Pointer Events)

**O que foi feito:**
O `script.js` foi reescrito de novo para acabar com os bugs de **arrastar e
redimensionar**. Três correções de raiz: (1) o canvas agora se remede sozinho com
`ResizeObserver` — antes ele media o tamanho uma única vez, antes da sidebar
carregar, e o clique não batia com o desenho; (2) o desenho passou a respeitar o
`devicePixelRatio` (telas em 125%/150% do Windows) — some o borrão e o erro de
alguns pixels no clique; (3) trocamos eventos de `mouse` por **Pointer Events**
com captura do ponteiro — o arrasto não "trava" mais ao sair do canvas e passou a
**funcionar no toque (mobile)**, que era um próximo passo pendente.

**Por quê:**
Bug relatado pelo dev: movimentação e resize estavam bugados. A causa principal
era o canvas medido antes de a sidebar (que entra por `fetch`) mudar o tamanho da
área — daí o descompasso entre onde se clica e onde a nota está desenhada.

**Arquivos alterados:**
- `frontend/scripts/script.js` — `ajustarCanvas()` com `devicePixelRatio`, `ResizeObserver`, Pointer Events + `setPointerCapture`, `getPointerPos()`, `manterBlocosVisiveis()`

**Código relevante:**
```javascript
// 1 unidade de desenho = 1 pixel de CSS, em qualquer escala de tela
function ajustarCanvas() {
    const dpr = window.devicePixelRatio || 1;
    larguraTela = canvas.clientWidth;
    alturaTela = canvas.clientHeight;
    canvas.width = Math.round(larguraTela * dpr);
    canvas.height = Math.round(alturaTela * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    manterBlocosVisiveis();
}
// remede sozinho quando a janela muda OU a sidebar recolhe/expande
new ResizeObserver(() => { ajustarCanvas(); render(); }).observe(canvas);
```

**Aprendizado:**
Num canvas, o tamanho que aparece (CSS) e o tamanho do "desenho por dentro"
(`canvas.width/height`) são coisas diferentes. Se eles ficam dessincronizados, o
mouse erra o alvo. O `ResizeObserver` avisa toda vez que o tamanho exibido muda,
e desenhar em pixels de CSS (escalando o contexto pelo `devicePixelRatio`) deixa
tudo nítido e com o clique no lugar certo.

**Próximos passos sugeridos:**
- [ ] Limitar o tamanho do mural com scroll ou zoom quando houver muitos blocos

---

Esta foi a sessão da **versão 5**: um pacote grande de mudanças que misturou
**correção de bugs**, **segurança**, **refatoração de código** e um **redesign
visual completo**. Cada bloco abaixo documenta uma área alterada — o que foi
feito, por quê e onde mexer.

---

## 25/05/2026 — Servidor mais seguro e com acentos corretos

**O que foi feito:**
O `server.js` passou a (1) limpar a URL antes de montar o caminho do arquivo
(remove a query string `?a=b` e decodifica `%20`), (2) servir a pasta `images/`
mesmo ela ficando fora de `frontend/`, (3) bloquear "path traversal" (tentativas
de acessar arquivos fora da pasta permitida, tipo `/../backend/users.json`) com
resposta **403**, e (4) declarar `charset=utf-8` nos arquivos de texto para os
acentos aparecerem certos.

**Por quê:**
Resolve o **bug #8** (segurança — `users.json` ficava acessível) e evita
acentuação quebrada nas páginas. Antes o caminho era montado direto com
`'./frontend' + req.url`, sem nenhuma validação.

**Arquivos alterados:**
- `backend/server.js` — normalização de URL, base por pasta (`frontend`/`images`), checagem de path traversal e charset no `Content-Type`

**Código relevante:**
```javascript
// PROTEÇÃO CONTRA PATH TRAVERSAL
const resolved = path.resolve(filePath);
if (resolved !== baseDir && !resolved.startsWith(baseDir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 - Acesso negado</h1>', 'utf-8');
    return;
}
```

**Aprendizado:**
Servidor de arquivos NUNCA deve confiar na URL crua. Sempre resolva o caminho
final (`path.resolve`) e confirme que ele continua dentro da pasta que você
quer servir — senão o visitante consegue "subir" de pasta e ler qualquer arquivo.

**Próximos passos sugeridos:**
- [ ] Implementar autenticação real usando `users.json` (bug #4, ainda aberto)

---

## 25/05/2026 — Upload de imagem: valida formato/tamanho e redimensiona

**O que foi feito:**
O `scriptImage.js` foi reescrito para: rejeitar arquivos que não sejam imagem,
recusar imagens acima de **8 MB**, e **redimensionar** a imagem (maior lado até
400 px) antes de salvar — guardando uma versão leve em base64. PNG mantém
transparência; os demais viram JPEG (mais leve). No `sidebar.html`, o input
ganhou `accept="image/*"`.

**Por quê:**
Resolve os bugs **#2** (aceitava qualquer arquivo, até `.exe`/`.pdf`) e **#3**
(imagens grandes travavam ou estouravam o `localStorage`). Antes a imagem era
salva no tamanho original, sem nenhuma checagem.

**Arquivos alterados:**
- `frontend/scripts/scriptImage.js` — validação de tipo/tamanho + funções `calcularDimensoes()` e `redimensionarImagem()`
- `frontend/components/sidebar.html` — input com `accept="image/*"`

**Código relevante:**
```javascript
// redesenha a imagem reduzida num canvas auxiliar e devolve base64 leve
const canvasTmp = document.createElement("canvas");
canvasTmp.width = width;
canvasTmp.height = height;
canvasTmp.getContext("2d").drawImage(img, 0, 0, width, height);
const formato = tipoOriginal === "image/png" ? "image/png" : "image/jpeg";
return canvasTmp.toDataURL(formato, 0.85);
```

**Aprendizado:**
Dá para reduzir uma imagem no próprio navegador: desenha ela menor num
`<canvas>` invisível e pega o resultado com `toDataURL()`. Como o `localStorage`
é pequeno (~5 MB), guardar a imagem reduzida é o que evita estourar o limite.

**Próximos passos sugeridos:**
- [ ] Adicionar título/legenda editável nos blocos de imagem

---

## 25/05/2026 — Refatoração do mural (canvas) e correção do resize

**O que foi feito:**
O `script.js` foi reescrito por inteiro. Principais mudanças:
- Criada a classe `BlocoBase` e agora `Bloco` e `ImagemBloco` **herdam** dela
  (`extends`), eliminando os métodos duplicados `contains()`, `isCloseButton()`
  e `isResizeHandle()`.
- O botão "x" de fechar e a alça de redimensionar agora são desenhados para
  **todos** os blocos, inclusive imagens.
- A alça de resize virou uma área **delimitada** ao canto inferior direito.
- `getMousePos()` passou a corrigir a escala do canvas (clique cai no lugar certo).
- `saveBloco()` agora trata o erro de `localStorage` cheio (QuotaExceeded) com aviso.
- Visual dos blocos repaginado: cantos arredondados, sombra, divisória e cores por tema.

**Por quê:**
Resolve o **bug #1** (botão "x" não aparecia em imagens) e o **bug #6** (código
duplicado). O resize ilimitado era um bug silencioso: a área da alça era
"infinita" para baixo/direita e acabava pegando o bloco errado.

**Arquivos alterados:**
- `frontend/scripts/script.js` — reescrita: `BlocoBase`, render com tema, interação unificada (`interacao`), tratamento de quota

**Código relevante:**
```javascript
// Antes a alça tinha área infinita; agora é limitada ao canto.
isResizeHandle(x, y) {
    return (
        x >= this.x + this.width - ALCA_RESIZE && x <= this.x + this.width &&
        y >= this.y + this.height - ALCA_RESIZE && y <= this.y + this.height
    );
}
```

**Aprendizado:**
No canvas tudo é desenhado à mão — não existe "botão". Quando dois objetos
(texto e imagem) compartilham comportamento, criar uma classe-base com `extends`
evita copiar o mesmo código em dois lugares (e errar em só um deles).

**Próximos passos sugeridos:**
- [ ] Suporte a toque (mobile) nos eventos de arrastar/redimensionar

---

## 25/05/2026 — Sidebar refatorada: estado salvo e link ativo

**O que foi feito:**
O `sidebar.js` foi reorganizado em funções (`initSidebar()`, `marcarLinkAtivo()`),
ganhou verificações para não quebrar se um elemento faltar, **lembra** se a
sidebar está recolhida (`localStorage` `sidebarCollapsed`), destaca o link da
página atual e manda o mural **redesenhar** ao trocar o tema. No `sidebar.html`
foi adicionada a marca "Feli's Box" (link para o início) e `aria-label`s.

**Por quê:**
O código antigo amarrava tudo dentro do `.then()` do fetch e quebrava se algum
elemento não existisse. Sem redesenhar no toggle de tema, o canvas ficava com
as cores do tema anterior.

**Arquivos alterados:**
- `frontend/scripts/sidebar.js` — funções separadas, estado persistente, link ativo, `render()` ao trocar tema
- `frontend/components/sidebar.html` — marca `.sidebar-brand` e `aria-label`s

**Código relevante:**
```javascript
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
    if (typeof render === "function") render(); // redesenha o mural no novo tema
});
```

**Aprendizado:**
Como a sidebar é carregada por `fetch` (vem depois), os eventos só podem ser
ligados *depois* que o HTML é injetado. Guardar preferências no `localStorage`
faz a escolha do usuário sobreviver à troca de página.

---

## 25/05/2026 — index.html limpo e scriptImage.js finalmente carregado

**O que foi feito:**
O `index.html` foi limpo: removidos a sidebar comentada gigante e o `<script>`
inline que mexia na sidebar antes dela carregar. Agora ele só injeta o
`#sidebar-container` e carrega `script.js` e **`scriptImage.js`** (que antes não
era incluído). Todas as páginas (`index`, `criacao`, `telaLogin`, `aboutUs`)
ganharam um mini-script no topo que aplica o tema salvo **antes** de renderizar.

**Por quê:**
Resolve o **bug #5** (`scriptImage.js` não era carregado → upload não funcionava
no mural) e o **bug #7** (script inline referenciava a sidebar antes do fetch).
O script de tema no topo evita o "flash" branco ao abrir uma página no modo escuro.

**Arquivos alterados:**
- `frontend/index.html` — limpeza + `<script src="scripts/scriptImage.js" defer>`
- `frontend/criacao.html`, `telaLogin.html`, `aboutUs.html` — script de tema anti-flash
- `frontend/aboutUs.html` — caminhos de imagem corrigidos (`images/gato1.jpg`) e `alt` descritivos

**Código relevante:**
```html
<!-- aplica o tema salvo antes da renderizacao (evita flash) -->
<script>
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
</script>
```

**Aprendizado:**
Um `<script>` só enxerga elementos que já existem na página naquele momento. Se
o HTML vem por `fetch` depois, o script inline "antigo" não acha nada. E aplicar
o tema cedo (no topo do `<body>`) evita a página piscar de branco antes de ficar escura.

---

## 25/05/2026 — Redesign visual (design system "Feli's Box")

**O que foi feito:**
O `global.css` virou um pequeno **design system**: fonte Poppins, cor de
destaque roxa, tokens de raio/sombra/transição e variáveis de tema claro/escuro
reorganizadas (com *aliases* para os nomes antigos não quebrarem). Os demais CSS
foram repaginados em cima desses tokens. Na criação, o `.botao_publicar` que
tinha `width: 400%` (estourava o layout) foi para `width: 100%`, e foi adicionado
um botão "x" (`.botao_fechar`) para voltar ao mural.

**Por quê:**
Padronizar a aparência e corrigir bugs estéticos (botão transbordando, valores
"hardcoded"). Centralizar cores/tamanhos em variáveis facilita manter o visual
consistente entre páginas.

**Arquivos alterados:**
- `frontend/css/global.css` — design system: Poppins, paleta roxa, tokens, temas
- `frontend/css/index.css` — sidebar e mural repaginados
- `frontend/css/criacao.css` — formulário, `.botao_publicar` (100%) e novo `.botao_fechar`
- `frontend/css/style.css` — tela de login com tokens e layout flexível
- `frontend/css/aboutUs.css` — página "Sobre" ajustada
- `frontend/criacao.html` — botão "x" de voltar ao mural

**Código relevante:**
```css
/* antes */ .botao_publicar { width: 400%; }
/* depois */ .botao_publicar { width: 100%; }
```

**Aprendizado:**
Guardar cores e medidas em variáveis CSS (`--accent`, `--radius`, etc.) e manter
*aliases* dos nomes antigos permite redesenhar tudo sem reescrever página por
página. `width: 400%` quer dizer "4× a largura do pai" — quase sempre é engano.

---

## 25/05/2026 — Limpeza de arquivos e configuração do repositório

**O que foi feito:**
Foram **removidas** páginas duplicadas/não usadas: `about_us.html` (versão antiga
da `aboutUs.html`), `sobreNos.html` (duplicata) e `telaCadastro.html` (estava toda
comentada). Foram adicionados o `.gitignore` (ignora a pasta `.claude`) e o
`CLAUDE.md` (documentação do projeto para o assistente).

**Por quê:**
Reduzir confusão — havia duas páginas "sobre" e uma de cadastro inutilizável.
O `.gitignore` evita versionar arquivos de ferramenta locais.

**Arquivos alterados:**
- `frontend/about_us.html`, `frontend/sobreNos.html`, `frontend/telaCadastro.html` — **removidos**
- `.gitignore` — novo (ignora `.claude`)
- `CLAUDE.md` — novo (documentação do projeto)

**Próximos passos sugeridos:**
- [ ] Recriar uma tela de cadastro funcional quando o login real for implementado
