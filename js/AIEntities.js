AIScript.modules.Entities = function (aiScript, modules) {
    var Point = modules.Space.Point;
    var Polygon = modules.Space.Polygon;

    this.Entity = function Entity(x, y, polygon) {
        this.position = new Point(x, y);
        this.velocity = new Point();
        this.acceleration = new Point();
        this.heading = new Point();

        this.maxForce = 40;
        this.maxSpeed = 12;
        this.friction = 0.1;

        this.speed = 0;

        this.polygon = polygon || new Polygon();
        this.scale = 1.0;

        this.behaviors = [];
        this.group = null;
    };

    this.Entity.prototype.handleAddedToGroup = function (group) {
        if (this.group) {
            this.handleRemovedFromGroup(this.group);
        }

        this.group = group;
    };

    this.Entity.prototype.handleRemovedFromGroup = function (group) {
        if (group !== this.group) return;

        this.group = null;
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

    // prepare the entity to be moved by its forces
    this.Entity.calculateVelocity = function () {
        velocity.x += acceleration.x - (friction * velocity.x);
        velocity.y += acceleration.y - (friction * velocity.y);

        this.speed = velocity.magnitude();
        if (this.speed > this.maxSpeed) {
            velocity.x = (velocity.x / this.speed) * this.maxSpeed;
            velocity.y = (velocity.y / this.speed) * this.maxSpeed;
            this.speed = this.maxSpeed;
        } else if (this.speed < 0.001) {
            velocity.zero();
            acceleration.zero();
        }

        heading.x = velocity.x / this.speed;
        heading.y = velocity.y / this.speed;
    };

    this.Entity.prototype.update = function () {

    };

    this.Group = function () {
        this.entities = [];
    };


};