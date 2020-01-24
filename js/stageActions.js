window.$disc = window.$disc || {};
(function StageActions(self) {

    let stage;
    let originalImage;

    self.processFile = (promise) => {
        const ih = window.$disc.imageHandler;
        promise.then(image => {
            originalImage = image;
            ih.modifyImage(image, [ih.convert2BW, ih.simpleDarken])
                .then(bgImg => {
                    stage.style.backgroundImage = `URL(${bgImg.src})`;
                    stage.style.height = `${bgImg.height}px`;
                    stage.style.width = `${bgImg.width}px`;
                });
            return image;
        }).then(image => {
            const tiles = window.$disc.tileManager.buildTiles(image, 4, 4, winAction);
            stage.innerHTML = '';
            tiles.forEach(tile => {
                stage.appendChild(tile.toNode());
            })
        }); //.catch(err => console.error(err));
    };

    self.upload = () => {
        window.$disc.xhrHandler.uploadImage(window.$disc.xhrHandler.createBean(originalImage.src, 'roger@crazything.de'));
    };

    self.init = (_stage) => {
        stage = _stage;
    };

    function winAction () {
        stage.innerHTML = '';
        stage.style.backgroundImage=`URL(${originalImage.src})`;
    }

})(window.$disc.stageActions = window.$disc.stageActions || {});