window.$disc = window.$disc || {};
(function DeviceDetection(self) {

    let foundDevice;

    let estimationQuality = 0;

    let lastEstimationProps = null;


    const Q_ESTIMATION = 1;
    const Q_TURNED = 2;
    const Q_SEALED = Q_ESTIMATION | Q_TURNED;

    const DEVICES = [
        {
            name: "iPad",
            dimensions: [1024, 768]
        },
        {
            name: "iPadPro",
            dimensions: [1366, 1024]
        },
        {
            name: "iPhone678",
            dimensions: [375, 667]
        },
        {
            name: "iPhone678+",
            dimensions: [414, 736]
        },
        {
            name: "iPhoneX",
            dimensions: [375, 812]
        },
        {
            name: "GalaxyS5",
            dimensions: [360, 640]
        },
        {
            name: "Some1",
            dimensions: [1280, 800]
        },
        {
            name: "Some2",
            dimensions: [1280, 768]
        },
        {
            name: "Some3",
            dimensions: [1024, 600]
        },
        {
            name: "Some4",
            dimensions: [1024, 800]
        },
        {
            name: "HalfFHD",
            dimensions: [960, 540]
        },
        {
            name: "SomeFHD",
            dimensions: [720, 405]
        }
    ];

    self.estimate = () => {
        if((estimationQuality & Q_SEALED) === Q_SEALED) {
            console.log('SEALED, nothing to do');
            return;
        }
        const w = window.outerWidth;
        const h = window.outerHeight;
        const found = DEVICES.find(device => {
            const dW = device.dimensions[0];
            const dH = device.dimensions[1];
            // console.log(w, h, dW, dH);
            return (dW === w && dH === h) || (dH === w && dW === h);
        });
        if(found) {
            if(lastEstimationProps) {
                if(lastEstimationProps[0] === h && lastEstimationProps[1] === w) {
                    console.log('SEALING, device is ' + found.name);
                    estimationQuality |= Q_TURNED;
                    return true;
                }
            } else {
                console.log('ESTIMATING, device should be ' + found.name);
                estimationQuality |= Q_ESTIMATION;
                foundDevice = found;
                lastEstimationProps = [w, h];
            }
        } else {
            console.log('No device found, should be a desktop');
            estimationQuality |= Q_SEALED;
            return true;
        }
        return false;
    }

})(window.$disc.deviceDetection = window.$disc.deviceDetection || {});