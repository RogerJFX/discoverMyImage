window.$disc = window.$disc || {};

(function Tile(self) {

    let tileWidth;
    let tileHeight;

    function Tile(oX, oY, xPos, yPos) {
        let omitted = false;
        this.toNode = () => {
            const element = document.createElement('DIV');
            element.setAttribute('style', `
                left: ${xPos * tileWidth};
                top: ${yPos * tileHeight};
                background-position: -${oX * tileWidth}px -${oY * tileHeight}px;
            `);
            element.setAttribute('class', 'tile');
            if(omitted) {
                element.style.display = 'none';
            }
            return element;
        };

        this.setOmitted = () => {
            omitted = true;
        };

        this.isOmitted = () => {
            return omitted;
        }
    }

    function setTileStyle(image) {
        const styleContainer = document.body.getElementsByTagName('stylecontainer')[0];
        const styleElement = document.createElement('STYLE');
        styleElement.innerHTML += `\n.tile {
            position:absolute;
            background-image: URL(${image.src});
            width: ${tileWidth-2}px;
            height: ${tileHeight-2}px;
        }`;
        styleContainer.innerHTML = '';
        styleContainer.appendChild(styleElement);
    }

    self.buildTiles = (image, numW, numH) => {
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
        }
        const imageWidth = image.width;
        const imageHeight = image.height;
        tileWidth = Math.floor(imageWidth / numW);
        tileHeight = Math.floor(imageHeight / numH);

        setTileStyle(image);

        const result = [];
        for (let i = 0; i < indices; i++) {
            result.push(new Tile(i % numH, Math.floor(i / numW), arr[i] % numH, Math.floor(arr[i] / numW)));
        }
        result[1].setOmitted();
        return result;
    }
})(window.$disc.tile = window.$disc.tile || {});