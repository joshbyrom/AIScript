AIScript.modules.Simulations = function (aiScript, modules) {
    var Line = modules.Space.Line;
    var Point = modules.Space.Point;

    this.LineTestSimulation = function () {

    };

    this.LineTestSimulation.prototype.enter = function (last) {
        this.rot = 0.0;
        
        this.radius1 = 70.0;
        this.diameter1 = this.radius1 * 2.0;
        this.line1 = new Line(new Point(400, 300), new Point());

        this.line2 = new Line(new Point(544, 134), new Point(757, 134));

        this.intersectPoint = false;
    };

    this.LineTestSimulation.prototype.exit = function (next) {

    };

    this.LineTestSimulation.prototype.update = function () {
        var onRadius1 = this.line1.start.rotatedNorm(this.rot);
        this.line1.end = onRadius1.mul(this.radius1).add(this.line1.start);

        this.line2.end.rotateAround(this.line2.start, -0.01);

        this.intersectPoint = this.line1.intersectsLine(this.line2);

        this.rot += 0.01;
    };

    this.LineTestSimulation.prototype.draw = function (processing) {
        this.drawLine(processing, this.line1);
        this.drawLine(processing, this.line2);

        processing.strokeWeight(1);
        processing.fill(0,0,0,0);
        processing.ellipse(this.line1.start.x, this.line1.start.y, this.diameter1, this.diameter1);
        processing.ellipse(this.line2.start.x, this.line2.start.y, 428, 428);

        if (this.intersectPoint) {
            processing.fill(255, 0, 0);
            processing.ellipse(this.intersectPoint.x, this.intersectPoint.y, 6, 6);
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

};