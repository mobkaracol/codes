# 📌 Feli's Box — Mural Digital Acadêmico

**Feli's Box** é um mural digital interativo voltado para o ambiente acadêmico. Ele funciona como um quadro de avisos virtual onde alunos, professores e secretaria podem criar blocos de texto coloridos e enviar imagens, arrastando e redimensionando tudo livremente em uma área de trabalho (canvas). O acesso é protegido por login.

![Versão](https://img.shields.io/badge/vers%C3%A3o-6-blue)
![Stack](https://img.shields.io/badge/stack-PHP%20%2B%20MySQL%20%2B%20Canvas-orange)
![License](https://img.shields.io/badge/license-MIT-green)

> Projeto acadêmico — Centro Paula Souza · Alfredo dos Barros Santos · 2026

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Como Funciona](#-como-funciona)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Notas e Limitações Conhecidas](#-notas-e-limitações-conhecidas)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O Feli's Box simula um mural físico de avisos, mas com recursos digitais interativos. A ideia é facilitar a comunicação dentro do ambiente educacional: cada usuário autenticado pode publicar pequenos blocos (notas) e imagens no mural e organizá-los livremente na tela.

Diferente de versões anteriores (que eram apenas HTML/CSS/JS estático), esta versão tem um **backend em PHP com banco de dados MySQL** para autenticação de usuários e um fluxo de **upload de imagens** no servidor. O mural em si é renderizado em um **canvas HTML5**, com arrastar e soltar, redimensionamento, tema claro/escuro e persistência local.

---

## ⚙️ Funcionalidades

- 🔐 **Login com sessão PHP** — o mural e as páginas internas só são acessíveis após autenticação (guarda de rota em `frontend/auth.php`).
- 📝 **Criação de blocos de texto** — título (até 50 caracteres), conteúdo (até 200), escolha de cor e prévia em tempo real.
- 🖼️ **Upload de imagens** — envio de PNG/JPG/JPEG; a imagem vira um bloco no mural, dimensionado automaticamente pela proporção original.
- 🖱️ **Arrastar, soltar e redimensionar** — todos os blocos podem ser movidos e redimensionados no canvas, com limites dentro da área visível.
- ❌ **Remover blocos** — botão de fechar (×) em cada bloco.
- 🌓 **Tema claro/escuro** — preferência salva no `localStorage`.
- 📱 **Sidebar responsiva** — colapsável em telas menores.
- 💾 **Persistência local** — os blocos do mural são salvos no `localStorage` do navegador.
- ℹ️ **Página "Sobre Nós"** — apresenta o projeto e a equipe.

---

## 🛠️ Tech Stack

**Frontend**
- HTML5 + **Canvas 2D API** (renderização do mural)
- CSS3 (temas, layout responsivo)
- JavaScript (ES6+, vanilla — sem frameworks)
- [Material Symbols](https://fonts.google.com/icons) (ícones)
- Web Storage API (`localStorage`)

**Backend**
- **PHP** (sessões, autenticação, upload de arquivos)
- **MySQL** via `mysqli` com *prepared statements*
- Apache (ex.: via XAMPP / WAMP / Laragon)

**Extras**
- `backend/server.js` — servidor Node.js estático **legado/opcional**, mantido apenas para servir arquivos estáticos. ⚠️ Ele **não interpreta PHP**, então o login e o upload não funcionam por ele. Para o app completo, use um servidor com PHP (ver [Instalação](#-instalação)).

---

## 🔧 Como Funciona

```
┌────────────────┐   credenciais    ┌──────────────────┐   consulta      ┌─────────────┐
│   index.php    │ ───────────────► │ backend/Login.php│ ──────────────► │   MySQL     │
│ (tela de login)│                  │  (valida sessão) │   tblUsuario    │  (mural)    │
└────────────────┘                  └────────┬─────────┘                 └─────────────┘
                                             │ sessão OK
                                             ▼
                                  ┌────────────────────────┐
                                  │  frontend/index.php     │
                                  │  (mural em canvas)      │
                                  │  auth.php protege a rota │
                                  └───────┬─────────────────┘
                       cria nota │        │ envia imagem
                                 ▼        ▼
                   frontend/criacao.php   upload.php ──► uploads/ ──► ?img= ──► bloco de imagem
                          │                                              no canvas
                          ▼
                   localStorage (muralBloco)  ◄── blocos de texto/imagem persistidos no navegador
```

1. **Autenticação** — o usuário entra em `index.php`, envia o formulário para `backend/Login.php`, que valida nome/senha na tabela `tblUsuario` e cria a sessão.
2. **Mural** — após o login, `frontend/index.php` carrega o canvas e os blocos salvos. Toda página interna inclui `frontend/auth.php`, que redireciona de volta ao login se não houver sessão.
3. **Criação de notas** — `frontend/criacao.php` monta o bloco e o grava no `localStorage`, depois retorna ao mural.
4. **Upload de imagens** — a sidebar envia o arquivo para `upload.php`, que move a imagem para `uploads/` e volta ao mural com `?img=`, transformando-a em um bloco.

> ℹ️ **Importante:** apenas os **usuários** ficam no banco MySQL. Os **blocos do mural** (texto e referências de imagem) são guardados no `localStorage` do navegador, ou seja, são por dispositivo/navegador.

---

## 📁 Estrutura do Projeto

```
codes/
│
├── index.php               # Tela de login (raiz da aplicação)
├── upload.php              # Recebe o upload de imagem e move para /uploads
├── teste.html             # Página de teste isolada do formulário de upload
├── Banco de dados.txt     # Script SQL do banco (criação da tabela de usuários)
│
├── backend/
│   ├── conexao.php        # Conexão MySQL (mysqli)
│   ├── Login.php          # Valida credenciais e inicia a sessão
│   ├── Logout.php         # Encerra a sessão
│   ├── sessao.php         # Endpoint JSON: informa se há usuário logado
│   └── server.js          # Servidor Node.js estático (legado/opcional)
│
├── frontend/
│   ├── auth.php           # Guarda de autenticação (incluída nas páginas internas)
│   ├── index.php          # Mural (canvas principal)
│   ├── criacao.php        # Página de criação de blocos
│   ├── sobreNos.php       # Página "Sobre Nós"
│   ├── components/
│   │   └── sidebar.html   # Barra de navegação lateral (carregada via fetch)
│   ├── css/
│   │   ├── index.css      # Estilos gerais do mural
│   │   ├── style.css      # Estilos da tela de login
│   │   ├── criacao.css    # Estilos da página de criação
│   │   └── aboutUs.css    # Estilos da página Sobre Nós
│   └── scripts/
│       ├── script.js      # Lógica do canvas (blocos, drag & drop, resize)
│       ├── script2.js     # Lógica da página de criação (prévia, contadores)
│       └── sidebar.js     # Sidebar, tema e sincronização de login
│
├── images/                # Imagens de exemplo
└── uploads/               # Imagens enviadas pelos usuários (geradas em runtime)
```

---

## 🚀 Instalação

A aplicação precisa de um ambiente com **PHP** e **MySQL**. A forma mais simples é usar o [XAMPP](https://www.apachefriends.org/) (Apache + PHP + MySQL/MariaDB).

### Pré-requisitos
- PHP 7.4+ (com a extensão `mysqli`)
- MySQL ou MariaDB
- Um servidor web (Apache, via XAMPP/WAMP/Laragon)

### Passo a passo

1. **Coloque o projeto na pasta do servidor**

   Copie a pasta do projeto para o diretório web do Apache. No XAMPP (Windows), normalmente:
   ```
   C:\xampp\htdocs\Mural\
   ```
   > O nome da pasta (`Mural`) define a URL: `http://localhost/Mural/`.

2. **Inicie o Apache e o MySQL**

   Pelo painel de controle do XAMPP, ligue **Apache** e **MySQL**.

3. **Crie o banco de dados**

   Abra o phpMyAdmin (`http://localhost/phpmyadmin`) e execute o script de `Banco de dados.txt`:
   ```sql
   CREATE DATABASE mural;
   USE mural;

   CREATE TABLE tblUsuario (
       usuId INT AUTO_INCREMENT PRIMARY KEY,
       usuNome VARCHAR(100) NOT NULL UNIQUE,
       usuSenha VARCHAR(255) NOT NULL
   );
   ```

4. **Cadastre um usuário de teste**

   Como ainda não há tela de cadastro, insira um usuário manualmente:
   ```sql
   INSERT INTO tblUsuario (usuNome, usuSenha) VALUES ('admin', '1234');
   ```

5. **Confira a conexão**

   As credenciais do banco ficam em `backend/conexao.php` (padrão XAMPP):
   ```php
   $conn = new mysqli("localhost", "root", "", "mural");
   ```
   Ajuste usuário/senha se o seu MySQL for diferente.

6. **Acesse no navegador**
   ```
   http://localhost/Mural/index.php
   ```
   Faça login com o usuário cadastrado.

---

## 📖 Como Usar

1. **Login** — entre com seu usuário e senha na tela inicial.
2. **Criar uma nota** — clique em **Criação** (ícone de lápis) na sidebar, preencha título, conteúdo e cor, acompanhe a prévia e salve. Você volta ao mural com a nota nova.
3. **Enviar uma imagem** — clique em **Imagens** na sidebar e escolha um arquivo PNG/JPG. A imagem aparece como um bloco no mural.
4. **Organizar o mural** — arraste qualquer bloco para movê-lo; use a alça no canto inferior direito para redimensionar; clique no **×** para remover.
5. **Tema** — alterne entre claro e escuro pelo botão **Tema**.
6. **Sair** — o botão de login na sidebar vira **Sair** quando você está autenticado.

---

## ⚠️ Notas e Limitações Conhecidas

Por se tratar de um projeto acadêmico, há pontos que **não devem ser usados em produção** sem ajustes:

- 🔓 **Senhas em texto puro** — `Login.php` compara a senha diretamente (`$senha == $user['usuSenha']`). O ideal é usar `password_hash()` / `password_verify()`.
- 💾 **Blocos no `localStorage`** — as notas não são compartilhadas entre usuários nem persistidas no servidor; ficam apenas no navegador local.
- 📦 **Upload sem validação profunda** — o `upload.php` aceita o arquivo enviado sem checar tipo MIME real ou tamanho.
- 🟢 **`server.js` não roda PHP** — é apenas um servidor estático legado; o app completo exige Apache+PHP.

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto distribuído sob a licença MIT.
