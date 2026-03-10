export function make_ans(br, bc, seed = 42) { 
    let n = br*bc;

    let board = array2d(n);
    let row = Array.from({length: n}, () => new Set());
    let col = Array.from({length: n}, () => new Set());
    let block = Array.from({length: n}, () => new Set());

    const random = mulberry32(seed);

    function dfs(r, c) {
        if (c == n) 
            return true;

        const block_idx = Math.floor(r / br) * bc + Math.floor(c / bc);
        const available = [];

        let result;

        for (let i = 1; i < n+1; i++) {
            if (!row[r].has(i) &&
                !col[c].has(i) &&
                !block[block_idx].has(i)){
                available.push(i);
            }
        }

        if (available === 0) 
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

    dfs(0, 0);

    return board;
};

function array2d(size) {
    let arr = new Array(size);
    for (let i = 0; i < size;  i++)
        arr[i] = new Array(size);
    return arr
}

function shuffle(arr, random) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function solver(board) {

}

function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}