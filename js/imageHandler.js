window.$disc = window.$disc || {};

(function ImageHandler(self) {

    self.resizeImage = (image) => {
        const MAX_HEIGHT = window.$disc.constants.MAX_IMAGE_HEIGHT;
        const MAX_WIDTH = window.$disc.constants.MAX_IMAGE_WIDTH;
        function doResize(width, height) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            const result = new Image();
            result.src = canvas.toDataURL("image/jpeg");
            return result;
        }
        return new Promise(resolve => {
            if (image.width <= MAX_WIDTH && image.height <= MAX_HEIGHT) {
                resolve(image);
                return;
            }
            let factor = 0;
            if (image.width >= MAX_WIDTH) {
                factor = image.width / MAX_WIDTH;
            }
            if (image.height >= MAX_HEIGHT) {
                const nFactor = image.height / MAX_HEIGHT;
                if (nFactor > factor) {
                    factor = nFactor;
                }
            }
            const result = doResize(image.width / factor, image.height / factor);
            result.onload = () => resolve(result);
        });

    };

    function createCanvas(w, h) {
        const result = document.createElement("CANVAS");
        result.setAttribute("width", w + "");
        result.setAttribute("height", h + "");
        return result;
    }

    self.simpleDarken = ({data, height, width}, f) => {
        const factor = f || .33;
        for (let i = 0; i < width * height * 4; i += 4) {
            data[i] = Math.round(data[i] * factor);
            data[i + 1] = Math.round(data[i + 1] * factor);
            data[i + 2] = Math.round(data[i + 2] * factor);
        }
    };

    self.convert2BWAverage = (imageData) => {
        for (let i = 0; i < imageData.width * imageData.height * 4; i += 4) {
            const all = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
            const rgb = Math.round(all / 3);
            imageData.data[i] = rgb;
            imageData.data[i + 1] = rgb;
            imageData.data[i + 2] = rgb;
        }
    };

    self.convert2BW /*Lightness*/ = (imageData) => {
        for (let i = 0; i < imageData.width * imageData.height * 4; i += 4) {
            const rgb = (Math.min(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]) +
                Math.max(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])) / 2;
            imageData.data[i] = rgb;
            imageData.data[i + 1] = rgb;
            imageData.data[i + 2] = rgb;
        }
    };

    self.modifyImage = (image, modificationFns) => {
        const width = image.width;
        const height = image.height;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        modificationFns.forEach(modificationFn => modificationFn(imgData));
        const canvas2 = createCanvas(width, height);
        const ctx2 = canvas2.getContext('2d');
        ctx2.putImageData(imgData, 0, 0);
        const result = new Image();
        result.src = canvas2.toDataURL("image/jpeg");
        return new Promise(resolve => {
            result.onload = () => resolve(result);
        });
    };

    self.downloadToDisk = (base64) => {
        const link = document.createElement('A');
        const fileName = 'img' + new Date().getTime() + '.jpg';
        link.setAttribute("href", base64);
        link.setAttribute("download", fileName);
        link.click();
        return fileName;
    };

    self.getFile = (evt) => {
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
                        self.resizeImage(result).then(image => {
                            $disc.storage.setLastLoadedImage(image.src);
                            resolve(image);
                        }).catch(err => console.log(err));
                    };
                }, true);
                reader.readAsDataURL(first);
            } else {
                reject('No image');
            }
        });
    }

})(window.$disc.imageHandler = window.$disc.imageHandler || {});
