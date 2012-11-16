AIScript.modules.Point = function(aiScript) {
    var TwoPi = Math.PI * 2.0;

    aiScript.Point = function (x, y) {
        this.x = x;
        this.y = y;

        if (this.length === 0) {
            this.x = 0;
            this.y = 0;
        } else if (this.length == 1) {
            this.y = 0;
        }
    };

    aiScript.Point.prototype.add = function (xy) {
        this.x += xy.x;
        this.y += xy.y;
        return this;
    };

    aiScript.Point.prototype.sub = function (xy) {
        this.x -= xy.x;
        this.y -= xy.y;
        return this;
    };

    aiScript.Point.prototype.mul = function (scaler) {
        this.x *= scaler;
        this.y *= scaler;
        return this;
    };

    aiScript.Point.prototype.dist = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        return Math.sqrt(xdist * xdist + ydist * ydist);
    };

    aiScript.Point.prototype.norm = function () {
        var magn = this.magn();
        this.x /= magn;
        this.y /= magn;
        return this;
    };

    aiScript.Point.prototype.magn = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    aiScript.Point.prototype.clamp = function (len) {
        var magn = this.mag();
        if (magn > len) {
            this.norm().mul(len);
        }
    };

    aiScript.Point.prototype.angleTo = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        var result = Math.atan2(ydist, xdist);
        return result < 0 ? result + TwoPi : result;
    };
};
