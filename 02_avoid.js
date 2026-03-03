const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 플레이어 객체
const player = {
    x: 180,
    y: 550,
    width: 40,
    height: 40,
    speed: 5
};

// 장애물 배열
const obstacles = [];
// 장애물 생성 타이머
let spawnTimer = 0;
// 장애물 생성 주기
let basicSpawnCycle = 60;
let spawnCycle = basicSpawnCycle;

// 점수
let score = 0;

// 일시정지
let isPaused = false;
// 게임 오버 감지
let isGameOver = false;

// 키 상태 저장
const keys = {
    left: false,
    right: false
};

// 최고 점수
let highScore = Number(localStorage.getItem("highScore")) || 0;

// 개발자 모드
const devMode = document.getElementById("devMode");
const devPanel = document.getElementById("devPanel");

devMode.addEventListener("change", () => {
    devPanel.style.display = devMode.checked ? "block" : "none";
});

// 개발자 모드에 의한 변수 조절
const speedControl = document.getElementById("speedControl");
const spawnControl = document.getElementById("spawnControl");

speedControl.addEventListener("input", () => {
    player.speed = Number(speedControl.value);
    document.getElementById("speedValue").textContent = player.speed;
});

spawnControl.addEventListener("input", () => {
    basicSpawnCycle = Number(spawnControl.value);
    document.getElementById("spawnCycleValue").textContent = Math.floor(spawnCycle);
});

// 키 이벤트 리스너
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "A" || e.key === "a") {
        keys.left = true;
    }
    if (e.key === "ArrowRight" || e.key === "D" || e.key === "d") {
        keys.right = true;
    }
    if (e.key === "r" || e.key === "R") {
        if (isGameOver) {
            resetGame();
        }
    }
    if (e.key === "p" || e.key === "P") {
        isPaused = !isPaused;
    }
});

window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "A" || e.key === "a") {
        keys.left = false;
    }
    if (e.key === "ArrowRight" || e.key === "D" || e.key === "d") {
        keys.right = false;
  }
});

// 장애물 생성
function spawnObstacle() {
    const width = 40;

    const obstacle = {
        x: Math.random() * (canvas.width - width),
        y: 0,
        width: width,
        height: 40,
        speed: 3
    };

    // 장애물 배열에 장애물 추가
    obstacles.push(obstacle);
}

// 충돌 감지 함수 (AABB)
function isColliding(a, b) {
    return !(
        a.x + a.width < b.x ||
        a.x > b.x + b.width ||
        a.y + a.height < b.y ||
        a.y > b.y + b.height
    );
}

// reset 함수
function resetGame() {
    player.x = 180;
    player.y = 550;

    obstacles.length = 0;

    spawnTimer = 0;
    spawnCycle = basicSpawnCycle;
    score = 0;

    isGameOver = false;
}

function update() {
    if (isGameOver) return;

    // 점수 증가
    score++;

    // 플레이어 이동
    if (keys.left) {
        player.x -= player.speed;
    }
    if (keys.right) {
        player.x += player.speed;
    }

    // canvas 탈주 방지
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // 장애물 생성 주기 관리
    spawnCycle = basicSpawnCycle - (score*0.02)
    if (spawnCycle < 15) spawnCycle = 15;

    // 타이머 기반 장애물 생성
    spawnTimer++;
    if (spawnTimer > spawnCycle) {
        spawnObstacle();
        spawnTimer = 0;
    }

    // 장애물 이동
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacles[i].speed;
    }

    // canvas를 벗어난 장애물 삭제
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        if (isColliding(player, obstacles[i])) {
            isGameOver = true;
            console.log("Game Over");
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }
    }
}

function draw() {
    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 플레이어
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 장애물
    ctx.fillStyle = "red";
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // 점수 표시
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    // 일시정지
    if (isPaused) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("PAUSED", canvas.width / 2 - 60, canvas.height / 2);
    }

    // 게임 오버 메시지
    if (isGameOver) {
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 80, 300);
        
        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", 110, 350);
        
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`High Score: ${highScore}`, 10, 60);
    }
}

function gameLoop() {
    if (!isPaused && !isGameOver) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();