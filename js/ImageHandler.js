export class ImageHandler {

    static #MAX_HEIGHT = 600;
    static #MAX_WIDTH = 800;

    static resize(image) {
        function doResize(width, height) {
            const canvas = document.createElement("CANVAS");
            canvas.setAttribute("width", width + "");
            canvas.setAttribute("height", height + "");
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            const result = new Image();
            result.src = canvas.toDataURL("image/jpg");
            return result;
        }
        if(image.width <= this.#MAX_WIDTH && image.height <= this.#MAX_HEIGHT) {
            return image;
        }
        let factor = 0;
        if(image.width >= this.#MAX_WIDTH) {
            factor = image.width / this.#MAX_WIDTH;
        }
        if(image.height >= this.#MAX_HEIGHT) {
            const nFactor = image.height / this.#MAX_HEIGHT;
            if(nFactor > factor) {
                factor = nFactor;
            }
        }
        return doResize(image.width / factor, image.height / factor);
    }

    static getFile(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const files = evt.dataTransfer ?  evt.dataTransfer.files : evt.target.files; // FileList object.
        const first = [...files].filter(f => f.type.match('image.*'))[0]; // Convert to array, then filter.

        return new Promise((resolve, reject) => {
            if(first) {
                const reader = new FileReader();
                reader.addEventListener('load', (evt) => {
                    const result = new Image();
                    result.src = evt.target.result + '';
                    result.onload = () => {
                        resolve(ImageHandler.resize(result));
                    };
                }, false);
                reader.readAsDataURL(first);
            } else {
                reject('No image');
            }
        });
    }

}
