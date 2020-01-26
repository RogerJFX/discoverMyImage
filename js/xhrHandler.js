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
        const STORE_URL = $disc.constants.IMAGE_STORE_URL;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', STORE_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.onload = function(e) {
            if (this.status === 200) {
                console.log(this.responseText);
            }
        };

        xhr.send(JSON.stringify(bean));
    };

    self.getImage = (uuid) => {
        const GET_URL = $disc.constants.IMAGE_GET_URL;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${GET_URL}?uuid=${uuid}`, true);
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