AIScript.modules.Simulations = function (aiScript, modules) {
    var Line = modules.Space.Line;
    var Point = modules.Space.Point;
    var Circle = modules.Space.Circle;
    var Rectangle = modules.Space.Rectangle;
    var Polygon = modules.Space.Polygon;
    var Entity = modules.Entities.Entity;
    var Group = modules.Entities.Group;
    var Seek = modules.Behaviors.Seek;
    var Arrive = modules.Behaviors.Arrive;

    var Button = modules.GUI.Button;

    var LSystem = modules.DevelopmentalSystems.LSystem;
    var Alphabet = modules.DevelopmentalSystems.Alphabet;
    var Axiom = modules.DevelopmentalSystems.Axiom;
    var Rule = modules.DevelopmentalSystems.ProductionRule;
    var Turtle = modules.DevelopmentalSystems.Turtle;

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

        this.poly3 = new Polygon();
        this.poly3.addPoint(new Point(220, 320));
        this.poly3.addPoint(new Point(240, 340));
        this.poly3.addPoint(new Point(260, 340));
        this.poly3.addPoint(new Point(240, 360));
        this.poly3.addPoint(new Point(240, 400));
        this.poly3.addPoint(new Point(220, 360));
        this.poly3.addPoint(new Point(200, 400));
        this.poly3.addPoint(new Point(200, 360));
        this.poly3.addPoint(new Point(180, 340));
        this.poly3.addPoint(new Point(200, 340));

        this.poly4 = new Polygon();
        this.poly4.addPoint(new Point(420, 220));
        this.poly4.addPoint(new Point(440, 220));
        this.poly4.addPoint(new Point(440, 240));
        this.poly4.addPoint(new Point(460, 240));
        this.poly4.addPoint(new Point(460, 260));
        this.poly4.addPoint(new Point(420, 260));

        this.poly5 = new Polygon();
        this.poly5.addPoint(new Point(445, 250));
        this.poly5.addPoint(new Point(465, 250));
        this.poly5.area();
        this.poly5.addPoint(new Point(465, 270));
        this.poly5.area();
        this.poly5.addPoint(new Point(485, 270));
        this.poly5.addPoint(new Point(485, 290));
        this.poly5.addPoint(new Point(445, 290));
        this.poly5.area();
        this.poly5.area();

        this.iPoints2 = [];

        this.rect = new Rectangle();
    };

    this.PolygonSimulation.prototype.exit = function (next) {

    };

    this.PolygonSimulation.prototype.update = function () {
        var y = (this.line.start.y + 1) % aiScript.height();
        this.line.start.y = y;
        this.line.end.y = y;

        this.poly1.rotateAroundCentroid(0.01);
        this.poly3.rotateAroundCentroid(-0.04);

        this.iPoints = [];
        this.iPoints = this.line.intersectsPolygon(this.poly1);
        this.iPoints = Array.prototype.concat(this.iPoints, this.line.intersectsPolygon(this.poly2));
        this.iPoints = Array.prototype.concat(this.iPoints, this.line.intersectsPolygon(this.poly3));

        this.iPoints2 = this.poly4.intersectsPolygon(this.poly5);

        this.rect.encompass(this.poly1.boundingRect(), this.poly2.boundingRect(), this.poly3.boundingRect());
    };

    this.PolygonSimulation.prototype.draw = function (processing) {
        this.drawPolygon(processing, this.poly1, true);
        this.drawPolygon(processing, this.poly2, true);
        this.drawPolygon(processing, this.poly3, true);
        this.drawPolygon(processing, this.poly4);
        this.drawPolygon(processing, this.poly5);

        processing.stroke(255, 255, 255);
        processing.fill(0, 0, 0, 0);
        processing.rect(this.rect.left, this.rect.top, this.rect.width(), this.rect.height());

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

            
            if (this.iPoints.length >= 2) {
                var n = this.iPoints.length - 1;
                for (var i = 1; i < n; ++i) {
                    var c = this.iPoints[i];
                    var n = this.iPoints[(i + 1) % n];

                    processing.line(c.x, c.y, n.x, n.y);
                }
            }
        }

        processing.strokeWeight(1);
        processing.fill(255, 0, 0);
        for (var i = 0; i < this.iPoints.length; ++i) {
            processing.ellipse(this.iPoints[i].x,
                               this.iPoints[i].y,
                               6, 6);
        }

        for (var i = 0; i < this.iPoints2.length; ++i) {
            processing.ellipse(this.iPoints2[i].x,
                               this.iPoints2[i].y,
                               6, 6);
        }
    };

    this.PolygonSimulation.prototype.drawPolygon = function (processing, polygon, drawBoundingRect) {
        var n = polygon.points.length,
            current = null;

        processing.fill(123, 145, 213);
        processing.stroke(255, 255, 255);
        processing.beginShape();
        for (var i = 0; i < n; ++i) {
            current = polygon.points[i];
            processing.vertex(current.x, current.y);
        }

        processing.endShape(processing.CLOSE);

        var centroid = polygon.centroid();
        var rect = polygon.boundingRect();

        processing.ellipse(centroid.x, centroid.y, 3, 3);
        
        if (drawBoundingRect) {
            processing.fill(0, 0, 0, 0);
            processing.rect(rect.left, rect.top, rect.width(), rect.height());
        }
    };

    // entity unit test
    this.EntitySimulation = function () {

    };

    this.EntitySimulation.prototype.enter = function (last) {
        this.numberToSpawn = 8;

        this.group = new Group();
        

        var poly2 = new Polygon();
        poly2.addPoint(1, 1);
        poly2.addPoint(1, -1);
        poly2.addPoint(-1, -1);
        poly2.addPoint(-1, 1);

        this.path = new Polygon();
        this.path.addPoint(255, 41);
        this.path.addPoint(408, 41);
        this.path.addPoint(408, 152);
        this.path.addPoint(506, 217);
        this.path.addPoint(506, 327);
        this.path.addPoint(130, 327);
        this.path.addPoint(130, 230);
        this.path.addPoint(160, 150);
        this.path.addPoint(255, 150);

        this.count = 0;
        this.handle = function () {
            this.pathfollower = new Entity(10, 30, poly2);
            this.pathfollower.scale = 5;
            this.pathfollower.applyForce(40, 40);
            this.pathfollower.idleBehavior = (new modules.Behaviors.PathFollowing(this.path, 0,
                this.pathfollower.propertyAsFunction('position'),
                this.pathfollower.propertyAsFunction('maxForce'), -1)
            );
            this.group.addEntity(this.pathfollower);
            this.count += 1;


            if (this.count < this.numberToSpawn) {
                setTimeout(this.handle, 1000);
            }
        }.bind(this);

        setTimeout(this.handle, 1000);
        this.instructions = 'Left Mouse Button - Select Entity or Place Seek Target\nCtrl + Left Mouse Button - Arrive At Target\nRight Mouse Button - Face Target';

        this.lastLeftMouseTarget = false;
        this.lastRightMouseTarget = false;
    };

    this.EntitySimulation.prototype.handleMousePressed = function (button, x, y, special) {
        var old = this.group.focused;
        this.group.handleMousePressed(button, x, y, special);

        if (old && old !== this.group.focused) {
            old.clearBehaviors();
        }

        if (button === 37 && this.group.focused) {
            this.lastLeftMouseTarget = new Point(x, y)
            this.group.focused.clearBehaviors();

            var behavior = null;
            var posFn = this.group.focused.propertyAsFunction('position');

            var targetFn =
                (function () {
                    return function () {
                        return this.lastLeftMouseTarget;
                    }.bind(this);
                }).call(this);

            if (special === 'control') {
                behavior = new Arrive(posFn, targetFn, this.group.focused.propertyAsFunction('maxForce'));
            } else {
                behavior = new Seek(posFn, targetFn);
            }

            this.group.focused.addBehavior(behavior);
        } else if (button === 39) {
            this.lastRightMouseTarget = new Point(x, y);
            if (this.group.focused) {
                this.group.focused.facePoint(this.lastRightMouseTarget);
            }
        }
    };

    this.EntitySimulation.prototype.handleMouseMoved = function (x, y) {
        this.group.handleMouseMoved(x, y);
    };

    this.EntitySimulation.prototype.exit = function (next) {

    };

    this.EntitySimulation.prototype.update = function () {
        this.path.rotateAroundCentroid(0.001);
        this.group.update();
    };

    this.EntitySimulation.prototype.draw = function (processing) {
        processing.fill(0, 0, 0, 0);
        this.drawPath(processing, this.path);

        processing.stroke(0, 255, 0);
        if (this.group.focused && !this.group.focused.idle) {
            this.drawTarget(processing, this.lastLeftMouseTarget);
        }
        

        processing.stroke(255, 0, 0);
        if (this.group.focused && !this.group.focused.rotationIdle) {
            this.drawTarget(processing, this.lastRightMouseTarget);
        }

        this.drawGroup(processing, this.group);

        processing.fill(255, 255, 255, 51);
        processing.textAlign(processing.LEFT);
        processing.textSize(11);

        for (var i = 0; i < 4; ++i) {
            processing.text(this.instructions, 12 + Math.random() * 8, 56 + Math.random() * 8);
        }

        processing.fill(255, 102, 153);
        processing.text(this.instructions, 14 + Math.random() * 1.1, 59 + Math.random() * 1.2);
        processing.fill(255, 156, 156, 51);
    };

    this.EntitySimulation.prototype.drawGroup = function (processing, group) {
        var ents = group.entities,
            n = ents.length;
        
        for (var i = 0; i < n; ++i) {
            this.drawEntity(processing, ents[i]);
        }

        var rect = group.boundingRect();

        processing.stroke(255, 255, 255);
        processing.strokeWeight(1);
        processing.fill(0, 0, 0, 0);
        processing.rect(rect.left, rect.top, rect.width(), rect.height());
    };

    this.EntitySimulation.prototype.drawEntity = function (processing, entity) {
        var pos = entity.position;

        var rot = entity.rotation.clone();
        rot.mul(12).add(pos);

        processing.stroke(255, 0, 0);
        processing.line(pos.x, pos.y, rot.x, rot.y);
        processing.stroke(255, 255, 255);

        var forward = entity.forward(12).add(pos);

        processing.fill(0, 255, 0);
        processing.line(pos.x, pos.y, forward.x, forward.y);

        var points = entity.polygon.points;
        var point = null,
            n = points.length;

        processing.fill(123, 145, 213);
        processing.stroke(255, 255, 255);
        processing.strokeWeight(1);
        processing.beginShape();
        for (var i = 0; i < n; ++i) {
            point = points[i];
            processing.vertex(pos.x + (point.x * entity.scale), pos.y + (point.y * entity.scale));
        }

        processing.endShape(processing.CLOSE);

        var rect = entity.boundingRect();
        if (entity === this.group.focused) {
            processing.stroke(255, 255, 0);
            processing.strokeWeight(2);
        } else if (entity.mouseIn) {
            processing.stroke(0, 0, 255);
            processing.strokeWeight(4);
        }


        processing.fill(0, 0, 0, 0);
        processing.rect(rect.left, rect.top, rect.width(), rect.height());
    };

    this.EntitySimulation.prototype.drawTarget = function (processing, target) {
        if (target) {
            processing.ellipse(target.x, target.y, 12, 12);
            processing.line(target.x, target.y - 10, target.x, target.y + 10);
            processing.line(target.x - 10, target.y, target.x + 10, target.y);
        };
    };

    this.EntitySimulation.prototype.drawPath = function (processing, path) {
        var points = path.points;
        var n = points.length;

        processing.fill(0, 0, 0, 0);
        processing.stroke(255, 255, 255);
        processing.beginShape();
        for (var i = 0; i < n; ++i) {
            point = points[i];
            processing.vertex(point.x, point.y);
        }

        processing.endShape(processing.CLOSE);
    };


    this.InputSimulation = function InputSimulation() {

    };

    this.InputSimulation.prototype.enter = function (last) {
        this.group = new modules.GUI.BoxLayout(aiScript.pInst.width, aiScript.pInst.height);

        var buttonActions = {
            0 : {
                name : "Change Orientation",
                fn : function (group) {
                    return function () {
                        if (group.direction === 'vertical') {
                            group.direction = 'horizontal';
                        } else if (group.direction === 'horizontal') {
                            group.direction = 'vertical';
                        }
                        this.setText('Change Orientation [' + group.direction + ']', 14);
                    }.bind(this);
                }
            },

            1: {
                name: "Change Alignment",
                fn: function (group) {
                    return function () {
                        if (group.align === 'left') {
                            group.align = 'right';
                        } else if (group.align === 'right') {
                            group.align = 'left';
                        }

                        this.setText('Change Alignment [' + group.align + ']', 14); 
                    }.bind(this);+2653147
                }
            },

            2: {
                name: "Move Left",
                fn: function (group) {
                    return function () {
                        if (group.layoutPosition.x - 200 <= 0) {
                            group.align = 'left';
                            group.elemAt(1).setText('Change Alignment [' + group.align + ']', 14);
                        };
                        group.layoutPosition.x -= 200;
                    }.bind(this);
                }
            },

            3: {
                name: "Move Right",
                fn: function (group) {
                    return function () {
                        if (group.boundingRect().right + 200 > aiScript.pInst.width && group.direction === 'vertical') {
                            group.align = 'right';
                            group.elemAt(1).setText('Change Alignment [' + group.align + ']', 14);
                        };
                        group.layoutPosition.x += 200;
                    }.bind(this);
                }
            },

            4: {
                name: "Move Up",
                fn: function (group) {
                    return function () {
                        group.layoutPosition.y -= 200;
                    }.bind(this);
                }
            },

            5: {
                name: "Move Down",
                fn: function (group) {
                    return function () {
                        group.layoutPosition.y += 200;
                    }.bind(this);
                }
            }
        }


        var button;
        for (var i = 0; i < 6; ++i) {
            button = new Button(aiScript.pInst.width + 120, aiScript.pInst.height);
            button.setText(buttonActions[i].name, 14);
            button.onClick(buttonActions[i].fn.apply(button, [this.group]));
            this.group.addEntity(button);
        }

        this.handleMousePressed = this.group.handleMousePressed.bind(this.group);
        this.handleMouseMoved = this.group.handleMouseMoved.bind(this.group);
    };

    this.InputSimulation.prototype.update = function () {
        this.group.update();
        this.group.clampToScreen();
    };

    this.InputSimulation.prototype.draw = function (processing) {

    };

    this.LSystemSimulation = function LSystemSimulation () {

    };

    this.LSystemSimulation.prototype.enter = function (last) {
        this.axiom = new Axiom('dl');
        this.alphabet = new Alphabet('gr', 'gl', 'dr', 'dl');

        // test all forms of rule construction
        this.rules = [
            new Rule('dr -> dl, gr'),
            new Rule('dl', ['gl', 'dr']),
            new Rule('gr -> dr'),
            new Rule('gl', 'dl')
        ];

        if (!(this.alphabet.validateRules(this.rules))) {
            console.log('LSystemSimulation -- some rules contain characters not in the alphabet');
        }

        this.lSystem = new LSystem(this.alphabet, this.axiom, this.rules);

        for (var i = 0; i < 4; ++i) {
            console.log('t = ', i, ' :', this.lSystem.word(i));
        }

        this.turtle = new Turtle();

        this.turtle.addInstruction('F', new modules.DevelopmentalSystems.MoveForwardAction(30, 1000));
        this.turtle.addInstruction('f', new modules.DevelopmentalSystems.MoveForwardAction(30, 200, false));
        this.turtle.addInstruction('-', new modules.DevelopmentalSystems.RotateAction(-1.57));
        this.turtle.addInstruction('+', new modules.DevelopmentalSystems.RotateAction(1.57));

        this.turtle.start(['F', 'F', '-', 'F', 'F', 'F', '-', 'F', '-', 'F', 'F', '+', 'F', '-', 'F', '+', 'f', 'f', 'F', '+', 'F', 'F', 'F', '+', 'F', '+', 'F', 'F', 'F'], new Point(100, 200));
    };

    this.LSystemSimulation.prototype.update = function () {
        this.turtle.update();
    };

    this.LSystemSimulation.prototype.draw = function (g) {
        this.turtle.draw(g);
    };
};