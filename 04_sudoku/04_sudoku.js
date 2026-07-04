/*
 * sudoku.js
 * 
 * 해당 파일은 스도쿠 게임 UI와 플레이 로직을 처리하는 JavaScript 코드이다.
 * 
 * 주요 역할
 * - 퍼즐 생성 모듈(04_generate.js) 호출 및 퍼즐 생성
 * - HTML 요소를 생성하여 스도쿠 보드와 숫자 패드 구성
 * - 사용자 입력 처리 및 게임 상태 관리
 * 
 * 주요 데이터
 * - br, bc: 블록의 행과 열 크기
 * - size: 전체 보드 크기 (br * bc)
 * - sudoku_ori: 정답 스도쿠 보드
 * - sudoku: 문제 스도쿠 보드
 * - current: 현재 플레이어가 입력한 상태
 */

import { generate } from "./04_generate.js";


// ==============================
// DOM 요소 가져오기
// ==============================
const board = document.getElementById("board");
const numberPad = document.getElementById("number-pad");
const buttons = document.getElementById("buttons");

const newGamePanel = document.getElementById("new-game-panel");
const brInput = document.getElementById("br-input");
const bcInput = document.getElementById("bc-input");
const levelInput = document.getElementById("level-input");
const seedInput = document.getElementById("seed-input");

// ==============================
// URL 파라미터 처리
// ==============================
// ex) ?br=3&bc=3&level=0&seed=42
const params = new URLSearchParams(location.search);
let br = parseInt(params.get("br")) || 3;
let bc = parseInt(params.get("bc")) || 3;
let level = parseInt(params.get("level")) || 0;
let seed = parseInt(params.get("seed")) || 42;
let size = br * bc;
let size_plus_1 = size + 1;
board.style.setProperty("--size", size);
numberPad.style.setProperty("--number-count", size_plus_1);

// ==============================
// 스도쿠 퍼즐 변수
// ==============================

// cells[r][c]: (r, c) 위치의 셀 DOM 요소
let cells = [];
// checkButton, giveUpButton: Check와 Give Up 버튼 DOM 요소
let checkButton, giveUpButton;

// sudoku_ori: 정답 스도쿠 보드
// sudoku: 문제 스도쿠 보드
// current: 현재 플레이어가 입력한 상태
let sudoku_ori, sudoku, current;

// fr, fc: 현재 선택된 셀의 행과 열
let fr = null;
let fc = null;

// emptyCount: 현재 비어있는 셀의 개수
let emptyCount = 0;

// isFinish: 게임 종료 여부
let isFinish = false;

// ==============================
// 스도쿠 퍼즐 생성 및 초기화
// ==============================
[sudoku_ori, sudoku] = generate(br, bc, level, seed);
current = structuredClone(sudoku);

// 빈 셀 개수 계산
for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
        if (sudoku[r][c] === 0) emptyCount++;
    }
}

// ==============================
// 스도쿠 보드 및 UI 구성
// ==============================
createBoard();
createNumberPad();
createButtons();
setupNewGamePanel();

// =============================
// UI 구성 함수
// =============================
/**
 * createBoard
 * - size*size 크기의 스도쿠 보드의 셀을 생성하고 DOM에 추가한다.
 */
function createBoard() {
    for (let r = 0; r < size; r++) {
        cells[r] = [];
        for (let c = 0; c < size; c++) {

            const cell = document.createElement("div");
            cell.className = "cell";
            cell.classList.add("cell");

            const n = sudoku[r][c];

            cell.textContent = n == 0 ? "" : n;

            if (r % br === 0) cell.style.borderTop = "2px solid black";
            if (c % bc === 0) cell.style.borderLeft = "2px solid black";

            if (r === size - 1) cell.style.borderBottom = "2px solid black";
            if (c === size - 1) cell.style.borderRight = "2px solid black";

            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.dataset.num = n;

            cell.addEventListener("click", () => { handleCellClick(r, c, n); });

            cells[r][c] = cell;
            board.appendChild(cell);
        }
    }
}

/**
 * createNumberPad
 * - 0부터 size까지의 숫자 버튼을 생성하고 DOM에 추가한다.
 */
