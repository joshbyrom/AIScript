AIScript.modules.GUI = function (aiScript, modules) {
    var Point = modules.Space.Point;
    var Polygon = modules.Space.Polygon;

    var Entity = modules.Entities.Entity;
    var Group = modules.Entities.Group;

    var Arrive = modules.Behaviors.Arrive;
    var LSeek = modules.Behaviors.LerpingSeek;

    this.Button = function Button(x, y, entity) {
        this._text = null;
        this._textGraphics = null;

        this.entity = entity || new Entity(x, y,
            new Polygon()
                .addPoint(-0.75, -1)
                .addPoint(1, -1)
                .addPoint(1, 1)
                .addPoint(-1, 1)
                .addPoint(-1, 0.55)
            );

        this.entity.friction = 0.0;
        this.entity.faceRotationOnIdle = false;
        this.entity.makeIdle();
    };

    this.Button.prototype.isPointInside = function (point) {
        return this.entity.isPointInside(point);
    };

    this.Button.prototype.boundingRect = function () {
        return this.entity.boundingRect();
    };

    this.Button.prototype.handleAddedToGroup = function (group) {
        this.entity.handleAddedToGroup(group);
    };

    this.Button.prototype.handleRemovedFromGroup = function (group) {
        this.entity.handleRemovedFromGroup(group);
    };

    this.Button.prototype.setText = function (text, size) {
        var p = aiScript.pInst;
        p.textSize(size);

        this.desiredWidth = p.textWidth(text);

        this.numberOfLines = 1;
        this.lineHeight = size;

        this._text = text;
        this.entity.polygon.scale(this.desiredWidth, this.lineHeight * this.numberOfLines);
    };

    this.Button.prototype.drawText = function (graphics) {
        var pos = this.entity.position,
            rot = this.entity.rotation;

        graphics.pushMatrix();

        graphics.fill(255, 255, this.mouseIn ? 0 : 255);
        graphics.textSize(this.lineHeight);
        graphics.textAlign(graphics.CENTER, graphics.CENTER);
        graphics.translate(pos.x, pos.y);
        graphics.rotate(Math.atan2(rot.y, rot.x));
        graphics.text(this._text, 0, 0);

        graphics.popMatrix();
    };

    this.Button.prototype.update = function () {
        this.entity.update();
    };

    this.Button.prototype.draw = function (processing) {
        var points = this.entity.polygon.points,
            point = null, pos = this.entity.position,
            scale = this.entity.scale, n = points.length;

        processing.fill(123, 145, 213);
        processing.stroke(255, 255, this.mouseIn ? 0 : 255);
        processing.strokeWeight(this.mouseIn ? 2 : 1);
        processing.beginShape();
        for (var i = 0; i < n; ++i) {
            point = points[i];
            processing.vertex(pos.x + (point.x * scale), pos.y + (point.y * scale));
        }

        processing.endShape(processing.CLOSE);

        this.drawText(processing);
    };

    this.Button.prototype.isPointInside = function (xy) {
        return this.entity.isPointInside(xy);
    };

    this.Button.prototype.onClick = function (fn) {
        this.handleClicked = fn;
    };

    this.Button.prototype.onEntered = function (fn) {
        this.handleMouseEnter = fn;
    };

    this.Button.prototype.onExit = function (fn) {
        this.handleMouseExit = fn;
    };

    this.Button.prototype.onFocus = function (fn) {
        this.gainFocus = fn;
    };

    this.Button.prototype.onFocusLost = function (fn) {
        this.loseFocus = fn;
    };

    // layouts
    this.BoxLayout = function (x, y) {
        this.layoutPosition = new Point(x, y);

        this.maxWidth = 0;
        this.maxHeight = 0;
        this.direction = 'vertical';
        this.align = 'right';

        this.group = new Group();
        this.addEntity = this.group.addEntity.bind(this.group);
        this.removeEntity = this.group.removeEntity.bind(this.group);
        this.handleMousePressed = this.group.handleMousePressed.bind(this.group);
        this.handleMouseMoved = this.group.handleMouseMoved.bind(this.group);
        this.handleMouseEnter = this.group.handleMouseEnter.bind(this.group);
        this.handleMouseExit = this.group.handleMouseExit.bind(this.group);
        this.boundingRect = this.group.boundingRect.bind(this.group);
        this.elemAt = this.group.elemAt.bind(this.group);
    };

    this.BoxLayout.prototype.update = function () {
        this.group.update.call(this.group);

        var ents = this.group.entities,
            current = null,
            n = ents.length,
            point = null;

        var bounds = null,
            numLines = 1,
            mod = (this.direction === 'vertical' ? this.layoutPosition.y : this.layoutPosition.x);

        this.totalHeight = 0;

        var targetFn = null;

        for (var i = 0; i < n; ++i) {
            current = ents[i];
            
            if (current.entity) {
                current = current.entity;
            }

            bounds = current.boundingRect();

            var w = bounds.width(),
                h = bounds.height();

            if (w > this.maxWidth) {
                this.maxWidth = w;
            }

            if (h > this.maxHeight) {
                this.maxHeight = h;
            }

            if (this.direction === 'vertical') {
                this.totalHeight += h;
            } 
            
            point = new Point((this.direction === 'vertical' ? this.layoutPosition.x : mod),
                                (this.direction === 'vertical' ? mod : this.layoutPosition.y));

            if (this.direction === 'horizontal') {
                if (mod + w> aiScript.pInst.width) {
                    numLines += 1;
                    this.totalHeight += this.maxHeight;
                    this.maxHeight = 0;

                    point.x = this.layoutPosition.x;
                }

                point.y = this.layoutPosition.y + h * numLines;
            }

            if (this.align === 'left' || this.direction === 'horizontal') {
                point.x += w * 0.5;
            } else if (this.align === 'right' && this.direction === 'vertical') {
                point.x += (this.maxWidth - w) * 0.5;
            }

            if (current.idleBehavior && current.idleBehavior.to.almostEquals(point)) {
                
            } else {
                var behavior = new LSeek(current.position, point, 100);
                behavior.directSet = true;
                current.idleBehavior = behavior;
            }
            

            mod = (this.direction === 'vertical' ? bounds.bottom + h * 0.5: bounds.right) + 2;
        }

        if (this.direction === 'horizontal') {
            this.totalHeight += this.maxHeight;
        }
    };

    this.BoxLayout.prototype.clampToScreen = function() {
        if (this.direction === 'vertical') {
            this.layoutPosition.x = Math.min(this.layoutPosition.x, aiScript.pInst.width - (this.align === 'left' ? this.boundingRect().width() : this.maxWidth * 0.5));
            this.layoutPosition.x = Math.max(this.layoutPosition.x, (this.align === 'left' ? 0 : this.maxWidth * 0.5));
        } else {
            this.layoutPosition.x = Math.min(this.layoutPosition.x, aiScript.pInst.width - this.maxWidth - 10);
            this.layoutPosition.x = Math.max(this.layoutPosition.x, 10);
        }


        //console.log(this.totalHeight);
        if (this.layoutPosition.y + this.totalHeight > aiScript.pInst.height) {
            this.layoutPosition.y = aiScript.pInst.height - this.totalHeight;
        }

        var minY = (this.direction === 'vertical' ? 0.5 * this.maxHeight : -0.5 * this.maxHeight);
        if (this.layoutPosition.y < minY) {
            this.layoutPosition.y = minY;
        }
    };
};