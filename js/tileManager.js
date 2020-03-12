window.$disc = window.$disc || {};

(function TileManager(self) {

    let tileWidth;
    let tileHeight;
    let tiles;
    let animationStoppedByUser = false;
    let board = [];
    let locked = false;
    let winningAction;

    function Tile(oX, oY, xPos, yPos) {
        let omitted = false;
        let htmlElement;
        const me = this;
        let moved = false;
        function tryMove() {
            cancelEvents();
            if(locked || moved) {
                moved = false;
                return;
            }
            const targetTile = findMove(me);
            if(targetTile !== null) {
                locked = true;
                $disc.history.add([xPos, yPos]);
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

        function cancelEvents() {
            document.onmousemove = null;
            document.onmouseup = null;
            document.ontouchend = null;
            document.ontouchmove = null;
        }

        function startDrag(evt) {
            evt.preventDefault();
            function goBack() {
                window.$disc.animator.translateCard(htmlElement, xPos * tileWidth, yPos * tileHeight);
            }

            function checkRange(range, diff) {
                if(range === 0) {
                    return false;
                } else if(range > 0) {
                    return diff > 0 && diff < range;
                } else {
                    return diff < 0 && diff > range;
                }
            }

            function movedSufficient(ranges, xMoved, yMoved) {
                return (ranges[0] !== 0 && Math.abs(xMoved) > Math.abs(ranges[0] / 2)) ||
                    (ranges[1] !== 0 && Math.abs(yMoved) > Math.abs(ranges[1] / 2));
            }

            function getEvtCoords(e) {
                if(e.type === 'touchstart' || e.type === 'touchmove'){
                    const touch = e.touches[0] || e.changedTouches[0];
                    return [touch.pageX, touch.pageY];
                } else if (e.type === 'mousedown' || e.type === 'mousemove') {
                    return [e.clientX, e.clientY];
                }
            }

            const targetTile = findMove(me);
            if(targetTile === null) {
                return;
            }
            const range = [(targetTile.xPos - xPos) * tileWidth, (targetTile.yPos - yPos) * tileHeight];
            const coords = getEvtCoords(evt);
            const startX = coords[0];
            const startY = coords[1];
            const oT = htmlElement.offsetTop;
            const oL = htmlElement.offsetLeft;
            function mouseMove(evtM) {
                const coords = getEvtCoords(evtM);
                const diffX = coords[0] - startX;
                const diffY = coords[1] - startY;
                if(checkRange(range[0], diffX)) {
                    moved = true;
                    htmlElement.style.left = oL + diffX + 'px';
                } else if(checkRange(range[1], diffY)) {
                    moved = true;
                    htmlElement.style.top = oT + diffY + 'px';
                }
                document.onmouseup = mouseUp;
                document.ontouchend = mouseUp;
                function mouseUp() {
                    const enough = movedSufficient(range, diffX, diffY);
                    if(enough) {
                        moved = false;
                        tryMove();
                    } else {
                        goBack();
                    }
                    cancelEvents();
                }
            }
            document.onmousemove = (evtM) => {
                mouseMove(evtM);
            };
            document.ontouchmove = (evtM) => {
                mouseMove(evtM);
            };
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
            // addDoubleClick(htmlElement, tryMove);
            htmlElement.onclick = tryMove;
            htmlElement.onmousedown = (evt) => {
                startDrag(evt);
                animationStoppedByUser = true;
            };
            htmlElement.ontouchstart = (evt) => {
                startDrag(evt);
                animationStoppedByUser = true;
            };
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

        this.move = tryMove;

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
            winningAction();
            $disc.ai.sendSuccess((res) => {
                $disc.menuHandler.congratulate(JSON.parse(res));
                }, () => {});
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
                //console.log(coords);
                board[coords[1]][coords[0]] = tile;
                //console.log(board);
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

    self.solve = (stepsLimit) => {
        function onSuccess(data) {
            let counter = 0;
            function nextAutoMove() {
                if(counter++ < data.length) {
                    setTimeout(() => {
                        const entry = data[counter - 1];
                        const found = tiles.find(tile => {
                            const coords = tile.getCoords();
                            return coords[0] === entry[0] && coords[1] === entry[1];
                        });
                        if(!animationStoppedByUser && found) {
                            found.move();
                            nextAutoMove();
                        }
                    }, $disc.constants.AUTOSOLVE_NEXT_STEP_MILLIS);
                }
            }
            nextAutoMove();
        }
        animationStoppedByUser = false;
        $disc.history.clear();
        $disc.ai.resolveTask(tiles, stepsLimit, (data, toWin) => {
            const numLeft = $disc.settingsHandler.getServerCapabilities()['solutionStepsLeft'];
            $disc.lang.getTranslation('alertSolutionSteps').then(result => {
                const msg = result.replace('__n1__', toWin).replace('__n2__', data.length).replace('__n3__', numLeft);
                $disc.menuHandler.alert(msg, 'Info', null, () => onSuccess(data));
            });

        }, winningAction);
    };

    self.getCurrentTilesState = () => {
        return tiles.map(tile => tile.serialize());
    };

    self.fromStoredArray = (image, numW, numH, stored, winAction) => {
        commonIssues(image, numW, numH, winAction);
        $disc.settingsHandler.setLastGrid(numW, numH);
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
            $disc.ai.getTask(numW, numH).then(arr => {
                const result = [];
                for (let i = 0; i < indices; i++) {
                    result.push(new Tile(
                        i % numW,
                        Math.floor(i / numW) % numH,
                        arr[i] % numW,
                        Math.floor(arr[i] / numW) % numH));
                }
                result[indices - 1].setOmitted(); // right bottom
                tiles = result;
                $disc.history.clear();
                fillBoard();
                resolve(result);
            });

        });

    }
})(window.$disc.tileManager = window.$disc.tileManager || {});