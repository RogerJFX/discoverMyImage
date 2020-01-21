export class Tile {

    static image;
    static tileWidth;
    static tileHeight;

    constructor(oX, oY, xPos, yPos) {
        this.oX = oX;
        this.oY = oY;
        this.xPos = xPos;
        this.yPos = yPos;
    }

    toNode() {
        const element = document.createElement('DIV');
        element.setAttribute('style', `
            position: absolute;
            width: ${Tile.tileWidth}px;
            height: ${Tile.tileHeight}px;
            left: ${this.xPos * Tile.tileWidth};
            top: ${this.yPos * Tile.tileHeight};
            background-position: -${this.oX * Tile.tileWidth}px -${this.oY * Tile.tileHeight}px;
        `);
        element.setAttribute('class', 'image');
        return element;
    }

    static buildTiles(image, numW, numH) {
        const styleContainer = document.body.getElementsByTagName('stylecontainer')[0];
        const styleElement =  document.createElement('STYLE');
        styleElement.innerHTML += `\n.image {
            background-image: URL(${image.src});
        }`;
        styleContainer.innerHTML = '';
        styleContainer.appendChild(styleElement);
        const indices = numW * numH;
        const arr = [];
        function shuffle() {
            const candidate = Math.floor(Math.random() * indices);
            if(arr.includes(candidate)) {
                return shuffle();
            }
            return candidate;
        }
        for (let i = 0; i < indices; i++) {
            arr.push(shuffle());
        }
        const imageWidth = image.width;
        const imageHeight = image.height;
        Tile.image = image;
        Tile.tileWidth = Math.floor(imageWidth/numW);
        Tile.tileHeight = Math.floor(imageHeight/numH);

        const result = [];
        for (let i = 0; i < indices; i++) {
            result.push(new Tile(i % numH, Math.floor(i / numW), arr[i] % numH, Math.floor(arr[i] / numW)));
        }
        return result;
    }
}