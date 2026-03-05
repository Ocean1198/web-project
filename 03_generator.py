import random

# make_ans: 정답 생성 함수. 블록 크기(br, bc)를 입력받아 정답(2차원 리스트)을 출력한다.
def make_ans(br, bc) : 

    # n: size of sudoku(n*n size), max number(1~n)
    n = br * bc

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

# solver: 스도쿠 풀이 함수. 블록 크기(br, bc)와 스도쿠를 입력받아 해답의 개수와 탐색 횟수를 출력한다.
def solver(board, br, bc) : 

    n = br * bc
    sol = 0
    backtrack = 0

    row = [set(board[i]) for i in range(n)]
    col = [set([r[i] for r in board]) for i in range(n)]
    block = [set() for _ in range(n)]
    block_idx = [(r // br) * br + (c // bc)
             for r in range(n)
             for c in range(n)]
    
    empty_cells = []
    for i in range(len(board)) : 
        for j in range(len(board[0])) : 
            if board[i][j] == 0 : 
                empty_cells.append((i,j))
            block[block_idx[i*n+j]].add(board[i][j])

    def dfs(index) : 
        nonlocal sol, backtrack
        backtrack += 1
        if sol >= 2 : 
            return 2
        if index == len(empty_cells) : 
            # # test
            # for i in board : 
            #     print(*i)
            # sol += 1
            return sol
        
        r, c = empty_cells[index]
        b = (r // br) * br + (c // bc)

        # 규칙 검사
        available = list(
            set(range(1, n+1))
            - row[r]
            - col[c]
            - block[b]
        )
        for num in available : 
            board[r][c] = num
            row[r].add(num)
            col[c].add(num)
            block[b].add(num)
            
            # print(index, depth, board)

            dfs(index+1)
            
            board[r][c] = 0
            row[r].remove(num)
            col[c].remove(num)
            block[b].remove(num)

        return sol

    dfs(0)
    return sol, backtrack

# generate: 스도쿠 문제 생성 함수. 블록 크기(br, bc)와 난이도를 입력받아 문제(2차원 리스트)를 출력한다.
def generate(br, bc, level, seed = 42) : 
    """
    기본 진행
    1. 완성본을 만든다. 
    2. 완성본에서 하나씩 숫자를 랜덤으로 지운다. 
    3. 일부 지워진 완성본을 solver로 풀이한다. 
    4. 2-3을 반복하며 난이도에 따른 조건 중 하나를 만족하면 문제를 내보낸다.
        조건1. 힌트 개수의 비율(전체 대비 20~40%)
        조건2. solver의 탐색 횟수

    난이도는 쉬움/보통/어려움/극한 4개로만 구분하며, 다음과 같이 사용(추후 수정 가능)
    쉬움: 40% 정도의 힌트, 1000회 이하의 탐색 횟수
    보통: 35% 정도의 힌트, 10000회 이하의 탐색 횟수
    어려움: 30% 정도의 힌트, 50000회 이하의 탐색 횟수
    극한: 25% 정도의 힌트, 100000회 이하의 탐색 횟수
    *sudoku.com의 extreme 난이도(최고 난이도) 문제 중 하나의 탐색 횟수는 198132회였다.
    """

    n = br * bc
    # board: n*n size list
    board = make_ans(br, bc)

    # 이 아래는 조건에 맞을 때까지 반복
    removed_idx = []
    

"""
편의상 level은 다음과 같이 지정
easy(쉬움)      : 1
normal(보통)    : 2
hard(어려움)    : 3
extreme(극한)   : 4
"""