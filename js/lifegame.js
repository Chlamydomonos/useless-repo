(function () {

    let activated = true;

    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.style.position = "fixed";
    canvas.id = "life-game";

    let resizing = 0;
    let needResize = false;

    let cellsWidth = 0;
    let cellsHeight = 0;

    let mouseX = 0;
    let mouseY = 0;

    let color = $("#life-game").css("color");

    let re = /rgb\s*\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/
    let re2 = /rgba\s*\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/

    let hasA = false;

    let rst = color.search(re);
    if (rst == -1) {
        rst = color.search(re2);
        hasA = true;
    }

    console.log(color);
    console.log(rst);

    let r = RegExp.$1;
    let g = RegExp.$2;
    let b = RegExp.$3;
    let a = "1";
    if (hasA)
        a = RegExp.$4;

    a = parseFloat(a);

    let colors = new Array();

    colors[0] = "rgba(0, 0, 0, 0)";

    for (let i = 1; i < 10; i++) {
        colors[i] = "rgba(" + r + ", " + g + ", " + b + ", " + (a / 20) * i + ")";
    }

    colors[10] = color;

    function findDimensions() {
        let winWidth = 0;
        let winHeight = 0;

        if (window.innerWidth)
            winWidth = window.innerWidth;
        else if ((document.body) && (document.body.clientWidth))
            winWidth = document.body.clientWidth;

        if (window.innerHeight)
            winHeight = window.innerHeight;
        else if ((document.body) && (document.body.clientHeight))
            winHeight = document.body.clientHeight;

        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
            winHeight = document.documentElement.clientHeight;
            winWidth = document.documentElement.clientWidth;
        }

        canvas.width = winWidth;
        canvas.height = winHeight;
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        resizing++;
        needResize = true;

        function endResizing() { resizing--; }

        window.setTimeout(endResizing, 100);
    }

    findDimensions();
    window.onresize = findDimensions;

    let oldCells = new Array();
    let newCells = new Array();
    let cellsTimes = new Array();

    function resizeCells() {
        if (!resizing && needResize) {
            needResize = false;
            cellsWidth = canvas.width / 4;
            cellsHeight = canvas.height / 4;
            for (let i = 0; i < cellsWidth; i++) {
                oldCells[i] = new Array();
                newCells[i] = new Array();
                cellsTimes[i] = new Array();
                for (let j = 0; j < cellsHeight; j++) {
                    oldCells[i][j] = false;
                    newCells[i][j] = Math.random() >= 0.25;
                    cellsTimes[i][j] = 0;
                }
            }
        }
    }

    window.setInterval(resizeCells, 100);

    function drawCells() {
        if (!resizing && activated) {
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < cellsWidth; i++)
                for (let j = 0; j < cellsHeight; j++)
                    if (cellsTimes[i][j]) {
                        if (!newCells[i][j])
                            ctx.fillStyle = colors[cellsTimes[i][j]];
                        else {
                            ctx.fillStyle = colors[9];
                            ctx.fillRect(i * 4, j * 4, 4, 4);
                            ctx.fillStyle = colors[10];
                        }
                        ctx.fillRect(i * 4 + 1, j * 4 + 1, 2, 2);
                        cellsTimes[i][j]--;
                    }
            ctx.save();
        }
    }

    function updateCells() {
        function live(x, y) {
            const neighborIndex = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

            let neighbors = 0;
            for (let i = 0; i < 8; i++) {
                let neighborX = x + neighborIndex[i][0];
                let neighborY = y + neighborIndex[i][1];

                if (neighborX >= 0 && neighborY >= 0 && neighborX < cellsWidth && neighborY < cellsHeight)
                    neighbors += oldCells[neighborX][neighborY];
            }

            if ((oldCells[x][y] && neighbors == 2) || neighbors == 3)
                return true;
            return false;
        }

        if (!resizing && activated) {
            for (let i = 0; i < cellsWidth; i++)
                for (let j = 0; j < cellsHeight; j++)
                    oldCells[i][j] = newCells[i][j];

            for (let i = 0; i < cellsWidth; i++)
                for (let j = 0; j < cellsHeight; j++)
                    newCells[i][j] = live(i, j);

            for (let i = 0; i < cellsWidth; i++)
                for (let j = 0; j < cellsHeight; j++)
                    if (newCells[i][j])
                        cellsTimes[i][j] = 20;
        }
    }

    let frames = 0;

    function update() {
        frames++;
        if (frames == 10) {
            updateCells();
            frames = 0;
        }
        drawCells();
    }

    window.setInterval(update, 10);

    function getMousePos(event) {
        let e = event || window.event;
        mouseX = Math.floor(e.clientX / 4);
        mouseY = Math.floor(e.clientY / 4);
    }

    window.onmousemove = getMousePos;

    function randomCells() {
        for (let i = -8; i <= 8; i++) {
            for (let j = -8; j <= 8; j++) {
                let x = mouseX + i;
                let y = mouseY + j;
                if (x >= 0 && x < cellsWidth && y >= 0 && y < cellsHeight && i * i + j * j <= 64) {
                    oldCells[x][y] = Math.random() >= 0.5;
                    newCells[x][y] = oldCells[x][y];
                }
            }
        }
    }

    function randomCellsTouch(event) {
        let e = event || window.event;
        mouseX = Math.floor(e.clientX / 4);
        mouseY = Math.floor(e.clientY / 4);
        randomCells();
    }

    canvas.onclick = randomCells;

    canvas.ontouchend = randomCellsTouch;

}).call(this);