Salve Karol

Dei uma ajeitadinha no teu trampo aqui pra te dar uma força no desenvolvimento ai do teu projeto, creio que seja pro teu curso, papo de TCC (que medo) então uma mão lava a outra 🤝

Aqui é pra te ajudar a montar um backend de responsa usando API (pelo menos do jeito que eu sei fazer). Abaixo eu deixei a estrutura do diretório/pasta do backend pra você entender certinho como funciona

backend/
├── server.js                 # Arquivo principal - Server de BackEnd
├── routes/                   # ← Definição das rotas
│   ├── index.js             # Agrupa todas as rotas
│   ├── posts.js             # Rotas de posts (exemplo)
│   └── users.js             # Rotas de usuários/perfil (exemplo)
├── controllers/              # Lógica de negócio (exempo)
│   ├── postController.js
│   └── userController.js
└── package.json


---

Fazer uma explicação rápidinha de como tudo funciona, mas incentivo você pesquisar usando as IAs que vão roubar nossos empregos sobre como tudo isso funciona na prática

server.js --> Servidor de BackEnd

- Ele é o arquivo principal do seu BackEnd
- Ele é o responsável por compilar todas as rotas e controllers

/routes --> Diretório de rotas:

- É o diretório em que você vai armazenar as suas diversas rotas
- Você pode especificar dentro do próprio arquivo da rota vários parametros que muda como ela age, baseado em alguns parametros e na controlador (função) designado

/controllers --> Diretório de controladores:

- É o diretório onde você vai armazenar suas lógicas de negócio (Ou seja, literalmente toda a lógica)
- É um arquivo em que você define diversas funções para serem utilizadas quando determinada rota for chamada

---

Recomendo também que você busque pesquisar e utilizar o supabase, é um saas de banco de dados "gratuito" (Ele é pago mas apenas pra projetos de larga escala, então você não precisa se preocupar com gasto) em que você pode integrar seus website de maneira bem limpa e tranquila

---

Repare que eu não deixei um arquivo package.json no seu diretório, justamente por que eu quero tu crie esse arquivo com o comando

npm init

*A biblioteca JS usada para criação de api é o "Express"*, então roda esse comando:

npm install express cors

(cors é um bglh avançado que faz o express funcionar mas tu não precisa saber disso agora, só baixar. Mas eu acho válido estudar isso também)

**Tu só consegue baixar essas coisas depois de criar seu package.json**