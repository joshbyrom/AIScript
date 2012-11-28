AIScript.modules.Behaviors = function (aiScript, modules) {
    var Point = modules.Space.Point;

    this.Seek = function Seek(fromFn, targetFn) {
        this.from = fromFn;
        this.to = targetFn;

        this.lastLinear = new Point();
    };

    this.Seek.prototype.update = function () {
        var currentPos = this.from() || null;
        var targetPos = this.to() || null;

        this.calculateLinear(currentPos, targetPos);
    };

    this.Seek.prototype.calculateLinear = function (point, target) {
        if (target === null || point === null) {
            this.lastLinear.zero();
            return;
        }

        this.lastLinear.x = target.x - point.x;
        this.lastLinear.y = target.y - point.y;
    };

    this.Seek.prototype.linear = function () {
        return this.lastLinear;
    };

    // arrive
    this.Arrive = function Arrive(fromFn, targetFn, forceFn) {
        this.seek = new modules.Behaviors.Seek(fromFn, targetFn);

        this.forceFn = forceFn;
        this.isFinished = false;
        this.slowdownRadius = 100.0;
        this.slowdownRate = 20.0;
        this.lastLinear = new Point();
    };

    this.Arrive.prototype.update = function () {
        this.seek.update();
        var desired = this.seek.linear();

        var magn = desired.magn();
        if (magn > 1) {
            if (magn < this.slowdownRadius) {
                var x = desired.x / magn;
                var y = desired.y / magn;

                var mod = this.forceFn() * (magn / this.slowdownRate);

                this.lastLinear.x = x * mod;
                this.lastLinear.y = y * mod;
            } else {
                this.lastLinear = desired;
            }
        } else {
            this.isFinished = true;
            this.lastLinear.zero();
        }
    };

    this.Arrive.prototype.linear = function () {
        return this.lastLinear;
    };

    this.Arrive.prototype.finished = function () {
        return this.isFinished;
    };
};