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

    let loadObserverFns = [];

    let loading = false;

    function loadDevicesObservable(callback) {
        if(fixedScreenDevices) {
            loading = false;
            callback();
        } else {
            loadObserverFns.push(callback);
            if(!loading) {
                loading = true;
                $disc.xhrHandler.loadJsonProperties($disc.constants.DEVICE_LIST_URL, true).then(data => {
                    fixedScreenDevices = data['fixedScreenDevices'];
                    desktopImgDim = data['desktopImgDim'];
                    loading = false;
                    loadObserverFns.forEach(fn => fn());
                    loadObserverFns = [];
                }).catch(err => console.error(err));
            }
        }
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

    self.isMobileDevice = () => {
        return !!foundDevice;
    };

    self.getScreenDimensions = () => {
        return [screen.availWidth, screen.availHeight];
    };

    self.estimate = (onFinished, force) => {
        if((estimationQuality & Q_SEALED) === Q_SEALED && !force) {
            return;
        }
        const dims = self.getScreenDimensions();
        const w = dims[0];
        const h = dims[1];
        return new Promise(resolve => {
            loadDevicesObservable(() => {
                const found = fixedScreenDevices.find(device => {
                    const dW = device.dimensions[0];
                    const dH = device.dimensions[1];
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