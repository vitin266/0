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

// Função para desenhar as entidades no canvas
function drawEntity(entity, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
  ctx.fill();

  // Desenha o nome do animal acima dele
  const animal = animalData[entity.type];
  const name = animal ? animal.name : "Desconhecido";
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(name, entity.x - ctx.measureText(name).width / 2, entity.y - entity.size - 10);
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

// Função para mover o jogador
function movePlayer() {
  if (movement.up && player.y - player.size > 0) player.y -= player.speed;
  if (movement.down && player.y + player.size < canvas.height) player.y += player.speed;
  if (movement.left && player.x - player.size > 0) player.x -= player.speed;
  if (movement.right && player.x + player.size < canvas.width) player.x += player.speed;
}

// Função principal de renderização do jogo
function drawGame() {
  if (!gameRunning || gamePaused) return;

  movePlayer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawEntity(player, "blue");

  // Desenha as presas
  for (const prey of preys) {
    drawEntity(prey, "green");
    moveEntity(prey);

    // Verifica colisão com o jogador
    if (isColliding(player, prey)) {
      score += 5;
      preys = preys.filter(p => p !== prey);
    }
  }

  // Desenha os predadores
  for (const predator of predators) {
    drawEntity(predator, "red");
    moveEntity(predator);

    // Verifica colisão com o jogador
    if (isColliding(player, predator)) {
      // Se o jogador (presente) "come" o predador (exemplo, se for maior que o predador ou o predador for predado)
      if (player.canEat.includes(predator.type)) {
        score += 10; // Pontuação maior se o jogador comer o predador
        predators = predators.filter(p => p !== predator);
      } else {
        // Caso o jogador morra
        gameOverMessage = "Lembre-se, nem sempre você é o maior, um dia você pode ser o caçador e no outro a caça";
        alert("Game Over! Final Score: " + score);
        gameRunning = false;
        return;
      }
    }
  }

  // Exibe a pontuação
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Round: " + round, 10, 50);

  // Passa para o próximo round
  if (score >= 25 * round) {
    round++;
    if (round > 6) {
      alert("Você venceu! Pontuação Final: " + score);
      gameRunning = false;
      return;
    }
    setupRound();
  }

  // Exibe a mensagem de game over no centro
  if (gameOverMessage) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(drawGame);
}

// Função para verificar colisão entre dois objetos
function isColliding(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  return dist < a.size + b.size;
}

// Funções para controlar os movimentos do jogador com o clique nos botões
function setMovement(direction, state) {
  movement[direction] = state;
}

// Eventos para controle
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
  setupRound(); // Inicia o round 1
  drawGame(); // Começa o loop de renderização do jogo
}

// Função para pausar o jogo
function pauseGame() {
  gamePaused = !gamePaused;
  if (gamePaused) {
    alert("Jogo pausado!");
  } else {
    alert("Jogo retomado!");
    drawGame(); // Retoma o loop de renderização
  }
}

// Função para reiniciar o jogo
function resetGame() {
  score = 0;
  round = 1;
  gameRunning = false;
  gamePaused = false;
  gameOverMessage = "";
  preys = [];
  predators = [];
  alert("Jogo reiniciado!");
  setupRound();
  drawGame();
}

// Inicializa o jogo com o primeiro round
setupRound();