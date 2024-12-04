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

// Dados dos animais com tamanhos e velocidades ajustados
const animalData = {
  insect: { name: "Inseto", speed: 2, size: 10, predator: "frog", canEat: ["frog"], image: "images/insect.png" },
  frog: { name: "Sapo", speed: 3, size: 20, predator: "bird", canEat: ["insect"], image: "images/frog.png" },
  bird: { name: "Ave", speed: 6, size: 30, predator: "fox", canEat: ["frog"], image: "images/bird.png" },
  rat: { name: "Rato", speed: 5, size: 25, predator: "fox", canEat: ["bird"], image: "images/rat.png" },
  fox: { name: "Raposa", speed: 12, size: 40, predator: "eagle", canEat: ["rat", "bird"], image: "images/fox.png" },
  eagle: { name: "Águia", speed: 15, size: 50, predator: "none", canEat: ["fox"], image: "images/eagle.png" },
};

// Função para iniciar o round
function setupRound() {
  preys = [];
  predators = [];

  switch (round) {
    case 1: player.type = "insect"; preyType = "insect"; predatorType = "frog"; break;
    case 2: player.type = "frog"; preyType = "insect"; predatorType = "bird"; break;
    case 3: player.type = "bird"; preyType = "frog"; predatorType = "fox"; break;
    case 4: player.type = "rat"; preyType = "bird"; predatorType = "fox"; break;
    case 5: player.type = "fox"; preyType = "rat"; predatorType = "eagle"; break;
    case 6: player.type = "eagle"; preyType = "fox"; predatorType = "none"; break;
    default:
      alert(`Você venceu! Pontuação final: ${score}`);
      gameRunning = false;
      return;
  }

  // Atualiza as propriedades do jogador com base no novo tipo
  const playerData = animalData[player.type];
  player.size = playerData.size;
  player.speed = playerData.speed;
  player.canEat = playerData.canEat;

  // Cria novas presas e predadores
  for (let i = 0; i < 10; i++) preys.push(spawnEntity(preyType));
  if (predatorType !== "none") {
    for (let i = 0; i < 5; i++) predators.push(spawnEntity(predatorType));
  }
}

// Função para gerar entidades
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
    canEat: animal.canEat,
    image: new Image() // Criação da imagem
  };
}

// Função para carregar as imagens
function loadImages() {
  for (let key in animalData) {
    const entity = animalData[key];
    const img = new Image();
    img.src = entity.image;
    entity.image = img;
  }
}

// Função para desenhar as entidades com imagem
function drawEntity(entity) {
  const img = animalData[entity.type]?.image;

  if (img) {
    ctx.drawImage(img, entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2);
  } else {
    ctx.fillStyle = "gray"; // Fallback caso a imagem não carregue
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nome acima do animal
  const name = animalData[entity.type]?.name || "Desconhecido";
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(name, entity.x - ctx.measureText(name).width / 2, entity.y - entity.size - 10);
}

// Função para movimentar entidades
function moveEntity(entity) {
  entity.x += entity.dx * entity.speed;
  entity.y += entity.dy * entity.speed;

  if (entity.x - entity.size < 0 || entity.x + entity.size > canvas.width) entity.dx *= -1;
  if (entity.y - entity.size < 0 || entity.y + entity.size > canvas.height) entity.dy *= -1;
}

// Função para movimentar o jogador
function movePlayer() {
  if (movement.up && player.y - player.size > 0) player.y -= player.speed;
  if (movement.down && player.y + player.size < canvas.height) player.y += player.speed;
  if (movement.left && player.x - player.size > 0) player.x -= player.speed;
  if (movement.right && player.x + player.size < canvas.width) player.x += player.speed;
}

// Função principal de renderização
function drawGame() {
  if (!gameRunning || gamePaused) return;

  movePlayer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawEntity(player);

  preys.forEach(prey => {
    drawEntity(prey);
    moveEntity(prey);
    if (isColliding(player, prey)) {
      score += 5;
      preys = preys.filter(p => p !== prey);
    }
  });

  predators.forEach(predator => {
    drawEntity(predator);
    moveEntity(predator);
    if (isColliding(player, predator)) {
      if (player.canEat.includes(predator.type)) {
        score += 10;
        predators = predators.filter(p => p !== predator);
      } else {
        alert(`Game Over! Pontuação final: ${score}`);
        gameRunning = false;
        return;
      }
    }
  });

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Round: ${round}`, 10, 50);

  if (preys.length === 0) {
    round++;
    setupRound();
  }

  requestAnimationFrame(drawGame);
}

// Verifica colisão
function isColliding(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  return dist < a.size + b.size;
}

// Controle do movimento
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") movement.up = true;
  if (e.key === "ArrowDown") movement.down = true;
  if (e.key === "ArrowLeft") movement.left = true;
  if (e.key === "ArrowRight") movement.right = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowUp") movement.up = false;
  if (e.key === "ArrowDown") movement.down = false;
  if (e.key === "ArrowLeft") movement.left = false;
  if (e.key === "ArrowRight") movement.right = false;
});

// Controle do jogo
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseButton').addEventListener('click', pauseGame);
document.getElementById('resetButton').addEventListener('click', resetGame);

// Função para iniciar o jogo
function startGame() {
  score = 0;
  round = 1;
  gameRunning = true;
  gamePaused = false;
  gameOverMessage = "";
  player = { x: 400, y: 300, size: 30, speed: 3, type: "insect", canEat: ["frog"], dx: 0, dy: 0 };
  loadImages(); // Carregar imagens antes de iniciar o jogo
  setupRound();
  drawGame();
}

// Função para pausar o jogo
function pauseGame() {
  gamePaused = !gamePaused;
  if (!gamePaused) drawGame();
}

// Função para reiniciar o jogo
function resetGame() {
  score = 0;
  round = 1;
  gameRunning = false;
  gamePaused = false;
  preys = [];
  predators = [];
  loadImages(); // Carregar imagens ao resetar o jogo
  setupRound();
  drawGame();
}

// Inicializa o primeiro round
setupRound();
