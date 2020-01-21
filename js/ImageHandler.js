export class ImageHandler {

    static MAX_HEIGHT = 800;
    static MAX_WIDTH = 1000;

    static resize(image) {
        function doResize(width, height) {
            const canvas = ImageHandler.createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            const result = new Image();
            result.src = canvas.toDataURL("image/jpg");
            return result;
        }

        if (image.width <= this.MAX_WIDTH && image.height <= this.MAX_HEIGHT) {
            return image;
        }
        let factor = 0;
        if (image.width >= this.MAX_WIDTH) {
            factor = image.width / this.MAX_WIDTH;
        }
        if (image.height >= this.MAX_HEIGHT) {
            const nFactor = image.height / this.MAX_HEIGHT;
            if (nFactor > factor) {
                factor = nFactor;
            }
        }
        return doResize(image.width / factor, image.height / factor);
    }

    static createCanvas(w, h) {
        const result = document.createElement("CANVAS");
        result.setAttribute("width", w + "");
        result.setAttribute("height", h + "");
        return result;
    }

    static darkenImage(image) {
        function doDarken(imageData) {
            for (let i = 0; i < imageData.width * imageData.height * 4; i += 4) {
                imageData.data[i + 3] = Math.round(imageData.data[i + 3] * .5);
            }
        }

        const width = image.width;
        const height = image.height;
        const canvas = ImageHandler.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        doDarken(imgData);
        const canvas2 = this.createCanvas(width, height);
        const ctx2 = canvas2.getContext('2d');
        ctx2.putImageData(imgData, 0, 0);
        const result = new Image();
        result.src = canvas2.toDataURL("image/jpg");
        return result;
    }

    static getFile(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; // FileList object.
        const first = [...files].filter(f => f.type.match('image.*'))[0]; // Convert to array, then filter.

        return new Promise((resolve, reject) => {
            if (first) {
                const reader = new FileReader();
                reader.addEventListener('load', (evt) => {
                    const result = new Image();
                    result.src = evt.target.result + '';
                    result.onload = () => {
                        const arsch = ImageHandler.resize(result);
                        // return arsch;
                        arsch.onload = () => {
                            resolve(ImageHandler.darkenImage(arsch));
                        }
                    };
                }, true);
                reader.readAsDataURL(first);
            } else {
                reject('No image');
            }
        });
    }

}