function createNumberPad() {
    for (let i = 0; i <= size; i++) {
        const numButton = document.createElement("button");
        numButton.className = "number-button";
        numButton.textContent = i;
        numButton.addEventListener("click", () => { handleNumberClick(i); });
        numberPad.appendChild(numButton);
    }
}
/**
 * createButtons
 * - Check와 Give Up 버튼을 생성하고 DOM에 추가한다.
 */
function createButtons() {
    checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.textContent = "Check";
    checkButton.addEventListener("click", () => { handleCheckClick() });
    buttons.appendChild(checkButton);

    giveUpButton = document.createElement("button");
    giveUpButton.className = "giveup-button";
    giveUpButton.textContent = "Give Up";
    giveUpButton.addEventListener("click", () => { handleGiveUpClick() });
    buttons.appendChild(giveUpButton);
}
/**
 * setupNewGamePanel
 * - 새로운 게임 패널의 submit 이벤트를 설정한다.
 */
function setupNewGamePanel() {
    newGamePanel.addEventListener("submit", handleNewGameSubmit);
}

// =============================
// Event Handle 함수
// =============================
/**
 * handleCellClick
 * - 사용자가 셀을 클릭했을 때 호출된다.
 * - 현재 선택된 셀의 위치를 fr, fc에 저장하고, 위반된 셀을 찾아서 보드를 다시 그린다.
 * @param {*} r 
 * @param {*} c 
 * @param {*} num 
 * @returns 
 */
function handleCellClick(r, c, num) {
    if (isFinish) return;

    fr = r;
    fc = c;

    const violations = findViolations();
    paintBoard(violations);
}

/**
 * handleNumberClick
 * - 사용자가 숫자 버튼을 클릭했을 때 호출된다.
 * - 현재 선택된 셀(fr, fc)에 해당 숫자를 입력하고, 위반된 셀을 찾아서 보드를 다시 그린다.
 * @param {*} num 
 * @returns 
 */
function handleNumberClick(num) {
    if (isFinish) return;

    if (fr === null || fc === null) return;

    if (sudoku[fr][fc] !== 0) return;

    const cell = cells[fr][fc];

    if (num === 0) {
        if (current[fr][fc] !== 0) emptyCount++;
        current[fr][fc] = 0;
        cell.textContent = "";
        const violations = findViolations();
        paintBoard(violations);
        return;
    }
    else {
        if (current[fr][fc] === 0) emptyCount--;
        current[fr][fc] = num;
        cell.textContent = num;
        
        const violations = findViolations();
        paintBoard(violations);

        if (emptyCount === 0 && checkAnswer()) {
            setFinish();
            alert("Congratulations!");
        }
    }
}
/**
 * handleCheckClick
 * - 사용자가 Check 버튼을 클릭했을 때 호출된다.
 * - 현재 입력된 상태가 정답인지 확인하고, 결과를 alert로 표시한다.
 * @returns 
 */
function handleCheckClick() {
    if (isFinish) return;
    let isCorrect = checkAnswer();
    if (isCorrect) {
        alert("Keep going!");
    } else {
        alert("Something is wrong...");
    }
}

/**
 * handleGiveUpClick
 * - 사용자가 Give Up 버튼을 클릭했을 때 호출된다.
 * - 현재 게임을 포기하고, 정답을 표시한다.
 * @returns 
 */
function handleGiveUpClick() {   
    if (isFinish) return;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const wasBlank = current[r][c] === 0;
            const wasWrong = current[r][c] !== 0 && current[r][c] !== sudoku_ori[r][c];
            const cell = cells[r][c];

            current[r][c] = sudoku_ori[r][c];
            cell.textContent = sudoku_ori[r][c];
            cell.style.backgroundColor = wasWrong ? "#FA8072" : "";

            if (sudoku[r][c] !== 0) {
                cell.style.color = "black";
            } else if (wasBlank || wasWrong) {
                cell.style.color = "#FF4500";
            } else {
                cell.style.color = "#1E90FF";
            }
        }
    }
    setFinish(true);
}

