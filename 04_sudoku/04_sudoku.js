/*
스도쿠 웹페이지의 기초
python 파일로 이미 스도쿠 문제 생성의 알고리즘은 작성되어 있음
1. 이를 여기에 옮길지, python을 그대로 사용할지 확인해야 하고
2. 이후에 간단한 형식으로나마 플레이할 수 있게 해야 한다.

그 이후에는 
1. 키보드, 마우스, 터치 등의 동작을 구현
2. sudoku의 난이도나 규칙을 설정
3. 타이머나 기록
4. 시드 공유
5. 디자인
등등...
*/

import { make_ans } from "./04_generate.js";

const board = document.getElementById("board");

const br = 3
const bc = 3
const size = br*bc
board.style.setProperty("--size", size)

const sudoku = make_ans(br, bc);

for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {

        const cell = document.createElement("div");
        cell.className = "cell";
        cell.classList.add("cell");

        const n = sudoku[r][c];

        cell.textContent = n;

        if (r % br === 0) cell.style.borderTop = "2px solid black";
        if (c % bc === 0) cell.style.borderLeft = "2px solid black";

        if (r === size - 1) cell.style.borderBottom = "2px solid black";
        if (c === size - 1) cell.style.borderRight = "2px solid black";

        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.dataset.num = n;

        cell.addEventListener("click", () => {
            clicked(r, c, n);
        });

        board.appendChild(cell);

    }
}

function clicked(r, c, num) {
    console.log(r, c, num)
}