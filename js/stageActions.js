window.$disc = window.$disc || {};
(function StageActions(self) {

    let stage, outerStage;
    let originalImage, stageImage;
    let won = false;

    function showSpinner() {
        $disc.menuHandler.handleMenuClick(['spinnerBG'], []);
        //document.getElementById('spinnerBG').style.display = 'block';
    }

    function hideSpinner() {
        $disc.menuHandler.handleMenuClick([], ['spinnerBG']);
        //document.getElementById('spinnerBG').style.display = 'none';
    }

    // Workhorse. This will be called for any image.
    self.processFile = (promise, grid, tileStates) => {
        showSpinner();
        const {convert2BW, modifyImage, simpleDarken, resizeToStage} = window.$disc.imageHandler;
        promise.then(image => {
            originalImage = image;
            if (!image) {
                return Promise.reject('no image defined');
            } else return image;
        }).then((image, reject) => {
            return resizeToStage(image).then(stImage => {
                stageImage = stImage;
                return stImage;
            });
        }).then(image => {
            // Background
            modifyImage(image, [convert2BW, simpleDarken])
                .then(bgImg => {
                    stage.style.backgroundImage = `URL(${bgImg.src})`;
                });
            // Tiles
            self.buildTiles(tileStates ? () => {
                return new Promise(resolve => {
                    resolve(window.$disc.tileManager.fromStoredArray(image, grid[0], grid[1], tileStates, winAction));
                });
            } : null);
        }).catch(err => {
            hideSpinner();
            $disc.lang.getTranslation(err).then(t => {
                $disc.menuHandler.alert(t, 'Error');
            }).catch(_ => console.error(`No translation for "${err}"`));
        });
    };

    function calculateGrid(image) {
        const w = image.width;
        const h = image.height;
        const f = w / h;
        console.log(f);
        if (f >= 1.25) { // 4 / 3 = 1.3333
            return [4, 3];
        } else if (f <= 0.85) { // 3 / 4 = 0.75
            return [3, 4];
        } else {
            return [3, 3];
        }
    }

    self.buildTiles = (initFn) => {
        const grid = calculateGrid(stageImage);
        if (won && stageImage) {
            const {convert2BW, modifyImage, simpleDarken} = window.$disc.imageHandler;
            modifyImage(stageImage, [convert2BW, simpleDarken])
                .then(bgImg => {
                    stage.style.backgroundImage = `URL(${bgImg.src})`;
                });
        }
        won = false;
        initFn = initFn || function () {
            return window.$disc.tileManager.buildTiles(stageImage, grid[0], grid[1], winAction); // is a promise
        };

        if (stageImage) {
            outerStage.innerHTML = '';
            initFn().then(tiles => {
                stage.innerHTML = '';
                const tD = tiles[0].getDimensions();
                const stageWidth = tD[0] * grid[0];
                const stageHeight = tD[1] * grid[1];
                stage.style.height = `${stageHeight}px`;
                stage.style.width = `${stageWidth}px`;
                outerStage.style.height = `${stageHeight + 24}px`;
                outerStage.style.width = `${stageWidth + 24}px`;
                tiles.forEach(tile => {
                    stage.appendChild(tile.toNode());
                });
                createLegend(grid, tD);
                outerStage.appendChild(stage);
                hideSpinner();
            });
        }
    };

    function createLegend(settings, tD) {

        function wrap(txt) {
            const node = document.createElement('DIV');
            node.innerHTML = txt;
            node.addClass('iLegend');
            return node;
        }

        for (let i = settings[0] - 1; i >= 0; i--) {
            const node = document.createElement('DIV');
            node.addClass('board-letter');
            node.appendChild(wrap(String.fromCharCode(65 + i)));
            node.style.width = `${tD[0]}px`;
            node.style.right = `${(settings[0] - i - 1) * tD[0]}px`;
            outerStage.appendChild(node);
        }
        for (let i = 0; i < settings[1]; i++) {
            const node = document.createElement('DIV');
            const inode = document.createElement('DIV');
            node.appendChild(inode);
            node.addClass('board-num');
            // inode.innerHTML = `${i + 1}`;
            inode.appendChild(wrap(`${i + 1}`));
            node.style.height = `${tD[1]}px`;
            node.style.top = `${i * tD[1]}px`;
            outerStage.appendChild(node);
        }
        stage.addClass('withNumbers');
    }

    self.getCurrentImage = () => {
        return originalImage;
    };

    self.hasCurrentImage = () => {
        return !!originalImage;
    };

    self.init = (_stage, _outerStage) => {
        stage = _stage;
        outerStage = _outerStage;
    };

    self.isPlaying = () => !won;

    function winAction() {
        won = true;
        stage.innerHTML = '';
        stage.style.backgroundImage = `URL(${stageImage.src})`;
        (function flicker(c) {
            setTimeout(() => {
                stage.style.opacity = '0.4';
                setTimeout(() => {
                    stage.style.opacity = '1';
                    if (--c > 0) {
                        flicker(c);
                    }
                }, 80);
            }, 80);
        })(3);
    }

})(window.$disc.stageActions = window.$disc.stageActions || {});