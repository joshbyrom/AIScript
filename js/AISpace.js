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

    this.Point.prototype.distSq = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        return xdist * xdist + ydist * ydist;
    };

    this.Point.prototype.midpoint = function (other) {
        return new modules.Space.Point((this.x + other.x) * 0.5, (this.y + other.y) * 0.5);
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
        return this.x >= topLeft.x && this.x <= botRight.x &&
               this.y >= topLeft.y && this.y <= botRight.y;
    };

    this.Point.prototype.isOnLine = function (line) {   // fast, inaccurate check
        var topLeft = new modules.Space.Point(Math.min(line.start.x, line.end.x), Math.min(line.start.y, line.end.y));
        var botRight = new modules.Space.Point(Math.max(line.start.x, line.end.x), Math.max(line.start.y, line.end.y));

        return Math.abs((line.start.y - this.y) / (line.start.x - this.x) - line.slope()) < 0.0004 &&
               this.isInRegion(topLeft, botRight) ? this : false;
    };

    this.Point.prototype.closest = function () {
        var args = Array.prototype.slice.call(arguments);
        args = (args[0] && typeof args[0] === 'string') ? args : args[0];

        var closest = null,
            closestDist = Number.MAX_VALUE;

        var current = null,
            currentDist = 0;

        for (var i = 0; i < args.length; ++i) {
            current = args[i];
            currentDist = this.distSq(current);

            if (currentDist < closestDist) {
                closest = current;
                closestDist = currentDist;
            }
        }

        return closest;
    };


    // line class
    this.Line = function Line(start, end) {
        this.start = start;
        this.end = end;
    };

    this.Line.prototype.slope = function () {
        return (this.start.y - this.end.y) / (this.start.x - this.end.x);
    };

    this.Line.prototype.YIntersect = function () {
        return -this.slope() * this.start.x / this.start.y;
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

    this.Line.prototype.intersectsPolygon = function (poly) {
        var currentPoint = null,
            nextPoint = null,
            n = poly.points.length;

        var currentLine = new modules.Space.Line(null, null),
            iPoint = null;

        var points = [];
        for (var i = 0; i < n; ++i) {
            currentPoint = poly.points[i];
            nextPoint = poly.points[(i + 1) % n];

            currentLine.start = currentPoint;
            currentLine.end = nextPoint;

            iPoint = this.intersectsLine(currentLine);
            if (iPoint) {
                points.push(iPoint);
            }
        }

        return points;
    };

    this.Line.prototype.intersectsCircle = function (circle) {
        var ret = {
            first: false,
            second: false
        };

        var dx = this.end.x - this.start.x;
        var dy = this.end.y - this.start.y;

        var a = dx * dx + dy * dy;
        var b = 2 * (dx * (this.start.x - circle.center.x) +
                     dy * (this.start.y - circle.center.y));

        var c = circle.center.x * circle.center.x +
                circle.center.y * circle.center.y +
                this.start.x * this.start.x +
                this.start.y * this.start.y -
                2 * (circle.center.x * this.start.x + circle.center.y * this.start.y) -
                circle.radius * circle.radius;

        var bb4ac = b * b - 4 * a * c;
        if (bb4ac < 0) {
            return ret;
        } else if (bb4ac === 0) {
            var mu1 = -b / 2 * a;

            ret.first = new modules.Space.Point(this.start.x + mu1 * dx, this.start.y + mu1 * dy);
        } else {

            var bb4acSqrt = Math.sqrt(bb4ac);

            var mu1 = (-b + bb4acSqrt) / (2 * a);
            var mu2 = (-b - bb4acSqrt) / (2 * a);

            
            ret.first = new modules.Space.Point(this.start.x + mu1 * dx, this.start.y + mu1 * dy);
            ret.second = new modules.Space.Point(this.start.x + mu2 * dx, this.start.y + mu2 * dy);
        }

        if (ret.first) {
            ret.first = ret.first.isOnLine(this);
        }

        if (ret.second) {
            ret.second = ret.second.isOnLine(this);
        }

        return ret;
    };

    this.Line.prototype.closestIntersectPointWithCircles = function (circles) {
        var ret = { shortestDistance:Number.MAX_VALUE, iPoint: false };

        var from = new modules.Space.Point((this.start.x + this.end.x) * 0.5, (this.start.y + this.end.y) * 0.5);
        var current, dist, dist2;
        var args = Array.prototype.slice.call(arguments);

        for (var i = 0; i < args.length; ++i) {
            current = this.intersectsCircle(args[i]);

            if (current.first && current.second) {
                dist = from.distSq(current.first);
                dist2 = from.distSq(current.second);
                if (dist < dist2) {
                    if (dist < ret.shortestDistance) {
                        ret.shortestDistance = dist;
                        ret.iPoint = current.first;
                    }
                } else {
                    if (dist2 < ret.shortestDistance) {
                        ret.shortestDistance = dist2;
                        ret.iPoint = current.second;
                    }
                }
            } else if (current.first) {
                dist = from.distSq(current.first);
                if (dist < ret.shortestDistance) {
                    ret.shortestDistance = dist;
                    ret.iPoint = current.first;
                }
            } else if (current.second) {
                dist = from.distSq(current.second);
                if (dist < ret.shortestDistance) {
                    ret.iPoint = current.second;
                    ret.shortestDistance = dist;
                }
            }
        };

        return ret;
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

    this.Circle.prototype.intersectsLine = function (line) {
        return line.intersectsCircle(this);
    };

    // poly class
    this.Polygon = function Polygon(points) {
        this.points = [];

        if(points) {
            var n = points.length;
            for(var i = 0; i < n; ++i) {
                this.points.push(new modules.Space.Point(points[i].x, points[i].y));
            }
        };
    };

    this.Polygon.prototype.addPoint = function (point) {
        this.points.push(point);
    };

    this.Polygon.prototype.removePoint = function (point) {
        this.points.slice(this.points.indexOf(point), 1);
    };

    this.Polygon.prototype.isPointInside = function (point) {
        var current = null, 
            next = null, 
            angle = 0;

        var p1 = new modules.Space.Point(),
            p2 = new modules.Space.Point();

        var theta1 = 0,
            theta2 = 0,
            dtheta = 0;

        var n = this.points.length;
        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            next = this.points[(i + 1) % n];

            p1.x = current.x - point.x;
            p1.y = current.y - point.y;

            p2.x = next.x - point.x;
            p2.y = next.y - point.y;

            theta1 = Math.atan2(p1.y, p1.x);
            theta2 = Math.atan2(p2.y, p2.x);
            dtheta = theta2 - theta1;

            while (dtheta > Math.PI) {
                dtheta -= TwoPi;
            }

            while (dtheta < -Math.PI) {
                dtheta += TwoPi;
            }

            angle += dtheta;
        }

        if (Math.abs(angle) < Math.PI) {
            return false;
        } else {
            return true;
        }
    };

    this.Polygon.prototype.area = function () {
        var current = null,
            next = null,
            area = 0;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            next = this.points[(i + 1) % n];

            area += current.x * next.y;
            area -= current.y * next.x;
        }

        return area * 0.5;
    };

    this.Polygon.prototype.centroid = function () {
        var cx = 0,
            cy = 0;

        var factor = 0,
            area = 0,
            n = this.points.length;

        var current = null,
            next = null;

        var xy = 0,
            yx = 0;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            next = this.points[(i + 1) % n];

            factor = current.x * next.y - current.y * next.x;
            cx += (current.x + next.x) * factor;
            cy += (current.y + next.y) * factor;

            area += current.x * next.y;
            area -= current.y * next.x;
        }

        area = (area * 0.5) * 6.0;
        factor = 1 / area;

        cx *= factor;
        cy *= factor;

        return new modules.Space.Point(cx, cy);
    };

    this.Polygon.prototype.rotateAroundCentroid = function (theta) {
        var centroid = this.centroid();

        var current = null, n = this.points.length;
        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            current.rotateAround(centroid, theta);
        }
    };

    this.Polygon.prototype.intersectsPolygon = function (otherPoly) {
        var current = null,
            next = null;

        var n = this.points.length;

        var result = [];
        var line = new modules.Space.Line();

        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            next = this.points[(i + 1) % n];

            line.start = current;
            line.end = next;

            result = Array.prototype.concat(result, line.intersectsPolygon(otherPoly));
        }

        return result;
    };
};
