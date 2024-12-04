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

// Função para desenhar as entidades
function drawEntity(entity) {
  const img = images[entity.type];
  if (img) {
    ctx.drawImage(img, entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2);
  } else {
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
    ctx.fill();
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
  };
}

// Função para verificar colisão
function isColliding(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  return dist < a.size + b.size;
}

// Função para mover entidades
function moveEntity(entity) {
  entity.x += entity.dx * entity.speed;
  entity.y += entity.dy * entity.speed;
  if (entity.x - entity.size < 0 || entity.x + entity.size > canvas.width) entity.dx *= -1;
  if (entity.y - entity.size < 0 || entity.y + entity.size > canvas.height) entity.dy *= -1;
}

// Função para mover o jogador
function movePlayer() {
  if (movement.up && player.y - player.size > 0) player.y -= player.speed;
  if (movement.down && player.y + player.size < canvas.height) player.y += player.speed;
  if (movement.left && player.x - player.size > 0) player.x -= player.speed;
  if (movement.right && player.x + player.size < canvas.width) player.x += player.speed;
}

// Função principal do jogo
function drawGame() {
  if (!gameRunning || gamePaused) return;

  movePlayer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha o jogador
  drawEntity(player);

  // Atualiza e desenha as presas
  preys.forEach(prey => {
    drawEntity(prey);
    moveEntity(prey);

    // Verifica colisão com o jogador
    if (isColliding(player, prey)) {
      score += 5;
      preys = preys.filter(p => p !== prey);
    }
  });

  // Atualiza e desenha os predadores
  predators.forEach(predator => {
    drawEntity(predator);
    moveEntity(predator);

    // Verifica colisão com o jogador
    if (isColliding(player, predator)) {
      if (player.canEat.includes(predator.type)) {
        score += 10; // Se o jogador pode comer o predador
        predators = predators.filter(p => p !== predator);
      } else {
        alert(`Game Over! Pontuação final: ${score}`);
        gameRunning = false;
      }
    }
  });

  // Atualiza a pontuação e o round
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Round: ${round}`, 10, 50);

  // Checa se todas as presas foram eliminadas
  if (preys.length === 0) {
    round++;
    setupRound();
  }

  requestAnimationFrame(drawGame);
}


// Configuração do round
function setupRound() {
  preys = [];
  predators = [];

  // Define o tipo de jogador, presas e predadores com base no round atual
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
  for (let i = 0; i < 10; i++) {
    preys.push(spawnEntity(preyType));
  }
  if (predatorType !== "none") {
    for (let i = 0; i < 5; i++) {
      predators.push(spawnEntity(predatorType));
    }
  }
}


// Eventos de controle
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

// Botões
document.getElementById('startButton').addEventListener('click', () => {
  loadImages();
  gameRunning = true;
  score = 0;
  round = 1;
  setupRound();
  drawGame();
});
document.getElementById('pauseButton').addEventListener('click', () => {
  gamePaused = !gamePaused;
  if (!gamePaused) drawGame();
});
document.getElementById('resetButton').addEventListener('click', () => {
  gameRunning = false;
  preys = [];
  predators = [];
  score = 0;
  round = 1;
  setupRound();
  drawGame();
});
