AIScript.modules.Entities = function (aiScript, modules) {
    var Point = modules.Space.Point;
    var Smoother = modules.Space.Smoother;
    var Polygon = modules.Space.Polygon;
    var Rectangle = modules.Space.Rectangle;

    this.Entity = function Entity(x, y, polygon) {
        this.position = new Point(x, y);
        this.velocity = new Point();
        this.acceleration = new Point();
        this.heading = new Point();

        var smoothMemory = 20;

        this.headingSmoother = new Smoother(smoothMemory);
        this.velocitySmoother = new Smoother(smoothMemory);
        this.accelerationSmoother = new Smoother(smoothMemory);
        this.positionSmoother = new Smoother(smoothMemory);

        this.maxForce = 0.12;
        this.maxSpeed = 4;
        this.friction = 0.1;

        this.speed = 0;

        this.polygon = new Polygon();
        this.scale = 1.0;
        this.polygon.clonePoints(polygon, this.scale);

        this.rotation = new Point(1,0);    // rotation smoother ?
        this.rotationTarget = new Point(1,0);
        this.maxTurnRate = 0.12;

        this.behaviors = [];
        this.group = null;

        this.timeSinceLastBehavior = false;
        this.timeSinceLastRotation = false;
        this.timeToIdle = 3000;

        this.idle = false;
        this.rotationIdle = false;
        this.faceRotationOnIdle = true;
        this.idleBehavior = false;

        this.interupt = false;
    };

    this.Entity.prototype.boundingRect = function () {
        return new Rectangle()
                 .copy(this.polygon.boundingRect())
                 .scale(this.scale, this.scale)
                 .add(this.position);
    };

    this.Entity.prototype.addBehavior = function (behavior) {
        if ('enter' in behavior) {
            behavior.enter(this);
        }

        this.behaviors.push(behavior);
    };

    this.Entity.prototype.removeBehavior = function (behavior, reason) {
        var index = this.behaviors.indexOf(behavior);

        if (index < 0) return;
        else if ('exit' in behavior) {
            behavior.exit(this, reason || 'not provided');
        }

        this.behaviors.splice(index, 1);
    };

    this.Entity.prototype.removeBehaviors = function (behaviors, reason) {
        var n = behaviors.length,
            _reason = reason || 'not provided';
        for (var i = 0; i < n; ++i) {
            this.removeBehavior(behaviors[i], _reason);
        }
    };

    this.Entity.prototype.clearBehaviors = function (reason) {
        var n = this.behaviors.length,
            current = null;

        for (var i = 0; i < n; ++i) {
            current = this.behaviors[i];
            if ('exit' in current) {
                current.exit(this, reason);
            } 
        }

        this.behaviors.length = 0;
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
        if (magnitude > this.maxForce) {
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

    this.Entity.prototype.forward = function () {
        return this.headingSmoother.average();
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

        if (this.speed !== 0) {
            this.heading.x = this.velocity.x / this.speed;
            this.heading.y = this.velocity.y / this.speed;
        }

        // update smoothers for averages (typically for behaviors)
        this.headingSmoother.add(this.heading.clone());
        this.velocitySmoother.add(this.velocity.clone());
        this.accelerationSmoother.add(this.acceleration.clone());
    };

    this.Entity.prototype.facePoint = function (point) {
        this.rotationTarget = point;
        this.timeSinceLastRotation = aiScript.pInst.millis();
        this.rotationIdle = false;
    };

    this.Entity.prototype.handleInterupt = function () {
        if (this.interupt) {
            if (this.handleBehavior(this.interupt)) {
                this.interupting = true;
            } else {
                this.interupting = false;
                this.interupt = false;
            }
        } else {
            this.interupting = false;
        }

        return this.interupting;
    };

    this.Entity.prototype.handleIdle = function (now) {
        if (this.timeSinceLastBehavior === false) {
            this.timeSinceLastBehavior = now;
        }

        if (this.timeSinceLastRotation === false) {
            this.timeSinceLastRotation = now;
        }

        if (this.behaviors.length !== 0) {
            this.timeSinceLastBehavior = now;
            this.idle = false;
        } else if (this.idleBehavior && now - this.timeSinceLastBehavior >= this.timeToIdle) {
            this.handleBehavior(this.idleBehavior);
            this.idle = true;
        }

        if (now - this.timeSinceLastRotation > this.timeToIdle) {
            if (this.faceRotationOnIdle) {
                this.rotationTarget = this.forward().add(this.position);
            }
            this.rotationIdle = true;
        };
    };

    this.Entity.prototype.calculateForces = function () {
        if (this.handleInterupt()) {
            return;
        }

        var now = aiScript.pInst.millis(),
            n = this.behaviors.length,
            behavior = null;

        var toRemove = [];
        for (var i = 0; i < n; ++i) {
            behavior = this.behaviors[i];

            if (!this.handleBehavior(behavior)) {
                toRemove.push(behavior);
            }
        }

        this.removeBehaviors(toRemove, 'finished');
        this.handleIdle(now);
    };

    this.Entity.prototype.handleBehavior = function (behavior) {
        if ('finished' in behavior) {
            if (behavior.finished()) {
                return false;
            }
        }

        if ('update' in behavior) {
            behavior.update();
        }

        if ('linear' in behavior) {
            var linear = behavior.linear();
            this.applyForce(linear.x, linear.y);
        }

        if ('rotation' in behavior) {
            // average it here TODO:: then use FACE POINT method
        }

        return true;
    };

    this.Entity.prototype.calculateRotation = function () {
        if (this.rotationTarget.almostEquals(this.position) ||
            this.rotation.almostEquals(this.rotationTarget)) {
            return;
        }

        var toTarget = this.rotationTarget.clone().sub(this.position).norm();

        var dot = this.rotation.dot(toTarget);

        if (dot > 1) {
            dot = 1;
        } else if (dot < -1) {
            dot = -1;
        }

        var angle = Math.acos(dot);
        if (angle < 0.0001) {
            return;
        } else if (angle > this.maxTurnRate) {
            angle = this.maxTurnRate;
        }

        var amount = angle * this.rotation.sign(toTarget);

        this.rotation.rotate(amount).norm();
        this.polygon.rotateAroundCentroid(amount);
    };

    this.Entity.prototype.update = function () {
        this.calculateForces();
        this.calculateRotation();
        this.calculateVelocity();

        this.position.add(this.velocity);
        this.positionSmoother.add(this.position.clone());

        this.acceleration.zero();
    };

    this.Entity.prototype.propertyAsFunction = function (property) {
        return (function () {
            return function () {
                return this[property];
            }.bind(this);
        }).call(this);
    };

    this.Entity.prototype.isPointInside = function (point) {
        var global = new Polygon().clonePoints(this.polygon, this.scale).translate(this.position);
        return global.isPointInside(point);
    };

    this.Entity.prototype.center = function () {
        var global = new Polygon().clonePoints(this.polygon, this.scale).translate(this.position);
        return global.centroid();
    }

    // Groups

    this.Group = function () {
        this.entities = [];
        this.entityDirty = false;

        this.rect = new Rectangle();
        this.mouseIn = false;

        this.mouseInElements = [];
        this.focused = false;

        this.lastKnownMouseX = 0;
        this.lastKnownMouseY = 0;
    };

    this.Group.prototype.giveFocus = function (entity) {
        this.loseFocus();

        this.focused = entity;
        if (this.focused.gainFocus) {
            this.focused.gainFocus();
        }
    };

    this.Group.prototype.loseFocus = function () {
        if (this.focused && this.focused.loseFocus) {
            this.focused.loseFocus();
        }

        this.focused = false;
    };

    this.Group.prototype.addEntity = function (entity) {
        this.entities.push(entity);
        entity.handleAddedToGroup(this);
        this.entityDirty = true;

        entity.mouseIn = false;
    };

    this.Group.prototype.removeEntity = function (entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
        entity.handleRemovedFromGroup(this);
        this.entityDirty = true;

        delete entity.mouseIn;
    };

    this.Group.prototype.update = function () {
        var entity = null, p = aiScript.pInst;
            n = this.entities.length;

        var rects = [];
        for (var i = 0; i < n; ++i) {
            entity = this.entities[i];

            if ('update' in entity) {
                entity.update();
            }

            if ('draw' in entity) {
                entity.draw(p);
            }

            rects.push(entity.boundingRect());
        }

        this.rect.encompass(rects);
        this.handleMouse(this.lastKnownMouseX, this.lastKnownMouseY);

        if (this.entityDirty) {
            this.entityDirty = false;
        }
    };

    this.Group.prototype.boundingRect = function () {
        return this.rect;
    };

    this.Group.prototype.handleMousePressed = function (key, x, y, special) {
        if (this.mouseIn) {
            var n = this.mouseInElements.length,
                current = null;
                bubble = false;

            for (var i = 0; i < n; ++i) {
                current = this.mouseInElements[i];
                if (current.handleClicked) {
                    bubble = current.handleClicked(key, x, y, special) || true;

                    if (!bubble) {
                        break;
                    }
                }
            }

            if (key === 37) {
                if (current) {
                    this.giveFocus(current);
                }
            }

            return false;
        };

        var n = this.entities.length,
            current = null;

        for (var i = 0; i < n; ++i) {
            current = this.entities[i];

            if (current.handleMousePressed) {
                current.handleMousePressed(key, x, y, special);
            }
        }

        return true;
    };

    this.Group.prototype.getElementsWithPoint = function (x, y) {
        var result = [];

        var n = this.entities.length,
            point = new Point(x,y);

        var current = null;
        for (var i = 0; i < n; ++i) {
            current = this.entities[i];

            if (current.boundingRect().isPointInside(x, y)) {
                if (current.isPointInside(point)) {
                    result.push(current);
                }
            }
        };

        return result;
    };

    this.Group.prototype.handleMouseMoved = function (mouseX, mouseY) {
        this.lastKnownMouseX = mouseX;
        this.lastKnownMouseY = mouseY;
    };

    this.Group.prototype.handleMouse = function (mouseX, mouseY) {
        if (this.rect.isPointInside(mouseX, mouseY)) {
            if (!this.mouseIn) {
                this.handleMouseEnter(mouseX, mouseY);
            }

            var nextElements = this.getElementsWithPoint(mouseX, mouseY),
                n = this.mouseInElements.length,
                current = null;

            for (var i = 0; i < n; ++i) {
                current = this.mouseInElements[i];
                
                if (!(current in nextElements)) {
                    if (current.mouseIn) {
                        if (current.handleMouseExit) {
                            current.handleMouseExit();
                        }
                        current.mouseIn = false;
                    }
                }
            }

            n = nextElements.length,
            current = null,
            i = 0;

            for (; i < n; ++i) {
                current = nextElements[i];
                if (!(current in this.mouseInElements)) {
                    if (!current.mouseIn) {
                        if (current.handleMouseEnter) {
                            current.handleMouseEnter();
                        }
                        current.mouseIn = true;
                    }
                }
            }

            this.mouseInElements.length = 0;
            this.mouseInElements = nextElements;
        } else {
            if (this.mouseIn) {
                this.handleMouseExit(mouseX, mouseY);
            }
        }

        // loop through entities and let them handle a mouse move
        // even if the mouse is not within the group's region
        var n = this.entities.length,
            current = null,
            i = 0;

        for (; i < n; ++i) {
            current = this.entities[i];

            if (current.handleMouseMoved) {
                // assert(this.mouseIn) is not always true
                current.handleMouseMoved(mouseX, mouseY);
            }

            if (!this.mouseIn && current.mouseIn) {
                if (current.handleMouseExit) {
                    current.handleMouseExit();
                }
                current.mouseIn = false;
            }
        }
    };

    this.Group.prototype.handleMouseEnter = function (mouseX, mouseY) {
        if (this.onMouseEnter) {
            this.onMouseEnter(mouseX, mouseY);
        };

        this.mouseIn = true;
    };

    this.Group.prototype.handleMouseExit = function (mouseX, mouseY) {
        if (this.onMouseExit) {
            this.onMouseExit(mouseX, mouseY);
        };
        this.mouseIn = false;
    };

};