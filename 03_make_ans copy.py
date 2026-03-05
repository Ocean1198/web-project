import random

# 정답 생성 코드. 블록의 크기를 입력받고, 해당하는 스도쿠 정답을 출력한다.
def make_ans(br, bc, r = 0, c = 0, board = None, seed = 42,
         row = None, col = None, block = None) : 

    # n: size of sudoku(n*n size), max number(1~n)
    n = br * bc
    random.seed(seed)

    board = [[0 for _ in range(n)] for _ in range(n)]
    row = [set() for _ in range(n)]
    col = [set() for _ in range(n)]
    block = [set() for _ in range(n)]

    def dfs(r, c) : 
        if c == n : 
            return True
        
        block_idx = (r // br) * br + (c // bc)

        available = list(
            set(range(1, n+1))
            - row[r]
            - col[c]
            - block[block_idx]
        )

        if not available : 
            return False
    
        random.shuffle(available)
        
        for num in available : 
            board[r][c] = num
            row[r].add(num)
            col[c].add(num)
            block[block_idx].add(num)

            if r == n-1 : 
                result = dfs(0, c+1)
            else : 
                result = dfs(r+1, c)
            if result : 
                return result
            
            board[r][c] = 0
            row[r].remove(num)
            col[c].remove(num)
            block[block_idx].remove(num)

    dfs(0, 0)
        

    return board

if __name__ == "__main__" : 

    # test code: make 4*4 sudoku
    board = make_ans(2, 2)
    for i in board : 
        print(*i)