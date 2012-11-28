AIScript.modules.Behaviors = function (aiScript, modules) {
    this.Seek = function Seek(fromFn, targetFn) {
        this.from = fromFn;
        this.to = targetFn;
    };

    this.Seek.prototype.update = function () {
        
    };
};