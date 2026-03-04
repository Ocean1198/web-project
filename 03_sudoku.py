import random

# br: block row, bc: block column
# cx: current x
# cy: current y
def make(br, bc, cx = 0, cy = 0, board = None, seed = 42) : 

    # n: size of sudoku(n*n size), max number(1~n)
    n = br*bc
    if board == None :
        random.seed(seed)
        board = [[0 for _ in range(n)] for _ in range(n)]

    if cy == n : 
        return board

    
    ## 이곳에 스도쿠 생성 규칙을 포함
    # 같은 열에 같은 숫자 X
    rule_row = set(board[cx])
    # 같은 행에 같은 숫자 X
    rule_col = set([row[cy] for row in board])
    # 같은 블록에 같은 숫자 X
    # 블록의 시작 좌표(sx, sy)
    sc = (cy//bc)*bc
    sr = (cx//br)*br
    rule_blk = {
        board[r][c]
        for r in range(sr, sr + br)
        for c in range(sc, sc + bc)
    }

    available = list({i for i in range(1, n + 1)} - (rule_row | rule_col | rule_blk))
    random.shuffle(available)

    if not available : 
        return
    
    for num in available : 
        board[cx][cy] = num
        if cx == n-1 : 
            result = make(br, bc, 0, cy+1, board)
        else : 
            result = make(br, bc, cx+1, cy, board)
        if result : 
            return result
        
        board[cx][cy] = 0

    return False

# test code: make 4*4 sudoku
board = make(3, 3)
for i in board : 
    print(*i)