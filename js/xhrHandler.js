window.$disc = window.$disc || {};
(function XhrHandler(self) {

    function EnterpriseBean(imgSrc, lvl, myName, herName, email, lang) {
        this.imgSrc = imgSrc;
        this.lvl = lvl;
        this.email = email;
        this.myName = myName;
        this.herName = herName;
        this.lang = lang;
    }

    self.createBean = (imgSrc, myName, herName, email) => {
        return new EnterpriseBean(imgSrc, $disc.settingsHandler.getLevel(), myName, herName, email, $disc.lang.getCurrLang());
    };

    self.putImage = (bean) => {
        doUpload('PUT', bean, () => {
            $disc.lang.getTranslation('sendSuccess').then(t => $disc.menuHandler.alert(t, 'Info', 2000, null, true));
        });
    };

    self.postImage = (bean, thenFn) => {
        doUpload('POST', bean, thenFn);
    };

    function doUpload(method, bean, onSuccessFn) {
        $disc.settingsHandler.getSoftSettings().then(settings => {
            const xhr = new XMLHttpRequest();
            const mH = $disc.menuHandler;
            xhr.onerror = () => mH.alert('Connection refused. Please try again later.', 'Error', null, null, true);
            xhr.open(method, `${settings['imageServer']}${settings['storeURL']}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            setJwtHeader(xhr);
            xhr.onload = function(e) {
                if (this.status === 200) {
                    onSuccessFn(this.responseText);
                } else {
                    switch (this.status) {
                        case 507:
                            $disc.lang.getTranslation('errorInsufficientStorage').then(t => mH.alert(t, 'Error', null, null, true));
                            break;
                        case 400:
                            $disc.lang.getTranslation('errorBadRequest').then(t => mH.alert(t, 'Error', null, null, true));
                            break;
                        case 403:
                        default:
                            $disc.lang.getTranslation('errorForbidden').then(t => mH.alert(t, 'Error', null, null, true));
                            break;
                    }
                }
            };
            xhr.send(JSON.stringify(bean));
        });
    }

    self.getImage = (uuid) => {
        //const GET_URL = $disc.constants.IMAGE_GET_URL;
        return new Promise((resolve, reject) => {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                const xhr = new XMLHttpRequest();
                xhr.onerror = () => reject(-1);
                const URL = settings['getURL'].replace('__UUID__', uuid);
                xhr.open('GET', `${settings['imageServer']}${URL}`, true);
                setJwtHeader(xhr);
                xhr.onload = function(e) {
                    if (this.status === 200) {
                        const jwtHeader = this.getResponseHeader('jwt');
                        if(jwtHeader) {
                            $disc.settingsHandler.setJwt(jwtHeader);
                        }

                        const obj = JSON.parse(this.responseText);
                        $disc.storage.setRemoteImageLoaded(true);
                        resolve(obj);
                    } else {
                        reject(this.status);
                    }
                };
                xhr.send();
            }).catch(_ => reject(500));
        });
    };

    // Hm...
    self.simpleLoadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                $disc.imageHandler.resizeToReference(img).then(image => {
                    $disc.storage.setRemoteImageLoaded(false);
                    resolve(image);
                }).catch(err => console.log(err));
            }
        })
    };

    self.loadJsonProperties = (_url, once) => {
        const url = once ? `${_url}?ts=${new Date().getTime()}` : _url;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onerror = () => reject(-1);
            xhr.open('GET', url, true);
            if(!once) {
                setJwtHeader(xhr);
                setPrpHeader(xhr);
            }
            xhr.onload = function(e) {
                if (this.status === 200) {
                    const jwtHeader = this.getResponseHeader('jwt');
                    if(jwtHeader) {
                        $disc.settingsHandler.setJwt(jwtHeader);
                    }
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(this.status);
                }
            };
            xhr.send();
        });
    };

    self.postJsonProperties = (_url, method, entity) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onerror = () => reject(-1);
            xhr.open(method, _url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            setJwtHeader(xhr);
            setPrpHeader(xhr);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    const jwtHeader = this.getResponseHeader('jwt');
                    if (jwtHeader) {
                        $disc.settingsHandler.setJwt(jwtHeader);
                    }
                    resolve(this.responseText);
                } else {
                    reject(this.status);
                }
            };
            xhr.send(JSON.stringify(entity));
        });
    };

    self.login = (entity, onSuccessFn, onFailureFn) => {
        $disc.settingsHandler.getSoftSettings().then(settings => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${settings['userServer']}${settings['loginURL']}`, true);
            setJwtHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function(e) {
                if (this.status === 200) {
                    const jwtHeader = this.getResponseHeader('jwt');
                    if(jwtHeader) {
                        $disc.settingsHandler.setJwt(jwtHeader);
                    }
                    onSuccessFn(this.responseText);
                } else {
                    onFailureFn();
                }
            };
            xhr.send(JSON.stringify(entity));
        });
    };

    function setJwtHeader(xhr) { // Never send "null"
        const jwt = $disc.settingsHandler.getJwt();
        if(jwt) {
            xhr.setRequestHeader('jwt', jwt);
        }
    }

    function setPrpHeader(xhr) {
        const lastLoadedImage = $disc.storage.getLastLoadedImage();
        if(lastLoadedImage) {
            xhr.setRequestHeader('prp', `${lastLoadedImage.hashCode()}/${lastLoadedImage.length}`);
        }
    }

})(window.$disc.xhrHandler = window.$disc.xhrHandler || {});