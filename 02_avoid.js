const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 배경
ctx.fillStyle = "lightgray";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 플레이어(임시)
ctx.fillStyle = "blue";
ctx.fillRect(180, 550, 40, 40);
