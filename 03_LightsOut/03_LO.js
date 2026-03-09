const board = document.getElementById("board");

for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {

        const cell = document.createElement("div");
        cell.classList.add("cell")

        cell.dataset.row = r;
        cell.dataset.col = c;

        cell.dataset.on = false;

        cell.addEventListener("click", () => {
            toggle(r, c)
        });

        board.appendChild(cell)

    }
}

function toggle(r, c) {

    const neighbor = [
        [r, c],
        [r-1,c],
        [r+1,c],
        [r,c-1],
        [r,c+1]
    ]

    neighbor.forEach(([nr, nc]) => {
        const cell = document.querySelector(`[data-row="${nr}"][data-col="${nc}"]`);
        if (cell) {
            cell.dataset.on = cell.dataset.on === "true" ? "false" : "true";
            cell.classList.toggle("on");
        }
    });

    if (document.querySelectorAll(".cell.on").length === 0) {
        setTimeout(() => {
            alert("You win!");
        }, 100);
    }
}

for (let i = 0; i < 25; i++) {
    const r = Math.floor(Math.random() * 5);
    const c = Math.floor(Math.random() * 5);
    toggle(r, c);
}