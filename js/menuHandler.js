window.$disc = window.$disc || {};
(function MenuHandler(self) {

    let exampleImageList;

    const formValidationRx = {
        myName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF -]{2,32}$/,
        hisName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF -]{2,32}$/,
        mailTo: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/
    };

    function doAlert(message, timeout, cb) {
        document.getElementById('commonAlertMessage').innerHTML = message;
        self.handleMenuClick(['alertModalLayer', 'commonAlertModal', 'alertBG'], []);
        if(timeout) {
            setTimeout(() => {
                self.handleMenuClick([],['alertModalLayer', 'commonAlertModal', 'alertBG']);
            }, timeout);
        }
        function action() {
            self.handleMenuClick([],['alertModalLayer', 'commonAlertModal', 'modalBG', 'mainMenu', 'modalLayer', 'alertBG']);
            if(cb) {
                cb();
            }
        }
        document.getElementById('alertOk').onclick = action;
        document.getElementById('alertCloseButton').onclick = action;

    }

    function Prompt(message, cb) {
        document.getElementById('commonPromptMessage').innerHTML = message;
        self.handleMenuClick(['promptModalLayer', 'commonPromptModal', 'modalBG'], ['mainMenu', 'modalLayer']);
        document.getElementById('promptInput').focus();
        document.getElementById('promptOk').onclick = () => {
            cb(document.getElementById('promptInput').value);
            self.handleMenuClick([], ['commonPromptModal', 'promptModalLayer', 'modalBG']);
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

    self.setLevel = (level) => {
        $disc.settingsHandler.setLevel(level);
        $disc.stageActions.buildTiles();
    };

    self.saveCurrentTask = () => {
        const image = $disc.stageActions.getCurrentImage();
        if(image) {
            const tileStates = $disc.tileManager.getCurrentTilesState();
            const grid = $disc.settingsHandler.getLastGrid();
            $disc.storage.saveCurrentTask(image, tileStates, grid);
            return true;
        }
        return false;
    };

    self.loadCurrentTask = () => {
        const task = $disc.storage.getCurrentTask();
        if(task) {
            $disc.stageActions.processFile(new Promise(resolve => {
                const image = new Image();
                image.src = task.image;
                image.onload = () => resolve(image);
            }), task.settings, task.tileStates);
        }
    };

    self.checkImageLoaded = () => {
        if(!$disc.stageActions.getCurrentImage()) {
            $disc.lang.getTranslation('noImageLoaded')
                .then(t => doAlert(t, 4000))
                .catch(reason => doAlert('No translation found'));
            return false;
        }
        return true;
    };

    self.hasCurrentTask = () => $disc.storage.hasCurrentTaskStored();

    self.hasCurrentImage = () => $disc.stageActions.hasCurrentImage();

    self.isMobileDevice = () => $disc.deviceDetection.isMobileDevice();

    self.toggleShowButton = (nodeId, checkFn) => {
        document.getElementById(nodeId).style.display = checkFn() ? 'block': 'none';
    };

    self.alert = (message, timeout, callback) => {
        doAlert(message, timeout, callback);
    };

    self.handleMenuClick = (showNodes, hideNodes) => {
        function showAllNodes() {
            showNodes.forEach(n => {
                const node = document.getElementById(n);
                if(node.hasClass('transitionable')) {
                    node.style.display = 'block';
                    setTimeout(() => {
                        node.style.opacity = '1';
                    }, 25)
                } else {
                    node.style.display = 'block';
                }
            });
        }
        if(hideNodes.length === 0) {
            showAllNodes();
        } else {
            let counter = 0;
            hideNodes.forEach(n => {
                const node = document.getElementById(n);
                if(node.hasClass('transitionable') && node.style.display === 'block') {
                    node.style.opacity = '0';
                    const listener = node.addEventListener('transitionend', () => {
                        node.style.display = 'none';
                        if(++counter === hideNodes.length) {
                            showAllNodes();
                        }
                        //  node.removeEventListener('transitionend', listener, true);
                    }, {
                        capture: false,
                        once: true,
                        passive: false
                    });
                } else {
                    node.style.display = 'none';
                    showAllNodes();
                }
            });
        }
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
            window.$disc.xhrHandler.putImage(window.$disc.xhrHandler.createBean(imageToSend.src, myNameNode.value, hisNameNode.value, mailNode.value));
            hisNameNode.value = '';
            mailNode.value = '';
        }
    };

    self.uploadUsingWhatsApp = () => {
        const imageToSend = $disc.stageActions.getCurrentImage();
        if(imageToSend) {
            window.$disc.xhrHandler.postImage(
                window.$disc.xhrHandler.createBean(imageToSend.src, '', '', ''),
                (uuidJsonStr) => {
                    const obj = JSON.parse(uuidJsonStr);
                    const uuid = obj['uuid'];
                    $disc.settingsHandler.getSoftSettings().then(settings => {
                        const link = `${settings['myServer']}${settings['myTaskUrl'].replace('__UUID__', uuid)}`;
                        console.log(link);
                        location.href = 'whatsapp://send/?text=%20' + link;
                    })
                }
            );
        }
    };

    self.solveCurrentTask = () => {
        $disc.lang.getTranslation('promptSolutionLimit').then(result => {
            const numLeft = $disc.settingsHandler.getServerCapabilities()['solutionStepsLeft'];
            new Prompt(result.replace('__num__', numLeft), (inp) => {
                self.handleMenuClick([], ['modalBG', 'mainMenu', 'modalLayer']);
                if(isNaN(inp)) {
                    $disc.tileManager.solve(100);
                } else {
                    $disc.tileManager.solve(Number(inp));
                }
            });
        });

    };

    self.login = (user, pass) => {
        $disc.xhrHandler.login({user: user, pass: pass}, () => {})
    };

    self.listExampleImages = (nodeId, onClickFn) => {
        const lang = $disc.lang.getCurrLang();
        const node = document.getElementById(nodeId);
        // const presentButtons = node.getElementsByTagName('BUTTON');
        if(exampleImageList) {
            exampleImageList.forEach(item => {
                const node = document.getElementById(`exampleImageButton${item.index}`);
                node.innerHTML = item.description[lang];
            });
            return;
        }
        $disc.xhrHandler.loadJsonProperties($disc.constants.EXAMPLE_LIST_URL, true).then(list => {
            exampleImageList = list;
            list.sort((a, b) => {
                return  a.index - b.index;
            }).forEach(item => {
                const button = document.createElement('BUTTON');
                button.setAttribute('id', `exampleImageButton${item.index}`);
                button.innerHTML = item.description[lang];
                button.onclick = () => {
                    $disc.stageActions.processFile($disc.xhrHandler
                        .simpleLoadImage($disc.constants.EXAMPLES_FOLDER_URL + item.filename));
                    onClickFn();
                };
                node.appendChild(button);
            });
        });
    };

})(window.$disc.menuHandler = window.$disc.menuHandler || {});