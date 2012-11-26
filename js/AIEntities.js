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

        this.rotation = new Point(1, 0);
        this.rotationTarget = new Point(1, 0);
        this.maxTurnRate = 0.2;

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
        this.acceleration.x += x;
        this.acceleration.y += y;

        var magnitude = this.acceleration.magn();
        if (this.magnitude > this.maxForce) {
            this.acceleration.x = (this.acceleration.x / magnitude) * this.maxForce;
            this.acceleration.y = (this.acceleration.y / magnitude) * this.maxForce;
            this.force = this.maxForce;
        } else {
            this.force = magnitude;
        }

        return this.maxForce - this.force; // return how much force we have left
    };

    this.Entity.prototype.zeroAngleSide = function (scale) {
        var result = new modules.Space.Point(scale || 10, 0);
        return result.add(this.position);
    };

    this.Entity.prototype.forward = function (scale) {
        var result = new modules.Space.Point(this.heading.x, this.heading.y);
        return result.mul(scale || 10);
    };

    this.Entity.prototype.mass = function () {
        return this.polygon.area();
    };

    // prepare the entity to be moved by its forces
    this.Entity.prototype.calculateVelocity = function () {
        this.velocity.x += this.acceleration.x - (this.friction * this.velocity.x);
        this.velocity.y += this.acceleration.y - (this.friction * this.velocity.y);

        this.speed = this.velocity.magn();
        if (this.speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / this.speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / this.speed) * this.maxSpeed;
            this.speed = this.maxSpeed;
        } else if (this.speed < 0.001) {
            this.velocity.zero();
            this.acceleration.zero();
        }

        this.heading.x = this.velocity.x / this.speed;
        this.heading.y = this.velocity.y / this.speed;
    };

    this.Entity.prototype.facePoint = function (point) {
        this.rotationTarget = point;
    };

    this.Entity.prototype.calculateForces = function () {
        var forceLeft = 0,
            n = this.behaviors.length,
            behavior = null;

        for (var i = 0; i < n; ++i) {
            behavior = this.behaviors[i];

            if ('update' in behavior) {
                behavior.update();
            }

            if ('linear' in behavior) {
                var linear = behavior.linear();
                forceLeft = this.applyForce(linear.x, linear.y);
            }

            if ('rotation' in behavior) {

            }
        }
    };

    this.Entity.prototype.calculateRotation = function () {

    };

    this.Entity.prototype.update = function () {
        this.calculateForces();
        this.calculateRotation();
        this.calculateVelocity();
        this.position.add(this.velocity);

        this.acceleration.zero();
    };

    this.Group = function () {
        this.entities = [];
    };

    this.Group.prototype.addEntity = function (entity) {
        this.entities.push(entity);
        entity.handleAddedToGroup(this);
    };

    this.Group.prototype.removeEntity = function (entity) {
        this.entities.slice(this.entities.indexOf(entity), 1);
        entity.handleRemovedFromGroup(this);
    };

    this.Group.prototype.update = function () {
        var entity = null,
            n = this.entities.length;

        for (var i = 0; i < n; ++i) {
            entity = this.entities[i];

            if ('update' in entity) {
                entity.update();
            }
        }
    };
};