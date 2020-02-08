window.$disc = window.$disc || {};

(function TileManager(self) {

    let tileWidth;
    let tileHeight;
    let tiles;
    // let numW, numH;
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
            const identDiv = document.createElement('DIV');
            identDiv.addClass('tile-ident');
            identDiv.innerHTML = `${String.fromCharCode(65 + oX)}${oY + 1}`; //String.fromCharCode(65);
            htmlElement.appendChild(identDiv);
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

        this.serialize = () => {
            return {
                xPos: xPos,
                yPos: yPos,
                oX: oX,
                oY: oY,
                omitted: omitted
            }
        };

        this.getDimensions = () => {
            return [tileWidth, tileHeight];
        }
    }

    function checkReady() {
        const firstWrongPlaced = tiles.find(tile => !tile.isCorrectPlaced());
        if(!firstWrongPlaced) {
            // alert('GREAT!');
            winningAction();
        }
    }

    function prefillBoard(numH, numW) {
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

    function commonIssues(image, numW, numH, winAction) {
        winningAction = winAction;
        prefillBoard(numH, numW);
        tileWidth = Math.floor(image.width / numW);
        tileHeight = Math.floor(image.height / numH);
        setTileStyle(image);
    }

    self.solve = () => {
        winningAction();
    };

    self.getCurrentTilesState = () => {
        return tiles.map(tile => tile.serialize());
    };

    self.fromStoredArray = (image, numW, numH, stored, winAction) => {
        commonIssues(image, numW, numH, winAction);

        const result = [];
        for (let i = 0; i < stored.length; i++) {
            result.push(new Tile(
                stored[i].oX,
                stored[i].oY,
                stored[i].xPos,
                stored[i].yPos));
            if(stored[i].omitted) {
                result[i].setOmitted();
            }
        }
        tiles = result;
        fillBoard();
        return result;
    };

    self.buildTiles = (image, numW, numH, winAction) => {
        return new Promise(resolve => {
            commonIssues(image, numW, numH, winAction);
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
                //arr.push(i); // Testing
            }

            const result = [];
            for (let i = 0; i < indices; i++) {
                result.push(new Tile(
                    i % numW,
                    Math.floor(i / numW) % numH,
                    arr[i] % numW,
                    Math.floor(arr[i] / numW) % numH));
            }
            result[indices - 1].setOmitted(); // right bottom
            //result[Math.floor(Math.random() * indices)].setOmitted(); // double random
            tiles = result;
            fillBoard();
            resolve(result);
        });

    }
})(window.$disc.tileManager = window.$disc.tileManager || {});