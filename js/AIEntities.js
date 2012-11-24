AIScript.modules.Entities = function (aiScript, modules) {
    var Point = modules.Space.Point;
    var Polygon = modules.Space.Polygon;

    this.Entity = function Entity(x, y, polygon) {
        this.position = new Point(x, y);
        this.velocity = new Point();
        this.acceleration = new Point();

        this.maxForce = 40;
        this.maxSpeed = 12;
        this.friction = 1;

        this.polygon = polygon || new Polygon();
        this.scale = 1.0;

        this.behaviors = [];
    };

    this.Entity.prototype.applyForce = function (x, y) {
        this.ax += x;
        this.ay += y;

        var magnitude = Math.sqrt(this.ax * this.ax + this.ay * this.ay);
        if (this.magnitude > this.maxForce) {
            this.ax = (this.ax / magnitude) * this.maxForce;
            this.ay = (this.ay / magnitude) * this.maxForce;
            this.force = this.maxForce;
        } else {
            this.force = magnitude;
        }

        return this.maxForce - this.force; // return how much force we have left
    };

    this.Entity.mass = function () {
        return this.polygon.area();
    };

    this.Entity.calculateVelocity = function () {

    };

    this.Entity.prototype.update = function () {

    };

    this.Group = function () {
        this.entities = [];
    };


};