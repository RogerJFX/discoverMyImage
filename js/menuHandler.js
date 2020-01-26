window.$disc = window.$disc || {};
(function MenuHandler(self) {

    let exampleImageList;

    const formValidationRx = {
        myName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF]{2,32}$/,
        hisName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF]{2,32}$/,
        mailTo: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/
    };

    function Alert(message, timeout) {
        document.getElementById('commonMessage').innerHTML = message;
        self.handleMenuClick(['alertModalLayer', 'commonAlertModal'], []);
        if(timeout) {
            setTimeout(() => {
                self.handleMenuClick([],['alertModalLayer', 'commonAlertModal']);
            }, timeout);
        }
    }

    function validateSendForm(myNameNode, hisNameNode, mailNode) {
        myNameNode.removeClass('wrongInput');
        hisNameNode.removeClass('wrongInput');
        mailNode.removeClass('wrongInput');
        let ok = true;
        if(!formValidationRx.myName.test(myNameNode.value)) {
            myNameNode.addClass('wrongInput');
            ok = false;
        }
        if(!formValidationRx.hisName.test(hisNameNode.value)) {
            hisNameNode.addClass('wrongInput');
            ok = false;
        }
        if(!formValidationRx.mailTo.test(mailNode.value)) {
            mailNode.addClass('wrongInput');
            ok = false;
        }
        return ok;
    }

    self.checkImageLoaded = () => {
        if(!$disc.stageActions.getCurrentImage()) {
            $disc.lang.getTranslation('noImageLoaded')
                .then(t => new Alert(t, 4000))
                .catch(reason => new Alert('No translation found'));
            return false;
        }
        return true;
    };

    self.alert = (message) => {
        return new Alert(message);
    };

    self.handleMenuClick = (showNodes, hideNodes) => {
        hideNodes.forEach(node => document.getElementById(node).style.display = 'none');
        showNodes.forEach(node => document.getElementById(node).style.display = 'block');
    };

    self.upload = (props) => {
        const myNameNode = document.getElementById(props.myName);
        const hisNameNode = document.getElementById(props.hisName);
        const mailNode = document.getElementById(props.mailTo);
        if(!validateSendForm(myNameNode, hisNameNode, mailNode)) {
            return;
        }
        const imageToSend = $disc.stageActions.getCurrentImage();
        if(imageToSend) {
            window.$disc.xhrHandler.uploadImage(window.$disc.xhrHandler.createBean(imageToSend.src, myNameNode.value, hisNameNode.value, mailNode.value));
        }
    };

    self.listExampleImages = (nodeId, onClickFn) => {
        const lang = $disc.lang.getCurrLang();
        const node = document.getElementById(nodeId);
        const presentButtons = node.getElementsByTagName('BUTTON');
        if(exampleImageList) {
            exampleImageList.forEach(item => {
                const node = document.getElementById(`exampleImageButton${item.index}`);
                node.innerHTML = item.description[lang];
            });
            return;
        }
        $disc.xhrHandler.loadJsonProperties($disc.constants.EXAMPLE_LIST_URL).then(list => {
            exampleImageList = list;
            list.sort((a, b) => {
                return  a.index - b.index;
            }).forEach(item => {
                const button = document.createElement('BUTTON');
                button.setAttribute('id', `exampleImageButton${item.index}`);
                button.innerHTML = item.description[lang];
                button.onclick = () => {
                    $disc.stageActions.processFile($disc.xhrHandler
                        .simpleLoadImage($disc.constants.EXAMPLES_FOLDER_URL + item.filename), $disc.settingsHandler.getTileSettings());
                    onClickFn();
                };
                node.appendChild(button);
            });
        });
    };

})(window.$disc.menuHandler = window.$disc.menuHandler || {});