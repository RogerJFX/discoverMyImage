window.$disc = window.$disc || {};
(function AiManager(self) {

    let softSettings;

    function fetchDataAndDo(fn) {
        if(softSettings) {
            fn(softSettings)
        } else {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                softSettings = settings;
                fn(settings)
            });
        }
    }

    self.getTask = (level) => {
        return new Promise((resolve, reject) => {
            fetchDataAndDo((settings) => {
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['taskURL'].replace('__LEVEL__', level)}`).then(data => {
                    resolve(data);
                }).catch(err => reject(err));
            })
        });
    };

    self.resolveTask = (task) => {
        return new Promise((resolve, reject) => {
            fetchDataAndDo((settings) => {
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['resolveURL'].replace('__TASK__', task)}`).then(data => {
                    resolve(data);
                }).catch(err => reject(err));
            })
        });
    };

    self.checkTask = (task) => {
        return new Promise((resolve, reject) => {
            fetchDataAndDo((settings) => {
                $disc.xhrHandler.loadJsonProperties(`${settings['aiServer']}${settings['checkURL'].replace('__TASK__', task)}`).then(data => {
                    resolve(data);
                }).catch(err => reject(err));
            })
        });
    };
})(window.$disc.ai = window.$disc.ai || {});