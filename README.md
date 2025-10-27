# 📌 Mural Digital Acadêmico

Um sistema interativo de mural digital para ambiente acadêmico, desenvolvido com HTML5 Canvas, CSS3 e JavaScript vanilla. Permite criar, visualizar, organizar e remover posts em um mural virtual com interface moderna de dashboard.

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Contribuindo](#contribuindo)

---

## 🎯 Sobre o Projeto

O **Mural Digital Acadêmico** é uma aplicação web que simula um mural físico de avisos, mas com recursos digitais interativos. Ideal para escolas, universidades ou qualquer ambiente que necessite de um sistema de comunicação visual e organizado.

### Características Principais:

- ✨ Interface moderna com design de dashboard
- 🎨 8 cores diferentes para personalização de posts
- 🖱️ Sistema de arrastar e soltar (drag & drop)
- 💾 Persistência de dados com localStorage
- 📱 Preview em tempo real ao criar posts
- 🔄 Atualização instantânea do mural
- ⚡ Zero dependências externas

---

## ⚙️ Funcionalidades

### 1. Criar Posts
- Formulário intuitivo com validação
- Título (máximo 30 caracteres)
- Conteúdo (máximo 200 caracteres)
- Seleção de 8 cores personalizadas
- Preview em tempo real
- Contador de caracteres

### 2. Visualizar Mural
- Posts exibidos em canvas HTML5
- Design visual atraente com sombras
- Botão de fechar em cada post
- Mensagem quando vazio

### 3. Organizar Posts
- Arrastar e soltar posts livremente
- Reorganizar posição conforme necessidade
- Posts se movem para frente ao serem clicados
- Limitação automática aos limites do canvas

### 4. Remover Posts
- Botão X vermelho em cada post
- Confirmação visual ao passar o mouse
- Remoção instantânea

### 5. Persistência
- Salva automaticamente no localStorage
- Posts mantidos entre sessões
- Não perde dados ao fechar navegador

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura e Canvas API
- **CSS3** - Estilização e animações
- **JavaScript (ES6+)** - Lógica e interatividade
- **Node.js** - Servidor HTTP (opcional)
- **localStorage** - Persistência de dados

### APIs Utilizadas:
- Canvas 2D API
- Web Storage API (localStorage)
- DOM Events API

---

## 📁 Estrutura do Projeto

```
mural digital academico/
│
├── index.html          # Página principal (mural)
├── criacao.html        # Página de criação de posts
├── script.js           # Lógica do mural (canvas, drag & drop)
├── style.css           # Estilos completos do projeto
├── server.js           # Servidor Node.js (opcional)
├── README.md           # Documentação do projeto
│
└── imagens/            # Ícones da interface
    ├── icone_pessoa.png
    ├── icone_anuncios.png
    ├── icone_lapis.png
    └── icone_config.png
```

### Descrição dos Arquivos:

#### `index.html`
- Página principal com o canvas do mural
- Barra de navegação
- Importa script.js para funcionalidade

#### `criacao.html`
- Interface de criação de posts
- Formulário com validação
- Preview em tempo real
- Sistema de cores

#### `script.js`
- Classe Post para representar cada post
- Renderização no canvas
- Sistema de drag & drop
- Gerenciamento de eventos do mouse
- Persistência com localStorage
- Funções de carregar e salvar

#### `style.css`
- Reset CSS e estilos globais
- Estilos do menu de navegação
- Estilos do canvas
- Estilos da página de criação
- Componentes (botões, formulários, preview)
- Animações e transições
- Responsividade

#### `server.js`
- Servidor HTTP simples
- Serve arquivos estáticos
- Configuração de MIME types
- Tratamento de erros 404/500

---

## 🚀 Como Executar

### Opção 1: Abrir Diretamente no Navegador

**Mais Simples - Recomendado para testes rápidos**

1. Navegue até a pasta do projeto
2. Clique duas vezes em `index.html`
3. Ou arraste o arquivo para o navegador

```powershell
# No PowerShell
cd "c:\Users\USUARIO\Documents\codes\mural digital academico"
start index.html
```

### Opção 2: Usando Servidor Node.js

**Mais Profissional - Recomendado para desenvolvimento**

#### Pré-requisitos:
- Node.js instalado ([Download aqui](https://nodejs.org/))

#### Passos:

1. **Abra o terminal na pasta do projeto:**
```powershell
cd "c:\Users\USUARIO\Documents\codes\mural digital academico"
```

2. **Inicie o servidor:**
```powershell
node server.js
```

3. **Acesse no navegador:**
```
http://localhost:3000
```

4. **Para parar o servidor:**
Pressione `Ctrl + C` no terminal

### Opção 3: Usando Python HTTP Server

**Alternativa se tiver Python instalado**

```powershell
# Python 3
python -m http.server 8000

# Acesse: http://localhost:8000
```

---

## 📖 Como Usar

### Criando um Post

1. **Acesse o mural** (index.html)
2. **Clique no ícone do lápis** na barra de navegação
3. **Preencha o formulário:**
   - Digite um título (até 30 caracteres)
   - Digite o conteúdo (até 200 caracteres)
   - Escolha uma cor clicando nas opções
4. **Visualize o preview** em tempo real à direita
5. **Clique em "Criar Post ✓"**
6. **Aguarde a mensagem de sucesso**
7. **Você será redirecionado para o mural**

### Organizando Posts

1. **Clique e segure** em qualquer post
2. **Arraste** para a posição desejada
3. **Solte** para fixar na nova posição
4. A posição é **salva automaticamente**

### Removendo Posts

1. **Passe o mouse** sobre um post
2. **Clique no X vermelho** no canto superior direito
3. O post é **removido instantaneamente**

---

## 🏗️ Arquitetura

### Fluxo de Dados

```
┌─────────────────┐
│  criacao.html   │
│   (Formulário)  │
└────────┬────────┘
         │
         │ Coleta dados
         ▼
┌─────────────────┐
│  localStorage   │ ◄───────┐
│   (Persistência)│         │
└────────┬────────┘         │
         │                  │
         │ Carrega posts    │ Salva alterações
         ▼                  │
┌─────────────────┐         │
│   script.js     │─────────┘
│  (Lógica Canvas)│
└────────┬────────┘
         │
         │ Renderiza
         ▼
┌─────────────────┐
│   index.html    │
│    (Canvas)     │
└─────────────────┘
```

### Ciclo de Vida de um Post

1. **Criação:**
   - Usuário preenche formulário em `criacao.html`
   - JavaScript valida os dados
   - Cria objeto Post com posição aleatória
   - Salva no localStorage
   - Redireciona para index.html

2. **Exibição:**
   - `script.js` carrega posts do localStorage
   - Cria instâncias da classe Post
   - Renderiza no canvas com método `draw()`

3. **Interação:**
   - Event listeners detectam cliques/movimentos
   - Atualiza posições em tempo real
   - Re-renderiza canvas a cada frame

4. **Persistência:**
   - Salva automaticamente após cada alteração
   - Mantém dados entre sessões
   - Sincronização com localStorage

### Estrutura de Dados

```javascript
// Estrutura de um Post no localStorage
{
  "x": 150,              // Posição X no canvas
  "y": 200,              // Posição Y no canvas
  "title": "Título",     // Título do post
  "content": "Conteúdo", // Texto do post
  "color": "#ffe4b5"     // Cor de fundo
}

// Array de posts salvo
[
  { x: 50, y: 50, title: "Post 1", content: "...", color: "#ffe4b5" },
  { x: 300, y: 200, title: "Post 2", content: "...", color: "#e0f7fa" }
]
```

---

## 🎨 Paleta de Cores

O projeto utiliza 8 cores predefinidas para os posts:

| Cor | Código | Uso |
|-----|--------|-----|
| 🟡 Bege | `#ffe4b5` | Padrão |
| 🔵 Ciano | `#e0f7fa` | Informações |
| 🟠 Coral | `#ffccbc` | Avisos |
| 🟢 Verde | `#c8e6c9` | Confirmações |
| 🔴 Rosa | `#f8bbd0` | Destaques |
| 🟣 Roxo | `#e1bee7` | Eventos |
| 🟡 Amarelo | `#fff9c4` | Lembretes |
| 🟪 Lilás | `#d1c4e9` | Diversos |

---

## 🔍 Detalhes Técnicos

### Canvas Rendering

O mural utiliza Canvas 2D API para renderização eficiente:

```javascript
// Cada post desenha:
- Sombra (shadowBlur, shadowOffset)
- Fundo colorido (fillRect)
- Borda (strokeRect)
- Título em negrito
- Linha divisória
- Conteúdo com quebra de linha
- Botão X para fechar
```

### Event Handling

Sistema de eventos para interatividade:

```javascript
mousedown  → Inicia arrasto ou remove post
mousemove  → Atualiza posição durante arrasto
mouseup    → Finaliza arrasto e salva
mouseleave → Cancela arrasto se sair do canvas
```

### Performance

- Renderização apenas quando necessário
- Limitação de posts dentro do canvas
- Delegação de eventos eficiente
- Cache de medidas de texto

---

## 🐛 Solução de Problemas

### Posts não aparecem
- Verifique o console do navegador (F12)
- Limpe o localStorage: `localStorage.clear()`
- Recarregue a página

### Arrastar não funciona
- Certifique-se de que script.js está carregado
- Verifique se não há erros no console
- Tente em outro navegador

### Servidor não inicia
- Verifique se Node.js está instalado: `node --version`
- Confirme que está na pasta correta
- Veja se a porta 3000 está livre

---

## 🚧 Funcionalidades Futuras

- [ ] Sistema de login/autenticação
- [ ] Categorias de posts
- [ ] Filtros e busca
- [ ] Exportar mural como imagem
- [ ] Backend com banco de dados
- [ ] Colaboração em tempo real
- [ ] Modo escuro
- [ ] Anexar imagens aos posts
- [ ] Editar posts existentes
- [ ] Ordenação automática

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📝 Notas para Desenvolvedor

### Convenções de Código

- **JavaScript:** Use comentários JSDoc para funções
- **CSS:** Organize estilos por seções
- **HTML:** Manten indentação de 4 espaços
- **Git:** Commits descritivos em português

### Estrutura de Comentários

```javascript
// ===== SEÇÃO PRINCIPAL =====
// Comentário de linha

/**
 * Comentário de função (JSDoc)
 * @param {type} param - Descrição
 * @returns {type} Descrição
 */
```

### localStorage Keys

- `muralPosts` - Array de todos os posts
- `newPost` - Post temporário (não utilizado atualmente)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---