/**
 * handleNewGameSubmit
 * - 새로운 게임 패널에서 submit 이벤트가 발생했을 때 호출된다.
 * - 입력된 br, bc, level, seed 값을 가져와 URL 파라미터를 갱신하고 페이지를 새로고침한다.
 * @param {*} event 
 */
function handleNewGameSubmit(event) {
    event.preventDefault();

    const params = new URLSearchParams({
        br: brInput.value,
        bc: bcInput.value,
        level: levelInput.value,
        seed: seedInput.value
    });

    location.href = `${location.pathname}?${params.toString()}`;
}

// =============================
// 게임 로직 함수
// =============================
/**
 * findViolations
 * - 현재 입력된 상태에서 위반된 셀의 위치를 찾아 Set으로 반환한다.
 * - 행, 열, 블록 단위로 중복된 숫자가 있는지 확인한다.
 * @returns {Set} violations - 위반된 셀의 위치를 "r,c" 형식으로 저장한 Set
 */
function findViolations() {
    const violations = new Set();

    function addUnitViolations(unit) {
        const positionsByNum = new Map();

        for (const { r, c } of unit) {
            const num = current[r][c];
            if (num === 0) continue;

            if (!positionsByNum.has(num)) {
                positionsByNum.set(num, []);
            }
            positionsByNum.get(num).push({ r, c });
        }

        for (const positions of positionsByNum.values()) {
            if (positions.length < 2) continue;

            for (const { r, c } of positions) {
                violations.add(`${r},${c}`);
            }
        }
    }

    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            row.push({ r, c });
        }
        addUnitViolations(row);
    }

    for (let c = 0; c < size; c++) {
        const col = [];
        for (let r = 0; r < size; r++) {
            col.push({ r, c });
        }
        addUnitViolations(col);
    }

    for (let blockRow = 0; blockRow < size; blockRow += br) {
        for (let blockCol = 0; blockCol < size; blockCol += bc) {
            const block = [];
            for (let r = blockRow; r < blockRow + br; r++) {
                for (let c = blockCol; c < blockCol + bc; c++) {
                    block.push({ r, c });
                }
            }
            addUnitViolations(block);
        }
    }

    return violations;
}

/**
 * paintBoard
 * - 현재 게임 상태를 보드에 반영한다. 상태에 따른 색은 다음과 같다.
 *   * 위반된 셀: 빨간색 배경. 초기 셀이 아니라면 빨간색 글자
 *   * 초기 셀: 검은색 글자
 *   * 사용자 입력 셀: 파란색 글자
 *   * 선택된 셀: 파란색 배경
 * @param {Set} violations - 위반된 셀의 위치를 "r,c" 형식으로 저장한 Set
 */
function paintBoard(violations) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const isFocused = r === fr && c === fc;
            const cell = cells[r][c];
            const key = `${r},${c}`;

            cell.style.backgroundColor = "";
            
            if (violations.has(key)) {
                if (sudoku[r][c] !== 0) cell.style.color = "black";
                else cell.style.color = "#FF4500";
                cell.style.backgroundColor = "#FA8072";
            } else if (sudoku[r][c] !== 0) {
                cell.style.color = "black";
            } else if (current[r][c] !== 0) {
                cell.style.color = "#1E90FF";
            } else if (isFocused) {
                cell.style.backgroundColor = "#DDEBFF";
            } else {
                cell.style.color = "";
            }
        }
    }
}

/**
 * checkAnswer
 * - 현재 입력된 상태가 정답인지 확인한다.
 * @returns {boolean} isCorrect - 입력된 상태가 정답이면 true, 그렇지 않으면 false
 */
function checkAnswer() {
    let isCorrect = true;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (current[r][c] !== sudoku_ori[r][c]) {
                if (current[r][c] === 0) continue;
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) break;
    }
    return isCorrect;
}

/**
 * setFinish
 * - 게임을 종료 상태로 설정한다.
 */
function setFinish() {
    isFinish = true;
    newGamePanel.hidden = !isFinish;
    checkButton.disabled = isFinish;
    giveUpButton.disabled = isFinish;
}