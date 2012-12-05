AIScript.modules.Behaviors = function (aiScript, modules) {
    var Point = modules.Space.Point;
    
    this.Seek = function Seek(fromFn, targetFn) {
        this.from = fromFn;
        this.to = targetFn;

        this.lastLinear = new Point();

        this.isFinished = false;
        this.distCheckInterval = 0;
        this.distCheckRate = 3;
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

        this.distCheckInterval = this.distCheckInterval + 1;
        if (this.distCheckInterval === this.distCheckRate) {
            this.distCheckInterval = 0;

            var magn = this.lastLinear.magn();
            if (magn < 1) {
                this.isFinished = true;
            }
        }
    };

    this.Seek.prototype.finished = function () {
        return this.isFinished;
    };

    this.Seek.prototype.linear = function () {
        return this.lastLinear;
    };

    this.LerpingSeek = function LerpingSeek(from, to, timeToTarget) {
        this.from = new Point(from.x, from.y);
        this.to = new Point(to.x, to.y);

        this.timeToTarget = Math.max(timeToTarget, 0.0001);
        this.timeStarted = false;
        this.timeToStop = false;

        this.timeElapsed = 0;
        this.t = 0;
    };

    this.LerpingSeek.prototype.update = function () {
        var now = aiScript.pInst.millis();

        if (!this.timeStarted) {
            this.timeStarted = now;
            this.timeToStop = this.timeStarted + this.timeToTarget;
            return;
        }

        this.timeElapsed = now - this.timeStarted;
        this.t = this.timeElapsed / this.timeToTarget;
    };

    this.LerpingSeek.prototype.finished = function () {
        return this.t > 1.0;
    };

    this.LerpingSeek.prototype.linear = function () {
        var lerp = aiScript.pInst.lerp,
            t = Math.min(this.t, 1.0);

        var x = lerp(this.from.x, this.to.x, t),
            y = lerp(this.from.y, this.to.y, t),
            result = new Point(x, y);

        return result;
    };

    // arrive
    this.Arrive = function Arrive(fromFn, targetFn, forceFn) {
        this.seek = new modules.Behaviors.Seek(fromFn, targetFn);

        this.forceFn = forceFn;
        this.isFinished = false;
        this.slowdownRadius = 100.0;
        this.slowdownRate = 10.0;
        this.lastLinear = new Point();

        this.accuracy = 1;
    };

    this.Arrive.prototype.update = function () {
        this.seek.update();
        var desired = this.seek.linear();

        var magn = desired.magn();
        if (magn > this.accuracy) {
            this.isFinished = false;
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
            this.lastLinear = desired;
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

    // timed behavior
    this.TimedBehavior = function (behavior, delay, duration) {
        this.behavior = behavior;

        this.timeNow = aiScript.pInst.millis();
        this.active = false;
        this.init();
    };

    this.TimedBehavior.prototype.init = function () {
        this.delay = Math.max(delay || 0, 15);
        this.duration = Math.max(duration || 0, 0);

        this.timeToStart = this.timeNow + this.delay;
        this.timeToFinish = this.timeToStart + this.duration;
    };

    this.TimedBehavior.prototype.update = function () {
        this.timeNow = aiScript.pInst.millis();
        this.active = this.isActive();

        if (this.active && 'update' in this.behavior) {
            this.behavior.update();
        };
    };

    this.TimedBehavior.prototype.linear = function () {
        if (this.active && 'linear' in this.behavior) {
            return this.behavior.linear();
        } else {
            return new Point();
        }
    };

    this.TimedBehavior.prototype.rotation = function () {
        if (this.active && 'rotation' in this.behavior) {
            return this.behavior.rotation();
        } else {
            return 0;
        }
    };

    this.TimedBehavior.prototype.isActive = function () {
        return this.timeNow > this.timeToStart && this.timeNow <= this.timeToFinish;
    };

    this.TimedBehavior.prototype.finished = function () {
        return this.timeNow > this.timeToFinish || ('finished' in this.behavior && this.behavior.finished());
    };

    // path following
    this.PathFollowing = function PathFollowing(path, startingIndex, fromFn, forceFn, direction) {
        this.path = path;
        this.points = path.points;
        this.direction = direction || 1;

        this.arrive = new modules.Behaviors.Arrive(fromFn, this.getTarget.bind(this), forceFn);
        this.arrive.accuracy = 3;

        this.currentBehavior = this.arrive;
        this.currentIndex = startingIndex || 0;

        this.behaviorsAtPoints = {};
    };

    this.PathFollowing.prototype.getTarget = function () {
        return this.points[this.currentIndex];
    };

    this.PathFollowing.prototype.update = function () {
        this.currentBehavior.update();

        if (this.currentBehavior.finished && this.currentBehavior.finished()) {
            if (this.currentBehavior === this.arrive) {
                this.currentIndex = (this.currentIndex + this.direction) % this.points.length;
                
                if (this.currentIndex < 0) {
                    this.currentIndex += this.points.length;
                }

                if (this.behaviorsAtPoints[this.currentIndex]) {
                    this.currentBehavior = this.bahaviorsAtPoints[this.currentIndex];
                }
            } else {
                this.currentBehavior = this.arrive;
            }
        };
    };

    this.PathFollowing.prototype.linear = function () {
        if (this.currentBehavior.linear) {
            return this.currentBehavior.linear();
        } else {
            return new Point();
        }
    };
};