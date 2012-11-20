AIScript.modules.Simulations = function (aiScript, modules) {
    var Line = modules.Space.Line;
    var Point = modules.Space.Point;
    var Circle = modules.Space.Circle;

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
        if (this.circlesIntersectLine.iPoint) {
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
};