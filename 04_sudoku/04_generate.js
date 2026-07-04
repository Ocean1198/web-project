/**
 * generate
 * - 주어진 블록 크기(br, bc)와 난이도(level)에 따라 스도쿠 퍼즐을 생성한다.
 * - 퍼즐은 유일해를 보장하며, 힌트 수와 백트래킹 횟수에 따라 난이도를 조절한다. 
 * @param {*} br    블록의 행 크기
 * @param {*} bc    블록의 열 크기
 * @param {*} level 난이도 (0~3)
 * @param {*} seed  난수 생성 시드
 * @returns {[number[][], number[][]]}
 *          [정답 보드, 플레이용 보드]
 */
export function generate(br, bc, level, seed = 42) {

    const random = mulberry32(seed);

    let n = br * bc;
    let board_ori = make_ans(br, bc, random);
    let board = board_ori.map(row => row.slice());

    const min_hint = Math.round(n*n * [0.4, 0.35, 0.3, 0.25][level]);
    const max_att = [1000, 10000, 50000, 100000][level];

    let random_idx = [];
    for (let r = 0; r < n; r++) 
        for (let c = 0; c < n; c++) 
            random_idx.push([r,c]);
    shuffle(random_idx, random);

    let hint = n*n;

    for (let i = 0; i < random_idx.length; i++) {
        let [rr, rc] = random_idx[i];
        const ori = board[rr][rc];
        board[rr][rc] = 0;
        hint -= 1;
        let [sol, att] = solver(board, br, bc);
        if (sol != 1) {
            board[rr][rc] = ori;
            hint += 1;
        }
        if (att > max_att || hint - 1 < min_hint)
            break
    }

    return [board_ori, board]

}

/**
 * 정답 보드를 생성한다.
 * @param {*} br         블록의 행 크기
 * @param {*} bc         블록의 열 크기
 * @param {*} random     난수 생성기
 * @returns {number[][]} 생성된 정답 보드
 */
function make_ans(br, bc, random) { 
    let n = br*bc;

    let board = array2d(n);
    let row = Array.from({length: n}, () => new Set());
    let col = Array.from({length: n}, () => new Set());
    let block = Array.from({length: n}, () => new Set());

    function dfs(r, c) {
        if (c == n) 
            return true;

        const block_idx = Math.floor(r / br) * br + Math.floor(c / bc);
        const available = [];

        let result;

        for (let i = 1; i < n+1; i++) {
            if (!row[r].has(i) &&
                !col[c].has(i) &&
                !block[block_idx].has(i)){
                available.push(i);
            }
        }

        if (available.length === 0) 
            return false;

        shuffle(available, random);

        for (let i = 0; i < available.length; i++) {
            let num = available[i];
            board[r][c] = num;
            row[r].add(num);
            col[c].add(num);
            block[block_idx].add(num)

            if (r == n-1) 
                result = dfs(0, c+1);
            else
                result = dfs(r+1, c);
            if (result)
                return result;

            board[r][c] = 0;
            row[r].delete(num);
            col[c].delete(num);
            block[block_idx].delete(num);
        }
   
    }

    if (dfs(0, 0)) {
        return board;
    }
    throw new Error("No solution found");
}

/**
 * 스도쿠 퍼즐을 해결한다.
 * @param {*} board            퍼즐 보드
 * @param {*} br               블록의 행 크기
 * @param {*} bc               블록의 열 크기
 * @returns {[number, number]} [해결된 퍼즐 수, 백트래킹 횟수]
 */
function solver(board, br, bc) {
    let n = br * bc;
    let sol = 0;
    let backtrack = 0;
    
    const row = Array.from({length: n}, (_, i) => new Set(board[i]));
    const col = Array.from({length: n}, (_, i) => new Set(board.map(r => r[i])));
    const block = Array.from({length: n}, () => new Set());

    const block_idx = [];
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            block_idx.push(Math.floor(r / br) * br + Math.floor(c / bc));
        }
    }
    
    const empty_cells = [];
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {

            if (board[i][j] === 0) {
                empty_cells.push([i, j]);
            }

            block[block_idx[i*n + j]].add(board[i][j]);
        }
    }
    
    function dfs(index) {
        backtrack += 1;
        if (sol >= 2) 
            return 2;
        if (index == empty_cells.length) {
            sol += 1
            return sol
        }
        
        const [r, c] = empty_cells[index];
        const b = Math.floor(r / br) * br + Math.floor(c / bc);
        
        const available = [];
        for (let i = 1; i <= n; i++) {
            if (!row[r].has(i) &&
                !col[c].has(i) &&
                !block[b].has(i)){
                available.push(i);
            }
        }
        
        for (let i = 0; i < available.length; i++) {
            let num = available[i];
            board[r][c] = num;
            row[r].add(num);
            col[c].add(num);
            block[b].add(num)
            
            dfs(index + 1);
            
            board[r][c] = 0;
            row[r].delete(num);
            col[c].delete(num);
            block[b].delete(num);
        }
        
        return sol;
    }
    
    dfs(0);
    return [sol, backtrack];
    
}

// 2차원 배열 생성
function array2d(size) {
    let arr = new Array(size);
    for (let i = 0; i < size;  i++)
        arr[i] = new Array(size);
    return arr
}
// 배열 shuffle
function shuffle(arr, random) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
// Mulberry32 난수 생성기
function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}