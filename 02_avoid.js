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

// 키 상태 저장
const keys = {
    left: false,
    right: false
};

// 키 이벤트 리스너
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        keys.left = true;
    }
    if (e.key === "ArrowRight") {
        keys.right = true;
    }
});

window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") {
        keys.left = false;
    }
    if (e.key === "ArrowRight") {
        keys.right = false;
  }
});


function update() {
    if (keys.left) {
        player.x -= player.speed;
    }
    if (keys.right) {
        player.x += player.speed;
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
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
