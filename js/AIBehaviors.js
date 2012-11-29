﻿AIScript.modules.Behaviors = function (aiScript, modules) {
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
    this.PathFollowing = function PathFollowing(path, startingIndex, fromFn, forceFn) {
        this.path = path;
        this.points = path.points;

        this.arrive = new modules.Behaviors.Arrive(fromFn, this.getTarget.bind(this), forceFn);
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
                this.currentIndex = (this.currentIndex + 1) % this.points.length;
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