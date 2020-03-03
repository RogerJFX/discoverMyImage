window.$disc = window.$disc || {};
(function History(self) {

    const history = [];

    let task;

    self.clear = () => {
        history.length = 0;
    };

    self.add = (move) => {
        history.push(move);
        console.log(history);
    };

    self.getHistory = () => {
        return history;
    };

    self.setTask = (_task) => {
        task = _task;
    };

    self.getTask = () => {
        return task;
    };
})(window.$disc.history = window.$disc.history || {});