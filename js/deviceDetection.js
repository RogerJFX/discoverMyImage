window.$disc = window.$disc || {};
(function DeviceDetection(self) {

    const Q_ESTIMATION = 1;
    const Q_TURNED = 2;
    const Q_SEALED = Q_ESTIMATION | Q_TURNED;

    let foundDevice = null;

    let desktopImgDim = null;

    let estimationQuality = 0;

    let lastEstimationProps = null;

    let fixedScreenDevices = null;

    function loadDevices() {
        return new Promise((resolve, reject) => {
            if(fixedScreenDevices) {
                resolve();
            } else {
                $disc.xhrHandler.loadJsonProperties($disc.constants.DEVICE_LIST_URL).then(data => {
                    fixedScreenDevices = data['fixedScreenDevices'];
                    desktopImgDim = data['desktopImgDim'];
                    resolve();
                }).catch(err => console.error(err));
            }
        })
    }

    self.getRecommendedDimensions = () => {
        function getResult() {
            return {
                dim: foundDevice ? foundDevice['imgDim']: desktopImgDim,
                rotatable: !!foundDevice
            }
        }
        return new Promise((resolve, reject) => {
            if((estimationQuality & Q_ESTIMATION) === Q_ESTIMATION) { // already done.
                resolve(getResult());
            } else {
                const estimationCallResult = self.estimate(() => {});
                if(!estimationCallResult) { // SEALED, thus undefined
                    resolve(getResult());
                } else { // PROMISE
                    estimationCallResult.then(() => resolve(getResult()));
                }
            }
        })
    };

    self.estimate = (onFinished) => {
        if((estimationQuality & Q_SEALED) === Q_SEALED) {
            // console.log('SEALED, nothing to do');
            return;
        }
        const w = window.outerWidth;
        const h = window.outerHeight;
        return new Promise(resolve => {
            loadDevices().then(() => {
                const found = fixedScreenDevices.find(device => {
                    const dW = device.dimensions[0];
                    const dH = device.dimensions[1];
                    // console.log(w, h, dW, dH);
                    return (dW === w && dH === h) || (dH === w && dW === h);
                });
                if(found) {
                    if(lastEstimationProps) {
                        if(lastEstimationProps[0] === h && lastEstimationProps[1] === w) {
                            //console.log('SEALING, device is ' + found.name);
                            estimationQuality |= Q_TURNED;
                            onFinished();
                        }
                    } else {
                        //console.log('ESTIMATING, device should be ' + found.name);
                        estimationQuality |= Q_ESTIMATION;
                        foundDevice = found;
                        lastEstimationProps = [w, h];
                    }
                } else {
                    //console.log('No device found, should be a desktop');
                    foundDevice = null;
                    estimationQuality |= Q_SEALED;
                    onFinished();
                }
                resolve();
            })
        });
    }

})(window.$disc.deviceDetection = window.$disc.deviceDetection || {});