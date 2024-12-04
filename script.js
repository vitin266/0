const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let round = 1;
let score = 0;
let player = { x: 400, y: 300, size: 30, speed: 3, type: "insect", canEat: ["frog"], dx: 0, dy: 0 };
let preys = [];
let predators = [];
let preyType = "insect";
let predatorType = "none";
let gameRunning = false;
let gamePaused = false;
let gameOverMessage = "";

const movement = { up: false, down: false, left: false, right: false };

// Dados dos animais
const animalData = {
  insect: { name: "Inseto", speed: 2, size: 10, predator: "frog", canEat: ["frog"], image: "assets/insect.png" },
  frog: { name: "Sapo", speed: 3, size: 20, predator: "bird", canEat: ["insect"], image: "assets/frog.png" },
  bird: { name: "Ave", speed: 6, size: 30, predator: "fox", canEat: ["frog"], image: "assets/bird.png" },
  rat: { name: "Rato", speed: 5, size: 25, predator: "fox", canEat: ["bird"], image: "assets/rat.png" },
  fox: { name: "Raposa", speed: 12, size: 40, predator: "eagle", canEat: ["rat", "bird"], image: "assets/fox.png" },
  eagle: { name: "Águia", speed: 15, size: 50, predator: "none", canEat: ["fox"], image: "assets/eagle.png" },
};

// Função para carregar imagens
const images = {};
function loadImages() {
  for (const type in animalData) {
    const img = new Image();
    img.src = animalData[type].image;
    images[type] = img;
  }
}

// Função para desenhar as entidades com imagem
function drawEntity(entity) {
  const img = images[entity.type];
  if (img) {
    ctx.drawImage(img, entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2);
  } else {
    // Caso a imagem não carregue, desenhe um círculo
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// O resto do seu código permanece o mesmo...
// Chame loadImages() antes de iniciar o jogo.

document.getElementById('startButton').addEventListener('click', startGame);

// Função para iniciar o jogo
function startGame() {
  loadImages(); // Carrega as imagens
  score = 0;
  round = 1;
  gameRunning = true;
  gamePaused = false;
  gameOverMessage = "";
  setupRound(); // Inicia o round 1
  drawGame(); // Começa o loop de renderização do jogo
}

// Restante do código para lógica do jogo...
