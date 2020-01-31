window.$disc = window.$disc || {};
(function XhrHandler(self) {

    function EnterpriseBean(imgSrc, myName, herName, email, lang) {
        this.imgSrc = imgSrc;
        this.email = email;
        this.myName = myName;
        this.herName = herName;
        this.lang = lang;
    }

    self.createBean = (imgSrc, myName, herName, email) => {
        return new EnterpriseBean(imgSrc, myName, herName, email, $disc.lang.getCurrLang());
    };

    self.uploadImage = (bean) => {
        $disc.settingsHandler.getSoftSettings().then(settings => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', `${settings['imageServer']}${settings['storeURL']}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            const mH = $disc.menuHandler;
            xhr.onload = function(e) {
                if (this.status === 200) {
                    $disc.lang.getTranslation('sendSuccess').then(t => mH.alert(t, 2000));
                } else {
                    switch (this.status) {
                        case 400:
                            $disc.lang.getTranslation('errorBadRequest').then(t => mH.alert(t));
                            break;
                        case 403:
                        default:
                            $disc.lang.getTranslation('errorForbidden').then(t => mH.alert(t));
                            break;
                    }
                }
            };
            xhr.send(JSON.stringify(bean));
        });
    };

    self.getImage = (uuid) => {
        //const GET_URL = $disc.constants.IMAGE_GET_URL;
        return new Promise((resolve, reject) => {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                const xhr = new XMLHttpRequest();
                const URL = settings['getURL'].replace('__UUID__', uuid);
                xhr.open('GET', `${settings['imageServer']}${URL}`, true);
                xhr.onload = function(e) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.responseText));
                    } else {
                        reject(this.status);
                    }
                };
                xhr.send();
            }).catch(_ => reject(500));
            // const xhr = new XMLHttpRequest();
            // xhr.open('GET', `${GET_URL}?uuid=${uuid}`, true);
            // xhr.onload = function(e) {
            //     if (this.status === 200) {
            //         resolve(JSON.parse(this.responseText));
            //     } else {
            //         reject(this.status);
            //     }
            // };
            // xhr.send();
        });
    };

    // Hm...
    self.simpleLoadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                $disc.imageHandler.resizeImage(img).then(image => {
                    resolve(image);
                }).catch(err => console.log(err));
            }
        })
    };

    self.loadJsonProperties = (url) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function(e) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(this.status);
                }
            };
            xhr.send();
        });
    };

})(window.$disc.xhrHandler = window.$disc.xhrHandler || {});