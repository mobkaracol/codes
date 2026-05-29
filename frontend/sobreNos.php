<?php require __DIR__ . '/auth.php'; ?>
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="css/index.css" />
    <link rel="stylesheet" href="css/aboutUs.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

    <title>Sobre Nós</title>
  </head>
  <body>

    <!-- BARRA DE NAVEGAÇÃO -->
    <div id="sidebar-container"></div>
    <script src="scripts/sidebar.js"></script>

    <!-- PÁGINA DE SOBRE NÓS
    página exclusivamente dedicada para falar
    sobre o grupo e o projeto do Feli's Box -->

    <div class="container-about-us">

      <div class="title-aboutus">
        <h3>Conheça sobre o projeto Feli's Box!</h3>
      </div>

      <div class="text">
        <p>Feli's Box é uma ferramenta desenvolvida como um web site</p>
        <p>criada com o intuito de ajudar na comunicação entre alunos, professores e secretária</p>
        <p>dentro do ambiente virtual educacional. Criada e projetada em HTML, CSS, JavaScript e PHP</p>
        <p>adipiscing elit. Euismod tellus ut, porta turpis. Vivamus sed</p>
        <p>sagittis velit.</p>
      </div>

      <div class="title-aboutus">
        <h3>Conheça nossa equipe!</h3>
      </div>

      <div class="container-members">

        <div class="member">
          <img class="cat" src="../images/gato1.jpg" alt="cat1" />
          <h4>Karolina Beatriz Lobato</h4>
          <p>
            Desenvolvidora de websites, responsável pela criação conceitual, visual e prática do Feli's Box.
          </p>
        </div>

        <div class="member">
          <img class="cat" src="../images/gato2.jpg" alt="cat2" />
          <h4>Pedro Paulo De Oliveira Dos Santos</h4>
          <p>
            Responsavél por toda a documentação geral do site, auxiliando na estrutura escrita do Feli's Box.
          </p>
        </div>

        <div class="member">
          <img class="cat" src="../images/gato3.jpg" alt="cat3" />
          <h4>Thiago Landini Vieira De Oliveira Silva</h4>
          <p>
            Responsavél pela modelagem do banco de dados, para armazenamento de dados dos usuários do Feli's Box.
          </p>
        </div>

      </div>

    </div>

  </body>
</html>
