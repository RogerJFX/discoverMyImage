window.$disc = window.$disc || {};
(function XhrHandler(self) {

    const STORE_URL = '../discCgi/store.php';
    const GET_URL = '../discCgi/get.php';

    function EnterpriseBean(imgSrc, email) {
        this.imgSrc = imgSrc;
        this.email = email;
    }

    self.createBean = (imgSrc, email) => {
        return new EnterpriseBean(imgSrc, email);
    };

    self.uploadImage = (bean) => {
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

})(window.$disc.xhrHandler = window.$disc.xhrHandler || {});