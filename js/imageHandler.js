window.$disc = window.$disc || {};

(function ImageHandler(self) {

    const ROTA_0 = 1;
    const ROTA_90 = 8;
    const ROTA_180 = 3;
    const ROTA_270 = 6;

    const ROTA_0_FLIPPED = 2; // Spiegelverkehrt und dann gedreht
    const ROTA_90_FLIPPED = 7;
    const ROTA_180_FLIPPED = 4;
    const ROTA_270_FLIPPED = 5;

    function rotateImage(image, orientation) {
        return new Promise((resolve) => {
            if(!orientation || orientation === ROTA_0 || orientation === ROTA_0_FLIPPED || orientation < 0 /*No jpeg or not defined*/) {
                resolve(image);
            } else {
                const canvas = orientation === ROTA_90 || orientation === ROTA_270 || orientation === ROTA_90_FLIPPED || orientation === ROTA_270_FLIPPED ?
                    createCanvas(image.height, image.width) :
                    createCanvas(image.width, image.height);
                const ctx = canvas.getContext('2d');
                switch (orientation) {
                    case ROTA_180:
                    case ROTA_180_FLIPPED:
                        ctx.rotate(Math.PI);
                        ctx.translate(-canvas.width, -canvas.height);
                        break;
                    case ROTA_90: // 8
                    case ROTA_270_FLIPPED:
                        ctx.rotate(Math.PI * 3 / 2);
                        ctx.translate(-image.width, 0);
                        break;
                    case ROTA_270: // 6
                    case ROTA_90_FLIPPED:
                        ctx.rotate(Math.PI / 2);
                        ctx.translate(0, -canvas.width);
                        break;
                }
                ctx.drawImage(image, 0, 0, image.width, image.height);
                const result = new Image();
                result.src = canvas.toDataURL("image/jpeg");
                result.onload = () => resolve(result);
            }
        })
    }

    self.resizeToReference = (image, orientation) => {
        orientation = orientation || ROTA_0;
        if(!$disc.constants.SCALE_REF_IMAGE_TO_FIT) {
            const edgeLen = $disc.constants.REFERENCE_IMAGE_MAX_EDGE;
            return resizeImage(image, [edgeLen, edgeLen], orientation, true);
        } else {
            function recommendImageSize() {
                const w = image.width;
                const h = image.height;
                const q = w / h; // (orientation === ROTA_90 || orientation === ROTA_270) ? h / w : w / h;
                if (q <= 0.85) {
                    return $disc.constants.SCALE_REF_IMAGE_PORTRAIT;
                } else if (q >= 1.23) {
                    return $disc.constants.SCALE_REF_IMAGE_LANDSCAPE;
                } else {
                    return $disc.constants.SCALE_REF_IMAGE_SQUARE;
                }
            }

            function doCalculate(rW, rH) {
                const factor = image.width / rW;
                const nFactor = image.height / rH;
                return (nFactor > factor) ? factor : nFactor;
            }

            function doResize(dimensions) {
                const factor = doCalculate(dimensions[0], dimensions[1]);
                const canvas = createCanvas(dimensions[0], dimensions[1]);
                const ctx = canvas.getContext('2d');
                const nW = image.width / factor;
                const nH = image.height / factor;
                const x = (dimensions[0] - Math.round(nW)) / 2;
                const y = (dimensions[1] - Math.round(nH)) / 2;
                ctx.drawImage(image, x, y, nW, nH);
                const result = new Image();
                result.src = canvas.toDataURL("image/jpeg");
                return result;
            }
            const dimensions = recommendImageSize();
            return new Promise(resolve => {
                const result = doResize(dimensions);
                result.onload = () => rotateImage(result, orientation).then(r => resolve(r));
            })
        }
    };

    self.resizeToStage = (image) => {
        return $disc.deviceDetection.getRecommendedDimensions()
            .then(recommended => resizeImage(image, recommended.dim, null, recommended.rotatable));
    };

    function calculateResizeFactor(imgW, imgH, maxW, maxH, deviceRotatable) {
        function doCalculate(iW, iH, mW, mH) {
            let factor = 0;
            if (iW <= mW && iH <= mH) {
                return -1;
            }
            if (iW >= mW) {
                factor = iW / mW;
            }
            if (iH >= mH) {
                const nFactor = iH / mH;
                if (nFactor > factor) {
                    factor = nFactor;
                }
            }
            return factor;
        }

        if (!deviceRotatable) {
            return doCalculate(imgW, imgH, maxW, maxH);
        }
        const imagePortrait = imgH > imgW;
        const devicePortrait = maxH > maxW;
        if (imagePortrait === devicePortrait) {
            return doCalculate(imgW, imgH, maxW, maxH);
        } else {
            return doCalculate(imgW, imgH, maxH, maxW); // turn maxW and maxH
        }
    }

    function resizeImage (image, dimension, orientation, deviceRotatable) {
        const maxH = dimension[1];
        const maxW = dimension[0];
        function doResize(width, height) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            const result = new Image();
            result.src = canvas.toDataURL("image/jpeg");
            return result;
        }
        return new Promise(resolve => {
            let iW = image.width;
            let iH = image.height;
            if(orientation && (orientation === ROTA_90 || orientation === ROTA_270)) {
                iW = image.height;
                iH = image.width;
            }
            const factor = calculateResizeFactor(iW, iH, maxW, maxH, deviceRotatable);
            if(factor === -1) {
                rotateImage(image, orientation).then(r => resolve(r));
            } else {
                const result = doResize(image.width / factor, image.height / factor);
                result.onload = () => rotateImage(result, orientation).then(r => resolve(r));
            }
        });

    }

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

    function getFileData(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const view = new DataView(e.target.result);
            const uint8Array = view.buffer;
            if (view.getUint16(0, false) !== 0xFFD8) {
                return callback(uint8Array, -2);
            }
            const length = view.byteLength;
            let offset = 2;
            while (offset < length) {
                if (view.getUint16(offset + 2, false) <= 8) {
                    return callback(uint8Array, -1);
                }
                const marker = view.getUint16(offset, false);
                offset += 2;
                if (marker === 0xFFE1) {
                    if (view.getUint32(offset += 2, false) !== 0x45786966) {
                        return callback(uint8Array, -1);
                    }
                    const little = view.getUint16(offset += 6, false) === 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    const tags = view.getUint16(offset, little);
                    offset += 2;
                    for (let i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                            return callback(uint8Array, view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                } else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                } else {
                    offset += view.getUint16(offset, false);
                }
            }
            return callback(uint8Array, -1);
        };
        reader.readAsArrayBuffer(file);
    }

    self.getFile = (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        const files = evt.dataTransfer && evt.dataTransfer.files ? evt.dataTransfer.files : evt.target.files; // FileList object.
        const first = [...files].filter(f => f.type.match('image.*'))[0]; // Convert to array, then filter.
        return new Promise((resolve, reject) => {
            if (first) {
                getFileData(first, (uint8Array, orientation) => {
                    const blob = new Blob([uint8Array], {type: "image/jpeg"});
                    const urlCreator = window.URL || window.webkitURL;
                    const imageUrl = urlCreator.createObjectURL(blob);
                    const result = new Image();
                    result.src = imageUrl;
                    result.onload = () => {
                        self.resizeToReference(result, orientation).then(image => {
                            return self.modifyImage(image, []);
                        }).then(image => {
                            $disc.storage.setLastLoadedImage(image.src);
                            $disc.storage.setRemoteImageLoaded(false);
                            resolve(image);
                        }).catch(err => {
                            console.log(err);
                        });
                    };
                });
            } else {
                reject('wrongImageFormat');
            }
        });
    }

})(window.$disc.imageHandler = window.$disc.imageHandler || {});
