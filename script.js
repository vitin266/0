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

// Adiciona as imagens para os animais
const images = {
  insect: new Image(),
  frog: new Image(),
  bird: new Image(),
  rat: new Image(),
  fox: new Image(),
  eagle: new Image(),
};

// Define os caminhos das imagens
images.insect.src = "images/insect.png";
images.frog.src = "images/frog.png";
images.bird.src = "images/bird.png";
images.rat.src = "images/rat.png";
images.fox.src = "images/fox.png";
images.eagle.src = "images/eagle.png";

// Dados dos animais com tamanhos e velocidades ajustados de acordo com a cadeia alimentar
const animalData = {
  insect: { name: "Inseto", speed: 2, size: 10, predator: "frog", canEat: ["frog"] },
  frog: { name: "Sapo", speed: 3, size: 20, predator: "bird", prey: ["insect"], canEat: ["insect"] },
  bird: { name: "Ave", speed: 6, size: 30, predator: "fox", prey: ["rat"], canEat: ["frog"] },
  rat: { name: "Rato", speed: 5, size: 25, predator: "fox", prey: [], canEat: ["bird"] },
  fox: { name: "Raposa", speed: 12, size: 40, predator: "eagle", prey: ["bird", "rat"], canEat: ["rat", "bird"] },
  eagle: { name: "Águia", speed: 15, size: 50, predator: "none", prey: ["rat", "bird"], canEat: ["fox"] },
};

// Função para iniciar o round
function setupRound() {
  preys = [];
  predators = [];

  switch (round) {
    case 1: player.type = "insect"; preyType = "insect"; predatorType = "frog"; break;
    case 2: player.type = "frog"; preyType = "insect"; predatorType = "bird"; break;
    case 3: player.type = "bird"; preyType = "rat"; predatorType = "fox"; break;
    case 4: player.type = "rat"; preyType = "insect"; predatorType = "fox"; break;
    case 5: player.type = "fox"; preyType = "bird"; predatorType = "eagle"; break;
    case 6: player.type = "eagle"; preyType = "rat"; predatorType = "eagle"; break; // Águia contra Águia
  }

  // Cria as presas e predadores para o round atual
  for (let i = 0; i < 10; i++) preys.push(spawnEntity(preyType));
  if (predatorType !== "none") predators.push(spawnEntity(predatorType));
}

// Função para gerar entidades (animais)
function spawnEntity(type) {
  const animal = animalData[type];
  return {
    type,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: animal.size,
    speed: animal.speed,
    dx: Math.random() < 0.5 ? 1 : -1,
    dy: Math.random() < 0.5 ? 1 : -1,
    canEat: animal.canEat
  };
}

// Função para desenhar as entidades no canvas usando imagens
function drawEntity(entity) {
  const image = images[entity.type];

  if (image.complete) {
    ctx.drawImage(
      image,
      entity.x - entity.size, // Centraliza a imagem
      entity.y - entity.size,
      entity.size * 2,        // Largura
      entity.size * 2         // Altura
    );
  } else {
    // Desenha um círculo temporário enquanto a imagem não carrega
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Função para mover a entidade
function moveEntity(entity) {
  entity.x += entity.dx * entity.speed;
  entity.y += entity.dy * entity.speed;

  // Limita as entidades aos limites da tela
  if (entity.x - entity.size < 0) { entity.x = entity.size; entity.dx *= -1; }
  if (entity.x + entity.size > canvas.width) { entity.x = canvas.width - entity.size; entity.dx *= -1; }
  if (entity.y - entity.size < 0) { entity.y = entity.size; entity.dy *= -1; }
  if (entity.y + entity.size > canvas.height) { entity.y = canvas.height - entity.size; entity.dy *= -1; }
}

// Outras funções continuam iguais, mas agora o jogador e os animais são desenhados com imagens.
