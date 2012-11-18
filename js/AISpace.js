AIScript.modules.Space = function (aiScript, modules) {
    var TwoPi = Math.PI * 2.0;

    this.Point = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    this.Point.prototype.add = function (xy) {
        this.x += xy.x;
        this.y += xy.y;
        return this;
    };

    this.Point.prototype.sub = function (xy) {
        this.x -= xy.x;
        this.y -= xy.y;
        return this;
    };

    this.Point.prototype.mul = function (scaler) {
        this.x *= scaler;
        this.y *= scaler;
        return this;
    };

    this.Point.prototype.dist = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        return Math.sqrt(xdist * xdist + ydist * ydist);
    };

    this.Point.prototype.norm = function () {
        var magn = this.magn();
        this.x /= magn;
        this.y /= magn;
        return this;
    };

    this.Point.prototype.magn = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    this.Point.prototype.clamp = function (len) {
        var magn = this.mag();
        if (magn > len) {
            this.norm().mul(len);
        }

        return this;
    };

    this.Point.prototype.angleTo = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        var result = Math.atan2(ydist, xdist);
        return result < 0 ? result + TwoPi : result;
    };

    this.Point.prototype.dot = function (xy) {
        this.x *= xy.x;
        this.y *= xy.y;
        return this;
    };

    this.Point.prototype.rotate = function (theta) {
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);

        this.x = this.x * cos - sin * this.y;
        this.y = this.y * sin + cos * this.y;
        return this;
    };

    this.Point.prototype.zero = function (xy) {
        this.x = 0;
        this.y = 0;
        return this;
    };

    this.Point.prototype.isInRegion = function (topLeft, botRight) {
        return this.x > topLeft.x && this.x < botRight.y &&
               this.y < topLeft.y && this.y > botRight.y;
    };

    // line class
    this.Line = function Line(start, end) {
        this.start = start;
        this.end = end;
    };

    this.Line.prototype.intersectsLine = function (other) {
        var a = this.start,
            b = this.end,
            c = other.start,
            d = other.end;

        rTop=(a[1]-c[1])*(d[0]-c[0])-(a[0]-c[0])*(d[1]-c[1])
        rBot=(b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0])
        sTop=(a[1]-c[1])*(b[0]-a[0])-(a[0]-c[0])*(b[1]-a[1])
        sBot=(b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0])

        if sBot == 0.0 or rBot == 0.0:
        return None

        inv_bot=1.0/bot
        r=rTop*inv_bot
        s=sTop*inv_bot

        if r > 0 and r < 1 and s > 0 and s < 1:
            return [(x-a[i])*r+a[i] for i,x in enumerate(b)]
        return None
    };

    // poly class
    this.Polygon = function Polygon() {
        this.points = [];
    };

    this.Polygon.prototype.addPoint = function (point) {
        this.points.push(point);
    };

    this.Polygon.prototype.removePoint = function (point) {
        this.points.slice(this.points.indexOf(point), 1);
    };

    this.Polygon.prototype.collidesWith = function (otherPoly) {

    };
};
