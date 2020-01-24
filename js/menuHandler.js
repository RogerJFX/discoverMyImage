window.$disc = window.$disc || {};
(function MenuHandler(self) {

    let exampleImageList;

    self.handleMenuClick = (showNodes, hideNodes) => {
        hideNodes.forEach(node => document.getElementById(node).style.display = 'none');
        showNodes.forEach(node => document.getElementById(node).style.display = 'block');
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
                        .simpleLoadImage($disc.constants.EXAMPLES_FOLDER_URL + item.filename));
                    onClickFn();
                };
                node.appendChild(button);
            });
        });
    };

})(window.$disc.menuHandler = window.$disc.menuHandler || {});