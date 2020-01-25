window.$disc = window.$disc || {};

(function TileManager(self) {

    let tileWidth;
    let tileHeight;
    let tiles;
    let numW, numH;
    let board = [];
    let locked = false;
    let winningAction;

    function Tile(oX, oY, xPos, yPos) {
        let omitted = false;
        let htmlElement;
        const me = this;
        function tryMove() {
            if(locked) {
                return;
            }

            const targetTile = findMove(me);
            if(targetTile !== null) {
                locked = true;
                updateBoard({tile: me, xPos: xPos, yPos: yPos}, targetTile);
                xPos = targetTile.xPos;
                yPos = targetTile.yPos;
                window.$disc.animator.translateCard(htmlElement, xPos * tileWidth, yPos * tileHeight)
                    .then(_ => {
                        locked = false;
                        checkReady();
                    });
            }
        }
        this.toNode = () => {
            htmlElement = document.createElement('DIV');
            htmlElement.setAttribute('style', `
                left: ${xPos * tileWidth}px;
                top: ${yPos * tileHeight}px;
                background-position: -${oX * tileWidth}px -${oY * tileHeight}px;
            `);
            htmlElement.setAttribute('class', 'tile');
            if(omitted) {
                htmlElement.style.display = 'none';
            }
            htmlElement.onclick = tryMove;
            return htmlElement;
        };

        this.setOmitted = () => {
            omitted = true;
        };

        this.isOmitted = () => {
            return omitted;
        };

        this.isCorrectPlaced = () => {
            return omitted || oX === xPos && oY === yPos;
        };

        this.getCoords = () => {
            return [xPos, yPos];
        };
    }

    function checkReady() {
        const firstWrongPlaced = tiles.find(tile => !tile.isCorrectPlaced());
        if(!firstWrongPlaced) {
            // alert('GREAT!');
            winningAction();
        }
    }

    function prefillBoard() {
        board = [];
        for (let i = 0; i < numH; i++) {
            board.push([]);
            for (let j = 0; j < numW; j++) {
                board[i].push(null);
            }
        }
    }

    function fillBoard() {
        tiles.forEach(tile => {
            if(!tile.isOmitted()) {
                const coords = tile.getCoords();
                board[coords[1]][coords[0]] = tile;
            }
        });
    }

    function findMove(tile) {
        const nullRowIndex = board.indexOf(board.find(row => row.indexOf(null) !== -1));
        const nullColIndex = board[nullRowIndex].indexOf(null);
        const questionCoords = tile.getCoords();
        if((questionCoords[0] === nullColIndex && Math.abs(questionCoords[1] - nullRowIndex) === 1) ||
            (questionCoords[1] === nullRowIndex && Math.abs(questionCoords[0] - nullColIndex) === 1)) {
            return {
                tile: board[nullRowIndex][nullColIndex],
                xPos: nullColIndex,
                yPos: nullRowIndex
            }
        }
        return null;
    }

    function updateBoard(activeProps, passiveProps) {
        board[activeProps.yPos][activeProps.xPos] = passiveProps.tile;
        board[passiveProps.yPos][passiveProps.xPos] = activeProps.tile;
    }

    function setTileStyle(image) {
        const styleContainer = document.body.getElementsByTagName('dynStylecontainer')[0];
        const styleElement = document.createElement('STYLE');
        styleElement.innerHTML += `\n.tile {
            background-image: URL(${image.src});
            width: ${tileWidth}px;
            height: ${tileHeight}px;
        }`;
        styleContainer.innerHTML = '';
        styleContainer.appendChild(styleElement);
    }

    self.buildTiles = (image, _numW, _numH, winAction) => {
        winningAction = winAction;
        numW = _numW;
        numH = _numH;
        prefillBoard();
        const indices = numW * numH;
        const arr = [];

        function shuffle() {
            const candidate = Math.floor(Math.random() * indices);
            if (arr.includes(candidate)) {
                return shuffle();
            }
            return candidate;
        }

        for (let i = 0; i < indices; i++) {
            arr.push(shuffle());
            // arr.push(i); // Testing
        }

        tileWidth = Math.floor(image.width / numW);
        tileHeight = Math.floor(image.height / numH);

        setTileStyle(image);

        const result = [];
        for (let i = 0; i < indices; i++) {
            result.push(new Tile(
                i % numW,
                Math.floor(i / numW) % numH,
                arr[i] % numW,
                Math.floor(arr[i] / numW) % numH));
        }
        result[Math.floor(Math.random() * indices)].setOmitted(); // double random
        tiles = result;
        fillBoard();
        return result;
    }
})(window.$disc.tileManager = window.$disc.tileManager || {});