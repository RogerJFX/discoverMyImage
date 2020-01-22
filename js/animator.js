window.$disc = window.$disc || {};
(function Animator(self) {
    self.translateCard = (node, left, top, _steps, _resolveAfter) => {
        const steps = _steps || $disc.constants.ANI_STEPS_TRANSLATECARD;
        const resolveAfter = _resolveAfter || steps;
        let resolved = false;
        return new Promise((resolve) => {
            const x = node.offsetLeft;
            const y = node.offsetTop;
            const diffX = left - x;
            const diffY = top -y;
            const stepX = diffX / steps;
            const stepY = diffY / steps;
            const stepsX = [];
            const stepsY = [];
            for (let i = 0; i < steps; i++) {
                stepsX.push(x + stepX * i);
                stepsY.push(y + stepY * i);
            }
            let c = 0;
            const oldZIndex = node.style.zIndex;
            node.style.zIndex = 7777 + '';
            const interval = window.setInterval(() => {
                if(c < steps) {
                    node.style.left = stepsX[c] + 'px';
                    node.style.top = stepsY[c] + 'px';
                    if(c === resolveAfter) {
                        resolved = true;
                        resolve();
                    }
                    c++;
                } else {
                    node.style.left = left + 'px';
                    node.style.top = top + 'px';
                    window.clearInterval(interval);
                    node.style.zIndex = oldZIndex; // Might be modified after resolve.
                    if(!resolved) {
                        resolve();
                    }
                }
            }, $disc.constants.MILLIS_PER_STEP);
        });
    };

})(window.$disc.animator = window.$disc.animator || {});
