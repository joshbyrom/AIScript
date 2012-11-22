AIScript.modules.Simulations = function (aiScript, modules) {
    var Line = modules.Space.Line;
    var Point = modules.Space.Point;
    var Circle = modules.Space.Circle;
    var Polygon = modules.Space.Polygon;

    this.LineTestSimulation = function () {

    };

    this.LineTestSimulation.prototype.enter = function (last) {
        this.line1 = new Line(new Point(400, 300), new Point(470, 300));
        this.line2 = new Line(new Point(544, 134), new Point(757, 134));
        this.line3 = new Line(new Point(200, 245), new Point(400, 245));

        this.circle1 = new Circle(this.line1.start, 70);
        this.circle2 = new Circle(this.line2.start, 213);
        this.circle3 = new Circle(new Point(225, 75), 64);

        this.intersectPoint = false;
        this.circleIntersectPoints = false;
        this.circleIntersectsLine = false;
    };

    this.LineTestSimulation.prototype.handleKeyReleased = function (code) {
        if (code === 32) {
            aiScript.paused = !aiScript.paused;
        }
    };

    this.LineTestSimulation.prototype.exit = function (next) {

    };

    this.LineTestSimulation.prototype.update = function () {
        var angle1 = this.line1.angle();
        var angle2 = this.line2.angle();

        this.line1.end.rotateAround(this.line1.start, angle1 > 4.09 || (angle1 >= 0 && angle1 <= 0.50) ? 0.001 : 0.03);
        this.line2.end.rotateAround(this.line2.start, angle2 < 2.6 && angle2 >= 1.97 ? -0.001 : -0.03);

        this.topLeft = new modules.Space.Point(Math.min(this.line3.start.x, this.line3.end.x), Math.min(this.line3.start.y, this.line3.end.y));
        this.botRight = new modules.Space.Point(Math.max(this.line3.start.x, this.line3.end.x), Math.max(this.line3.start.y, this.line3.end.y));

        this.intersectPoint = this.line1.intersectsLine(this.line2);
        this.circleIntersectPoints = this.circle1.intersectsCircle(this.circle2);
        this.circlesIntersectLine = this.line3.closestIntersectPointWithCircles(this.circle1, this.circle2, this.circle3);
        if (!this.circlesIntersectLine.iPoint) {
            this.line3.end.rotateAround(this.line3.start, 0.05);
        } else {
            this.line3.end.rotateAround(this.line3.start, 0.005);
        }
    };

    this.LineTestSimulation.prototype.draw = function (processing) {
        this.drawLine(processing, this.line1);
        this.drawLine(processing, this.line2);
        if (this.circlesIntersectLine && this.circlesIntersectLine.iPoint) {
            processing.ellipse(this.circlesIntersectLine.iPoint.x, this.circlesIntersectLine.iPoint.y, 6, 6);
            processing.stroke(255, 0, 0);
            processing.strokeWeight(2);
            processing.line(this.line3.start.x,
                            this.line3.start.y,
                            this.circlesIntersectLine.iPoint.x,
                            this.circlesIntersectLine.iPoint.y);
        } else {
            this.drawLine(processing, this.line3);
        }

        processing.stroke(255, 255, 255);
        this.drawCircle(processing, this.circle1);
        this.drawCircle(processing, this.circle2);
        this.drawCircle(processing, this.circle3);

        if (this.intersectPoint) {
            processing.fill(255, 0, 0);
            processing.ellipse(this.intersectPoint.x, this.intersectPoint.y, 6, 6);
        }

        if (this.circleIntersectPoints) {
            processing.fill(255, 0, 0);
            processing.ellipse(this.circleIntersectPoints.first.x, this.circleIntersectPoints.first.y, 6, 6);
            processing.ellipse(this.circleIntersectPoints.second.x, this.circleIntersectPoints.second.y, 6, 6);
        }
    };

    this.LineTestSimulation.prototype.drawLine = function (processing, line) {
        processing.stroke(255, 255, 255);
        processing.strokeWeight(2);
        processing.line(line.start.x,
                        line.start.y,
                        line.end.x,
                        line.end.y);
    };

    this.LineTestSimulation.prototype.drawCircle = function (processing, circle) {
        var diameter = circle.radius * 2;

        processing.strokeWeight(1);
        processing.fill(0, 0, 0, 0);
        processing.ellipse(circle.center.x, circle.center.y, diameter, diameter);
    };

    //------------------------

    this.PolygonSimulation = function () {

    };

    this.PolygonSimulation.prototype.enter = function (last) {
        this.line = new Line(new Point(150, 10), new Point(320, 10));
        this.iPoints = [];

        this.poly1 = new Polygon();
        this.poly1.addPoint(new Point(220, 220));
        this.poly1.addPoint(new Point(240, 220));
        this.poly1.addPoint(new Point(240, 240));
        this.poly1.addPoint(new Point(260, 240));
        this.poly1.addPoint(new Point(260, 260));
        this.poly1.addPoint(new Point(220, 260));

        this.poly2 = new Polygon();
        this.poly2.addPoint(new Point(140, 120));
        this.poly2.addPoint(new Point(160, 120));
        this.poly2.addPoint(new Point(180, 140));
        this.poly2.addPoint(new Point(140, 160));

    };

    this.PolygonSimulation.prototype.exit = function (next) {

    };

    this.PolygonSimulation.prototype.update = function () {
        var y = (this.line.start.y + 1) % aiScript.height();
        this.line.start.y = y;
        this.line.end.y = y;

        this.iPoints = [];
        this.iPoints = this.line.intersectsPolygon(this.poly1);
        this.iPoints = Array.prototype.concat(this.iPoints, this.line.intersectsPolygon(this.poly2));
    };

    this.PolygonSimulation.prototype.draw = function (processing) {
        processing.fill(123, 145, 213);
        processing.stroke(255, 255, 255);
        this.drawPolygon(processing, this.poly1);
        this.drawPolygon(processing, this.poly2);

        processing.strokeWeight(2);
        if (this.iPoints.length === 0) {
            processing.line(this.line.start.x, this.line.start.y, this.line.end.x, this.line.end.y);
        } else {
            var iPoint = this.line.start.closest(this.iPoints);
            if (!this.poly2.isPointInside(this.line.start)) {
                processing.line(this.line.start.x, this.line.start.y, iPoint.x, iPoint.y);
            }

            iPoint = this.line.end.closest(this.iPoints);
            processing.line(iPoint.x, iPoint.y, this.line.end.x, this.line.end.y);
        }

        processing.strokeWeight(1);
        processing.fill(255, 0, 0);
        for (var i = 0; i < this.iPoints.length; ++i) {
            processing.ellipse(this.iPoints[i].x,
                               this.iPoints[i].y,
                               6, 6);
        }
    };

    this.PolygonSimulation.prototype.drawPolygon = function (processing, polygon) {
        var n = polygon.points.length,
            current = null;

        processing.beginShape();
        for (var i = 0; i < n; ++i) {
            current = polygon.points[i];
            processing.vertex(current.x, current.y);
        }

        processing.endShape(processing.CLOSE);
    };
};