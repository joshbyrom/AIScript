AIScript.modules.Entity = function(aiScript) {
    aiScript.Entity = function Entity(x, y, width, height) {
        this.position = new Point(x, y);
        this.velocity = new Vector();
        this.acceleration = new Vector();

        this.maxForce = 40;
        this.maxSpeed = 12;

        this.width = width;
        this.height = height;

        this.behaviors = [];
    };

    aiScript.Entity.prototype.applyForce = function (x, y) {
        this.ax += x;
        this.ay += y;

        var magnitude = Math.sqrt(this.ax * this.ax + this.ay * this.ay);
        if (this.magnitude > this.maxForce) {
            this.ax = (this.ax / magnitude) * this.maxForce;
            this.ay = (this.ay / magniture) * this.maxForce;
            this.force = this.maxForce;
        } else {
            this.force = magnitude;
        }

        return this.maxForce - this.force; // return how much force we have left
    };
};