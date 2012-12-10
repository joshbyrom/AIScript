AIScript.modules.Space = function (aiScript, modules) {
    var TwoPi = Math.PI * 2.0;

    this.Point = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    this.Point.prototype.clone = function () {
        return new modules.Space.Point(this.x, this.y);
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

        if (magn === 0) {
            magn = 0.000001;
        }

        this.x /= magn;
        this.y /= magn;
        return this;
    };

    this.Point.prototype.almostEquals = function (other) {
        var xdiff = Math.abs(other.x - this.x);
        var ydiff = Math.abs(other.y - this.y);

        return xdiff < 0.001 && ydiff < 0.001;
    };

    this.Point.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
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

    this.Point.prototype.negate = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    this.Point.prototype.angleTo = function (xy) {
        var xdist = xy.x - this.x;
        var ydist = xy.y - this.y;
        var result = Math.atan2(ydist, xdist);
        return result < 0 ? result + TwoPi : result;
    };

    this.Point.prototype.sign = function (other) {
        var p2 = this.clone().negate();
        var x1 = this.x - p2.x,
            y1 = this.y - p2.y,
            x2 = other.x - p2.x,
            y2 = other.y - p2.y;

        if ((x1 * y2 - y1 * x2) >= 0) {
            return 1;
        } else {
            return -1;
        }
    };

    this.Point.prototype.rotate = function (theta) {
        var _theta = theta % TwoPi;

        var cos = Math.cos(_theta);
        var sin = Math.sin(_theta);

        var oldX = this.x;

        this.x = this.x * cos - sin * this.y;
        this.y = oldX * sin + cos * this.y;
        return this;
    };

    this.Point.prototype.rotateAround = function (center, theta) {
        var originX = this.x - center.x;
        var originY = this.y - center.y;

        var _theta = theta % TwoPi;
        var cos = Math.cos(_theta);
        var sin = Math.sin(_theta);

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
        ret.y = this.x * sin + cos * this.y;
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

    // smoother for averages
    this.Smoother = function Smoother(max) {
        this.max = max;
        this.elems = [];
    };

    this.Smoother.prototype.add = function (toAdd) {
        this.elems.push(toAdd);
        if (this.elems.length > this.max) {
            this.elems.splice(0, 1);
        };
    };

    this.Smoother.prototype.remove = function (toRemove) {
        this.elems.splice(this.elems.indexOf(toRemove), 1);
    };

    this.Smoother.prototype.average = function () {
        var accum = new modules.Space.Point(),
            n = this.elems.length;

        if (n === 0) {
            return 0;
        }

        for (var i = 0; i < n; ++i) {
            accum.add(this.elems[i]);
        }

        accum.x /= n;
        accum.y /= n;

        return accum;
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

    // rect class
    this.Rectangle = function Rectangle(left, right, top, bottom) {
        this.left = left || 0;
        this.right = right || 0;
        this.top = top || 0;
        this.bottom = bottom || 0;
    };

    this.Rectangle.prototype.copy = function (rect) {
        var r = new modules.Space.Rectangle();

        r.left = rect.left;
        r.right = rect.right;
        r.top = rect.top;
        r.bottom = rect.bottom;

        return r;
    };

    this.Rectangle.prototype.width = function () {
        return this.right - this.left;
    };

    this.Rectangle.prototype.height = function () {
        return this.bottom - this.top;
    };

    this.Rectangle.prototype.add = function (point) {
        this.left += point.x;
        this.right += point.x;

        this.top += point.y;
        this.bottom += point.y;
        return this;
    };

    this.Rectangle.prototype.scale = function (xScale, yScale) {
        this.left *= xScale || 1;
        this.right *= xScale || 1;

        this.top *= yScale || 1;
        this.bottom *= yScale || 1;
        return this;
    };

    this.Rectangle.prototype.encompass = function () {
        var rects = Array.prototype.slice.call(arguments);


        if (Array.isArray(rects[0])) {
            rects = rects[0];
        }

        var n = rects.length;

        var first = n > 0 ? rects[0] : false;
        var current = null,
            minX = first ? first.left : 0,
            maxX = first ? first.right : 0,
            minY = first ? first.top : 0,
            maxY = first ? first.bottom : 0;

        for (var i = 1; i < n; ++i) {
            current = rects[i];

            if (current.left < minX) {
                minX = current.left;
            }

            if (current.right > maxX) {
                maxX = current.right;
            }

            if (current.top < minY) {
                minY = current.top;
            }

            if (current.bottom > maxY) {
                maxY = current.bottom;
            }

        }

        this.left = minX;
        this.right = maxX;
        this.top = minY;
        this.bottom = maxY;

    };

    this.Rectangle.prototype.update = function () {
        if (this.left > this.right) {
            var tmp = this.left;
            this.left = this.right;
            this.right = this.tmp;
        }

        if (this.top > this.bottom) {
            var tmp = this.top;
            this.top = this.bottom;
            this.bottom = this.tmp;
        }
    };

    this.Rectangle.prototype.isPointInside = function (x, y) {
        return x >= this.left && x <= this.right &&
               y >= this.top && y <= this.bottom;
    };

    // right now this returns true only if all four corners are inside the rect
    this.Rectangle.prototype.isRectInside = function (rect) {
        return this.isPointInside(rect.left, rect.top) &&
               this.isPointInside(rect.right, rect.bottom) &&
               this.isPointInside(rect.right, rect.top) &&
               this.isPointInside(rect.left, rect.bottom);
    };

    // poly class
    this.Polygon = function Polygon(points) {
        this.points = [];
        this._copy = [];

        this._areaDirty = true;
        this._area = 0;

        this._centroid = null;
        this._centroidDirty = true;

        if(points) {
            var n = points.length, point = null;
            for (var i = 0; i < n; ++i) {
                point = new modules.Space.Point(points[i].x, points[i].y);
                this.points.push(point);
                this._copy.push(point.clone());
            }
        };
    };

    this.Polygon.prototype.reset = function (polygon) {
        var n = this.points.length;

        for (var i = 0; i < n; ++i) {
            this.points[i].x = this._copy[i].x;
            this.points[i].y = this._copy[i].y;
        }
    };

    this.Polygon.prototype.clonePoints = function (polygon, scale) {
        if (polygon === null || polygon === undefined) return;

        this.clearPoints();

        var points = polygon.points,
            n = points.length,
            point = null;

        for (var i = 0; i < n; ++i) {
            point = points[i];
            this.addPoint(point.clone());
        }

        if (scale && scale !== 1) {
            this.scale(scale);
        }

        return this;
    };

    this.Polygon.prototype.addPoint = function (point) {
        if (arguments.length === 2) {
            point = new modules.Space.Point(arguments[0], arguments[1]);
        }

        this.points.push(point);
        this._copy.push(point.clone());
        this._areaDirty = true;
        this._centroidDirty = true;

        return this;
    };

    this.Polygon.prototype.removePoint = function (point) {
        var index = this.points.indexOf(point);

        this.points.splice(index, 1);
        this._copy.splice(index, 1);

        this._areaDirty = true;
        this._centroidDirty = true;

        return this;
    };

    this.Polygon.prototype.clearPoints = function () {
        this.points.length = 0;
        this._copy.length = 0;

        return this;
    };

    this.Polygon.prototype.scale = function (xScale, yScale) {
        if (xScale == 1 && yScale == 1) return;

        var guardedXScale = xScale ? Math.abs(xScale) : 1,
            guardedYScale = yScale ? Math.abs(yScale) : xScale ? xScale : 1;

        var n = this.points.length, point = null;

        this.reset();

        for (var i = 0; i < n; ++i) {
            point = this.points[i];

            point.x *= guardedXScale;
            point.y *= guardedYScale;
        }

        return this;
    };

    this.Polygon.prototype.translate = function (point) {
        var n = this.points.length,
            current = null;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];

            current.x += point.x;
            current.y += point.y;
        }
        
        return this;
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
        if (!this._areaDirty) return this._area;

        var n = this.points.length;

        var current = null,
            next = null,
            area = 0;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            next = this.points[(i + 1) % n];

            area += current.x * next.y;
            area -= current.y * next.x;
        }

        this._area = area * 0.5;
        this._areaDirty = false;

        return this._area;
    };

    this.Polygon.prototype.centroid = function () {
        if (!this._centroidDirty) return this._centroid;

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

        this._centroid = new modules.Space.Point(cx, cy);
        this._centroidDirty = false;

        return this._centroid;
    };

    this.Polygon.prototype.rotateAround = function (around, theta) {
        var current = null, n = this.points.length;
        for (var i = 0; i < n; ++i) {
            current = this.points[i];
            current.rotateAround(around, theta);
        }

        this._centroidDirty = true;

        return this;
    };

    this.Polygon.prototype.rotateAroundCentroid = function (theta) {
        var centroid = this.centroid();
        this.rotateAround(centroid, theta);
        this._centroidDirty = false; // rotated in place

        return this;
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

    this.Polygon.prototype.boundingWidth = function (scale) {
        var n = this.points.length;

        if(n === 0) return 0;

        var current = null,
            min = Number.MAX_VALUE,
            max = Number.MIN_VALUE;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];

            if (current.x < min) min = current.x;
            else if (current.x > max) max = current.x;
        }

        return (max - min) * scale;
    };

    this.Polygon.prototype.boundingHeight = function (scale) {
        var n = this.points.length;

        if (n === 0) return 0;

        var current = null,
            min = Number.MAX_VALUE,
            max = Number.MIN_VALUE;

        for (var i = 0; i < n; ++i) {
            current = this.points[i];

            if (current.y < min) {
                min = current.y;
            } else if (current.y > max) {
                max = current.y;
            }
        }

        return (max - min) * scale;
    };

    this.Polygon.prototype.boundingRect = function (padding) {
        var n = this.points.length;

        var first = n > 0 ? this.points[0] : false;
        var current = null,
            minX = first ? first.x : 0,
            maxX = first ? first.x : 0,
            minY = first ? first.y : 0,
            maxY = first ? first.y : 0;

        for (var i = 1; i < n; ++i) {
            current = this.points[i];

            if (current.x < minX) {
                minX = current.x;
            } else if (current.x > maxX) {
                maxX = current.x;
            }

            if (current.y < minY) {
                minY = current.y;
            } else if (current.y > maxY) {
                maxY = current.y;
            }

        }

        return new modules.Space.Rectangle(minX - (padding || 0),
                                           maxX + (padding || 0),
                                           minY - (padding || 0),
                                           maxY + (padding || 0));
    };

    // partitioning and grids
    this.Grid = function (x, y, width, height) {
        this.position = new modules.Space.Point(x, y);

        this.width = width;
        this.height = height;

        this.numberOfColumns = 1;
        this.numberOfRows = 1;

        this.groups = [];
        this.backup = [];

        this.init();
    };

    this.Grid.prototype._toIndex = function (column, row) {
        return column * this.numberOfRows - row;
    };

    this.Grid.prototype._atIndex = function (column, row) {
        var index = this.groups.toIndex(column, row);
        return this.groups[index];
    }

    this.Grid.prototype.init = function () {
        if (this.width < 0) {
            this.width = 0;
        }

        if (this.height < 0) {
            this.height = 0;
        }

        this.columnWidth = this.width / Math.max(this.numberOfColumns, 0.0001);
        this.rowHeight = this.height / Math.max(this.numberOfRows, 0.00001);

        this.backup();
        this.groups.length = 0;

        var index, group = 0;
        for (var i = 0; i < this.numberOfColumns; ++i) {
            for (var k = 0; k < this.numberOfRows; ++k) {
                index = this._toIndex(i, k);
                group = this.indexInBackup(i, k);

                if (!group) {
                    group = new Group();
                }

                this.groups[index] = group;
            }
        }

        this.backup.forEach(function (group) {
            group.entities.forEach(function (entity) {
                this.handleObject(entity);
            }.bind(this));
        }.bind(this));
    };

    this.Grid.prototype.update = function (now) {
        this.groups.forEach(function (entry) {
            entry.update();
        });


    };

    this.Grid.prototype.handleObject = function (entity) {
        var translation = this.coordsToIndex(entity.position.x, entity.position.y);
        var group = this._atIndex(translation.column, translation.row);

        if (group.entities.indexOf(entity) < 0) {
            group.addEntity(entity);
        }
    };

    this.Grid.prototype.backup = function () {
        var n = this.groups.length;

        if (n > this.backup.length) {
            this.backup.length = n;
        };

        for (var i = 0; i < n; ++i) {
            this.backup[i] = this.groups[i];
        }
    };

    this.Grid.prototype._indexInBackup = function (index) {
        if (index in this.backup) {
            return this.backup[index];
        } else {
            return false;
        }
    };

    this.Grid.prototype.coordsToIndex = function (x, y) {
        var result = {
            column: x / Math.min(this.columnWidth, 0.0001),
            row: y / Math.min(this.rowHeight, 0.0001)
        };

        return result;
    };

    this.Grid.prototype.get = function (column, row) {
        var gColumn = column % this.numberOfColumns;
        var gRow = row % this.numberOfRows;

        gColumn += gColumn < 0 ? this.numberOfColumns : 0;
        gRow += gRow < 0 ? this.numberOfRows : 0;

        var index = this._toIndex(gColumn, gRow);
        return this.groups[index];
    };
};
