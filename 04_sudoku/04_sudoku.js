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

import { generate } from "./04_generate.js";

const board = document.getElementById("board");
const numberPad = document.getElementById("number-pad");

const br = 3
const bc = 3
const level = 0
const size = br*bc
board.style.setProperty("--size", size)
numberPad.style.setProperty("--size", size)

const cells = [];

// sudoku_ori: 정답
// sudoku: 문제 원본
const [sudoku_ori, sudoku] = generate(br, bc, level);
const current = structuredClone(sudoku);

// for (let i = 0; i < br*bc; i++) {
//     console.log(sudoku_ori[i]);
// }

const fr, fc;

for (let r = 0; r < size; r++) {
    cells[r] = [];
    for (let c = 0; c < size; c++) {

        const cell = document.createElement("div");
        cell.className = "cell";
        cell.classList.add("cell");

        const n = sudoku[r][c];

        cell.textContent = n == 0 ? "" : n;

        // 각 블록의 굵은 경계
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

        cells[r][c] = cell;
        board.appendChild(cell);
    }
}

for (let i = 1; i <= size; i++) {
    const numButton = document.createElement("button");
    numButton.className = "number-button";
    numButton.textContent = i;
    numButton.addEventListener("click", () => {
        inputNum(i);
    });
    numberPad.appendChild(numButton);
}

function clicked(r, c, num) {
    console.log(r, c, num)
    fr = r;
    fc = c;
}

function isValidMove(row, col, num) {
    for (let c = 0; c < size; c++) {
        if (c !== col && current[row][c] === num) return false;
    }

    for (let r = 0; r < size; r++) {
        if (r !== row && current[r][col] === num) return false;
    }

    const blockStartRow = Math.floor(row / br) * br;
    const blockStartCol = Math.floor(col / bc) * bc;

    for (let r = blockStartRow; r < blockStartRow + br; r++) {
        for (let c = blockStartCol; c < blockStartCol + bc; c++) {
            if ((r !== row || c !== col) && current[r][c] === num) return false;
        }
    }

    return true;
}

function inputNum(num) {
    if (fr === null || fc === null) return;

    if (sudoku[fr][fc] !== 0) return;

    const cell = cells[fr][fc];

    current[fr][fc] = num;
    cell.textContent = num;

    if (isValidMove(fr, fc, num))
        cell.style.color = "#1E90FF";
    else 
        cell.style.color = "#FF4500";
}
