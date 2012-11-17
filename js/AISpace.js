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
    };

    this.Point.prototype.angleTo = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        var result = Math.atan2(ydist, xdist);
        return result < 0 ? result + TwoPi : result;
    };

    // line class
    this.Line = function Line(start, end) {
        this.start = start;
        this.end = end;
    };

    this.Line.prototype.collidesWith = function (otherLine) {

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
