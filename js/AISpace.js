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
        var _theta = theta % TwoPi;

        var cos = Math.cos(_theta);
        var sin = Math.sin(_theta);

        this.x = this.x * cos - sin * this.y;
        this.y = this.y * sin + cos * this.y;
        return this;
    };

    this.Point.prototype.rotateAround = function (center, theta) {
        var originX = this.x - center.x;
        var originY = this.y - center.y;

        var cos = Math.cos(theta);
        var sin = Math.sin(theta);

        this.x = (originX * cos - originY * sin) + center.x;
        this.y = (originY * cos + originX * sin) + center.y;
        return this;
    };

    // returns a rotated normalized vector
    this.Point.prototype.rotatedNorm = function (theta) {
        return this.rotated(theta).norm();
    };

    // unlike rotate, this return a rotated version and does not rotate in place
    this.Point.prototype.rotated = function (theta) {
        var _theta = theta % TwoPi;
        var ret = new modules.Space.Point(0, 0);

        var cos = Math.cos(_theta);
        var sin = Math.sin(_theta);

        ret.x = this.x * cos - sin * this.y;
        ret.y = this.y * sin + cos * this.y;
        return ret;
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

        var rTop=(a.y-c.y)*(d.x-c.x)-(a.x-c.x)*(d.y-c.y);
        var sTop=(a.y-c.y)*(b.x-a.x)-(a.x-c.x)*(b.y-a.y);
        var bot=(b.x-a.x)*(d.y-c.y)-(b.y-a.y)*(d.x-c.x);

        if (bot === 0.0) {
            return false;
        }

        inv_bot=1.0/bot;
        r=rTop*inv_bot;
        s=sTop*inv_bot;

        if (r > 0 && r < 1 && s > 0 && s < 1) {
            var x = (b.x - a.x) * r + a.x;
            var y = (b.y - a.y) * r + a.y;
            return new modules.Space.Point(x, y);
        }

        return false;
    };

    this.Line.prototype.angle = function () {
        return this.start.angleTo(this.end);
    };

    // circle class
    this.Circle = function Circle(point, radius) {
        this.center = point || new modules.Space.Point(0, 0);
        this.radius = radius || 0;
    };

    this.Circle.prototype.intersectsCircle = function(circle) {
        var dist = this.center.dist(circle.center);
        if (dist < this.radius + circle.radius || dist > Math.abs(this.radius - circle.radius)) {
            var a = (this.radius * this.radius - circle.radius * circle.radius + (dist * dist)) / (dist * 2);

            var dx = circle.center.x - this.center.x;
            var dy = circle.center.y - this.center.y;

            var aOverD = a / dist;

            var x2 = this.center.x + (dx * aOverD);
            var y2 = this.center.y + (dy * aOverD);

            var h = Math.sqrt(Math.abs((this.radius * this.radius) - (a * a)));

            var hOverD = h / dist;
            var rx = -dy * hOverD;
            var ry = dx * hOverD;

            return {
                first: new modules.Space.Point(x2 + rx, y2 + ry),
                second : new modules.Space.Point(x2 - rx, y2 - ry)
            };
        } else {
            return false;
        }
    };

    this.Circle.prototype.fromLine = function (line) {
        this.center.x = line.start.x;
        this.center.y = line.start.y;
        this.radius = line.start.dist(line.end);
        return this;
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
