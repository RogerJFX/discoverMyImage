window.$disc = window.$disc || {};
(function MenuHandler(self) {

    let exampleImageList;

    const formValidationRx = {
        myName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF -]{2,32}$/,
        hisName: /^[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF -]{2,32}$/,
        nickName: /^[A-Za-z0-9À-ž\u0370-\u03FF\u0400-\u04FF -]{4,32}$/,
        mailTo: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/
    };

    function doAlert(message, headline, timeout, cb, onlyCloseAlert) {
        document.getElementById('commonAlertMessage').innerHTML = message;
        document.getElementById('alertHeadline').innerHTML = headline || '';
        self.handleMenuClick(['alertModalLayer', 'commonAlertModal', 'alertBG'], []);
        if (timeout) {
            setTimeout(() => {
                self.handleMenuClick([], ['alertModalLayer', 'commonAlertModal', 'alertBG']);
            }, timeout);
        }

        function action() {
            if (onlyCloseAlert) {
                self.handleMenuClick([], ['alertModalLayer', 'commonAlertModal', 'alertBG']);
            } else {
                self.handleMenuClick([], ['alertModalLayer', 'commonAlertModal', 'modalBG', 'mainMenu', 'modalLayer', 'alertBG']);
            }

            if (cb) {
                cb();
            }
        }

        document.getElementById('alertOk').onclick = action;
        document.getElementById('alertOk').focus();
        document.getElementById('alertCloseButton').onclick = action;

    }

    function Prompt(message, headline, cb) {
        document.getElementById('commonPromptMessage').innerHTML = message;
        document.getElementById('promptHeadline').innerHTML = headline || '';
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
        if (!formValidationRx.myName.test(myNameNode.value)) {
            myNameNode.addClass('wrongInput');
            ok = false;
        }
        if (!formValidationRx.hisName.test(hisNameNode.value)) {
            hisNameNode.addClass('wrongInput');
            ok = false;
        }
        if (!formValidationRx.mailTo.test(mailNode.value)) {
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
        if (image) {
            const tileStates = $disc.tileManager.getCurrentTilesState();
            const grid = $disc.settingsHandler.getLastGrid();
            $disc.storage.saveCurrentTask(image, tileStates, grid);
            return true;
        }
        return false;
    };

    self.loadCurrentTask = () => {
        const task = $disc.storage.getCurrentTask();
        if (task) {
            $disc.stageActions.processFile(new Promise(resolve => {
                const image = new Image();
                image.src = task.image;
                image.onload = () => resolve(image);
            }), task.settings, task.tileStates);
        }
    };

    self.checkImageLoaded = () => {
        if (!$disc.stageActions.getCurrentImage()) {
            $disc.lang.getTranslation('noImageLoaded')
                .then(t => doAlert(t, 'Error', 4000))
                .catch(reason => doAlert('No translation found'));
            return false;
        }
        return true;
    };

    self.hasCurrentTask = () => $disc.storage.hasCurrentTaskStored();

    self.hasCurrentImage = () => $disc.stageActions.hasCurrentImage();

    self.isMobileDevice = () => $disc.deviceDetection.isMobileDevice();

    self.toggleShowButton = (nodeId, checkFn) => {
        document.getElementById(nodeId).style.display = checkFn() ? 'block' : 'none';
    };

    self.toggleSettings = () => {
        const minLevel = $disc.settingsHandler.getMinLevel();
        const levelButtons = $disc.constants.SETTINGS_BUTTONS;
        for (let i = 0; i < levelButtons.length; i++) {
            if(i < minLevel - 1) {
                document.getElementById(levelButtons[i]).style.display = 'none';
            } else {
                document.getElementById(levelButtons[i]).style.display = 'block';
            }
        }
    };

    self.alert = (message, headline, timeout, callback, onlyCloseAlert) => {
        doAlert(message, headline, timeout, callback, onlyCloseAlert);
    };

    self.alertError = (message, timeout, callback, onlyCloseAlert) => {
        $disc.lang.getTranslation('alertErrorHeadline').then(hl => {
            doAlert(message, hl, timeout, callback, onlyCloseAlert);
        });
    };

    self.alertSuccess = (message, timeout, callback, onlyCloseAlert) => {
        $disc.lang.getTranslation('alertSuccessHeadline').then(hl => {
            doAlert(message, hl, timeout, callback, onlyCloseAlert);
        });
    };

    self.congratulate = (props) => {
        $disc.lang.getTranslation('congratsHeadline').then(hl => {
            $disc.lang.getTranslation('congratsMsg').then(msg => {
                const message = msg.split('<br/>').map(token => {
                    if(token.includes('__FREE_STEPS__')) {
                        return token.makeSingularOrPlural(props['freeSteps']);
                    } else if(token.includes('__REWARD_POINTS__')) {
                        return token.makeSingularOrPlural(props['rewardPoints']);
                    } else {
                        return token;
                    }
                }).join('<br/>')
                    .replace('__FREE_STEPS__', props['freeSteps'])
                    .replace('__REWARD_POINTS__', props['rewardPoints']);
                doAlert(message, hl, null, null, true);
            });
        });
    };

    self.handleMenuClick = (showNodes, hideNodes) => {
        function showAllNodes() {
            showNodes.forEach(n => {
                const node = document.getElementById(n);
                if (node.hasClass('transitionable')) {
                    node.style.display = 'block';
                    setTimeout(() => {
                        node.style.opacity = '1';
                    }, 25)
                } else {
                    node.style.display = 'block';
                }
            });
        }

        if (hideNodes.length === 0) {
            showAllNodes();
        } else {
            let counter = 0;
            hideNodes.forEach(n => {
                const node = document.getElementById(n);
                if (node.hasClass('transitionable') && node.style.display === 'block') {
                    node.style.opacity = '0';
                    const listener = node.addEventListener('transitionend', () => {
                        node.style.display = 'none';
                        if (++counter === hideNodes.length) {
                            showAllNodes();
                        }
                        node.removeEventListener('transitionend', listener, true);
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
        if (!validateSendForm(myNameNode, hisNameNode, mailNode)) {
            return;
        }
        const imageToSend = $disc.stageActions.getCurrentImage();
        if (imageToSend) {
            window.$disc.xhrHandler.putImage(window.$disc.xhrHandler.createBean(imageToSend.src, myNameNode.value, hisNameNode.value, mailNode.value));
            hisNameNode.value = '';
            mailNode.value = '';
        }
    };

    self.uploadUsingWhatsApp = () => {
        const imageToSend = $disc.stageActions.getCurrentImage();
        if (imageToSend) {
            window.$disc.xhrHandler.postImage(
                window.$disc.xhrHandler.createBean(imageToSend.src, '', '', ''),
                (uuidJsonStr) => {
                    const obj = JSON.parse(uuidJsonStr);
                    const uuid = obj['uuid'];
                    $disc.settingsHandler.getSoftSettings().then(settings => {
                        const link = `${settings['myServer']}${settings['myTaskUrl'].replace('__UUID__', uuid)}`;
                        location.href = 'whatsapp://send/?text=%20' + link;
                    })
                }
            );
        }
    };

    self.solveCurrentTask = () => {
        $disc.lang.getTranslation('promptSolutionLimit').then(result => {
            const numLeft = $disc.settingsHandler.getServerCapabilities()['ssl'];
            new Prompt(result.replace('__num__', numLeft), 'Limit?', (inp) => {
                self.handleMenuClick([], ['modalBG', 'mainMenu', 'modalLayer']);
                if (isNaN(inp)) {
                    $disc.tileManager.solve(100);
                } else {
                    $disc.tileManager.solve(Number(inp));
                }
            });
        });

    };

    self.login = (user, pass) => {
        $disc.xhrHandler.login({email: user, pass: pass}
            , (resTxt) => {
                if (resTxt && resTxt.length !== 0) {
                    try {
                        const e = JSON.parse(resTxt);
                        $disc.settingsHandler.setNickname(e['nick']);
                        $disc.lang.getTranslation('loginSuccessMsg').then(msg => {
                            const message = msg.replace('__NICK__', e['nick']);
                            self.alertSuccess(message, 3000, null, true);
                        });
                    } catch (err) {
                        console.error("Wrong entity");
                    }
                }
            }
            , () => {
                $disc.lang.getTranslation('loginFailedMsg').then(msg => {
                    self.alertError(msg, null, null, true);
                });

            })
    };

    self.register = (props, onSuccess) => {
        const passNode = document.getElementById(props.pass);
        const nicknameNode = document.getElementById(props.nick);
        const emailNode = document.getElementById(props.email);
        emailNode.removeClass('wrongInput');
        nicknameNode.removeClass('wrongInput');
        passNode.removeClass('wrongInput');
        if ((() => {
            let ok = true;
            if (!formValidationRx.nickName.test(nicknameNode.value)) {
                nicknameNode.addClass('wrongInput');
                ok = false;
            }
            if (passNode.value.length < 8) {
                passNode.addClass('wrongInput');
                passNode.value = '';
                ok = false;
            }
            if (!formValidationRx.mailTo.test(emailNode.value)) {
                emailNode.addClass('wrongInput');
                ok = false;
            }
            return ok;
        })()) {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                $disc.xhrHandler.postJsonProperties(`${settings['userServer']}${settings['registerURL']}`, 'PUT',
                    {
                        email: emailNode.value,
                        nick: nicknameNode.value,
                        pass: passNode.value,
                        lang: $disc.lang.getCurrLang()
                    })
                    .then(_ => {
                        onSuccess();
                        $disc.lang.getTranslation('registerSuccessMsg').then(msg => {
                            self.alertSuccess(msg, null, null, true);
                        });
                    })
                    .catch(_ => {
                        $disc.lang.getTranslation('registerFailedMsg').then(msg => {
                            self.alertError(msg, null, null, true);
                        });
                    })
            });
        }
    };

    self.resetPass = (props, onSuccess) => {
        const emailNode = document.getElementById(props.email);
        emailNode.removeClass('wrongInput');
        if (!formValidationRx.mailTo.test(emailNode.value)) {
            emailNode.addClass('wrongInput');
        } else {
            $disc.settingsHandler.getSoftSettings().then(settings => {
                $disc.xhrHandler.postJsonProperties(`${settings['userServer']}${settings['resetPassURL']}`, 'PUT',
                    {email: emailNode.value, lang: $disc.lang.getCurrLang()})
                    .then(_ => {
                        onSuccess();
                        $disc.lang.getTranslation('registerSuccessMsg').then(msg => {
                            self.alertSuccess(msg, null, null, true);
                        });
                    })
                    .catch(_ => {
                        $disc.lang.getTranslation('resetPassFailedMsg').then(msg => {
                            self.alertError(msg, null, null, true);
                        });
                    })
            });

        }
    };

    self.listExampleImages = (nodeId, onClickFn) => {
        const lang = $disc.lang.getCurrLang();
        const node = document.getElementById(nodeId);
        // const presentButtons = node.getElementsByTagName('BUTTON');
        if (exampleImageList) {
            exampleImageList.forEach(item => {
                const node = document.getElementById(`exampleImageButton${item.index}`);
                node.innerHTML = item.description[lang];
            });
            return;
        }
        $disc.xhrHandler.loadJsonProperties($disc.constants.EXAMPLE_LIST_URL, true).then(list => {
            exampleImageList = list;
            list.sort((a, b) => {
                return a.index - b.index;
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

    self.listScores = (nodeId, myNodeId, boolSolved) => {
        $disc.settingsHandler.getSoftSettings().then(settings => {
            const table = document.getElementById(nodeId);
            table.innerHTML = '';
            const url = `${settings['userServer']}${boolSolved ? settings['highScoresURL'] : settings['upScoresURL']}`;
            $disc.xhrHandler.loadJsonProperties(url, false).then(entity => {
                const scores = entity['scores'];
                document.getElementById(myNodeId).innerHTML = entity['mine'];
                $disc.lang.getTranslation(myNodeId + 'L').then(t => {
                    const nick = $disc.settingsHandler.getNickname();
                    if(nick) {
                        document.getElementById(myNodeId + 'L').innerHTML = t.replace('__NICK__', nick);
                    } else {
                        $disc.lang.getTranslation('guest').then(g => {
                            document.getElementById(myNodeId + 'L').innerHTML = t.replace('__NICK__', g);
                        })
                    }
                });
                scores.forEach(score => {
                    appendRow(table, score[0], score[1]);
                })
            });
        })
    };

    function appendRow(tableNode, name, points) {
        const row = document.createElement("DIV");
        const nameCell = document.createElement("DIV");
        const pointCell = document.createElement("DIV");
        pointCell.addClass('score');
        nameCell.innerHTML = name;
        pointCell.innerHTML = points;
        row.appendChild(nameCell);
        row.appendChild(pointCell);
        tableNode.appendChild(row);
    }

    (function formInputEnter() {
        window.onload = () => {
            [... document.querySelectorAll('.innerModal')].filter(form => form.getElementsByTagName('input').length !== 0).forEach(form => {
                const inputs = [... form.getElementsByTagName('input')];
                const buttons = [... form.getElementsByTagName('button')];
                if(inputs.length !== 0 && buttons.length !== 0) {
                    inputs[inputs.length - 1].addEventListener('keyup', (evt) => {
                        if(evt.key === 'Enter') {
                            buttons[0].click();
                        }
                    });
                }
            })
        };
    })();

})(window.$disc.menuHandler = window.$disc.menuHandler || {});