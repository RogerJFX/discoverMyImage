window.$disc = window.$disc || {};
(function MenuHandler(self) {

    self.handleMenuClick = (showNodes, hideNodes) => {
        hideNodes.forEach(node => document.getElementById(node).style.display = 'none');
        showNodes.forEach(node => document.getElementById(node).style.display = 'block');
    };

    self.listExampleImages = (nodeId, onClickFn) => {
        const node = document.getElementById(nodeId);
        const presentButtons = node.getElementsByTagName('BUTTON');
        if(presentButtons && presentButtons.length !== 0) {
            return;
        }
        $disc.xhrHandler.loadJsonProperties($disc.constants.EXAMPLE_LIST_URL).then(list => {
            list.sort((a, b) => {
                return  a.index - b.index;
            }).forEach(item => {
                const button = document.createElement('BUTTON');
                button.innerHTML = item.description;
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