"""    
Sudoku Generator

스도쿠의 블록 크기와 난이도를 바탕으로 스도쿠 문제와 정답을 생성합니다.

1. make_ans : 완성된 스도쿠 생성
2. solver   : 스도쿠 풀이, 해답 개수 확인
3. generator: 난이도 기반의 스도쿠 문제 생성

난이도의 구분:
- 쉬움(0): 
    ~ 40%의 힌트 개수, 1000회 이하의 탐색 횟수
- 보통(1):
    ~ 35%의 힌트 개수, 10000회 이하의 탐색 횟수
- 어려움(2) : 
    ~ 30%의 힌트 개수, 50000회 이하의 탐색 횟수
- 극한(3) : 
    ~ 25%의 힌트 개수, 100000회 이하의 탐색 횟수

지원되는 스도쿠 크기:
- br * bc 블록 스도쿠
- 예: 3*3 >> 9*9 스도쿠
- 예: 2*3 >> 6*6 스도쿠
"""

import random

def make_ans(br, bc) : 
    """
    완전한 스도쿠를 만듭니다.

    
    입력
    ----------
    br: int
        스도쿠 내 블록들의 행(row)
    bc: int
        스도쿠 내 블록들의 열(column)

    출력
    ----------
    board: list[list[int]]
        n*n 크기의 완전한 스도쿠
    """

    n = br * bc

    board = [[0 for _ in range(n)] for _ in range(n)]
    row = [set() for _ in range(n)]
    col = [set() for _ in range(n)]
    block = [set() for _ in range(n)]

    def dfs(r, c) : 
        if c == n : 
            return True
        
        block_idx = (r // br) * bc + (c // bc)

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
    """
    주어진 스도쿠를 풀이하고, 해의 개수를 반환합니다.

    입력
    ----------
    board: list[list[int]]
        풀이할 스도쿠 문제(n*n 크기)
    br: int
        스도쿠 내 블록들의 행(row)
    bc: int
        스도쿠 내 블록들의 열(column)

    출력
    ----------
    sol: int
        스도쿠 해의 갯수
    backtrack: int
        정답 탐색 횟수
    """

    n = br * bc
    sol = 0
    backtrack = 0

    row = [set(board[i]) for i in range(n)]
    col = [set([r[i] for r in board]) for i in range(n)]
    block = [set() for _ in range(n)]
    block_idx = [(r // br) * bc + (c // bc)
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
            sol += 1
            return sol
        
        r, c = empty_cells[index]
        b = (r // br) * bc + (c // bc)

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
    n*n 크기의 스도쿠 문제를 만듭니다.

    입력
    ----------
    br: int
        스도쿠 내 블록의 열(row)
    bc: int
        스도쿠 내 블록의 행(column)
    level: int
        문제의 난이도
        0: 쉬움
        1: 보통
        2: 어려움
        3: 극한
    seed: int, optional (default = 42)
        퍼즐 생성의 seed

    출력
    ----------
    board_ori: list[list[int]]
        완전한 스도쿠
    board: list[list[int]]
        빈칸이 0인 스도쿠 문제
    """

    random.seed(seed)

    # board: n*n size list
    n = br * bc
    board_ori = make_ans(br, bc)
    board = [row[:] for row in board_ori]

    min_hint = round(n*n * [0.4, 0.35, 0.3, 0.25][level])
    max_att = [1000, 10000, 50000, 100000][level]

    random_idx = [(r,c) for r in range(n) for c in range(n)]
    random.shuffle(random_idx)

    hint = n * n

    for rr, rc in random_idx : 
        # 이 아래는 조건에 맞을 때까지 반복
        ori = board[rr][rc]
        board[rr][rc] = 0
        hint -= 1
        sol, att = solver(board, br, bc)
        if sol != 1 : # 잘못된 문제
            board[rr][rc] = ori
            hint += 1
        # 종료 조건
        if att > max_att or hint - 1 < min_hint : 
            break
    
    return board_ori, board

if __name__ == "__main__" : 
    board_ori, board = generate(2, 3, 0)
    for i in board_ori : 
        print(*i)