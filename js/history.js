window.$disc = window.$disc || {};
(function History(self) {

    const history = [];

    self.clear = () => {
        history.length = 0;
    };

    self.add = (move) => {
        history.push(move);
    };

    self.getHistory = () => {
        return history;
    };

})(window.$disc.history = window.$disc.history || {});