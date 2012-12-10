AIScript.modules.DevelopmentalSystems = function (aiScript, modules) {
    var Point = modules.Space.Point;

    this.Alphabet = function () {
        this.symbols = Array.prototype.slice.call(arguments);
        this.symbols = (this.symbols[0] && Array.isArray(this.symbols[0]) ? this.symbols[0] : this.symbols);
    };

    this.Alphabet.prototype.contains = function (symbol) {
        return this.symbols.indexOf(symbol) in this.symbols;
    };

    this.Alphabet.prototype.validateRules = function () {
        var args = Array.prototype.slice.call(arguments);
        args = (args[0] && Array.isArray(args[0]) ? args[0] : args);


        // returns true if predecessor and all successors are in alphabet
        var rule = null;
        for (var i = 0, n = args.length; i < n; ++i) {
            rule = args[i];

            if (!this.contains(rule.predecessor)) {
                return false;
            }

            if (Array.isArray(rule.successor)) {
                for(var k = 0, len = rule.successor.length; k < len; ++k ) {
                    if (!this.contains(rule.successor[k])) {
                        return false;
                    }
                }
            } else if (!this.contains(rule.successor)) {
                return false;
            }
        }

        return true;
    };

    this.Axiom = function () {
        this.word = Array.prototype.slice.call(arguments);;
        this.word = (this.word[0] && Array.isArray(this.word[0]) ? this.word[0] : this.word);
    };

    this.ProductionRule = function (predecessor, successor) {
        this.predecessor = predecessor;
        this.successor = successor;

        if (this.predecessor.indexOf('->') !== -1) {
            var loc = this.predecessor.indexOf('->');
            this.predecessor = predecessor.slice(0, loc).replace(/^\s+|\s+$/g, '');
            this.successor = predecessor.slice(loc + 2, predecessor.length).replace(/^\s+|\s+$/g, '');
        }

        if (this.successor.indexOf(',') !== -1) {
            this.successor = this.successor.split(',');
        }

        if(Array.isArray(this.successor)) {
            for (var i = 0, n = this.successor.length; i < n; ++i) {
                this.successor[i] = this.successor[i].replace(/^\s+|\s+$/g, '');
            }
        }
    };

    this.ProductionRule.prototype.apply = function (symbol, t) {
        if (this.predecessor === symbol) {
            return this.successor;
        } else {
            return false;
        }
    };

    this.LSystem = function (alphabet, axiom, rules) {
        this.alphabet = alphabet;
        this.axiom = axiom;
        this.rules = rules;

        this.t = 0;
        this.states = [];
        this.states.push(this.axiom.word);

        this.stoppingCondition = Number.MAX_VALUE;
    };

    this.LSystem.prototype.next = function () {
        return this.words(t);
        this.t += 1;
    };

    this.LSystem.prototype.word = function (t) {
        if (t > this.stoppingCondition) {
            return this.word(this.stoppingCondition);
        } else if (t in this.states) {
            return this.states[t];
        }

        if (!(t - 1 in this.states)) {
            this.word(t - 1);
        }

        var last = this.states[t - 1],
            n = last.length,
            next = [];

        var rn = this.rules.length,
            successor = '',
            rule = null,
            k = 0;

        var symbol = '';
        for (var i = 0; i < n; ++i) {
            symbol = last[i];

            if (!this.alphabet.contains(symbol)) {
                console.log('skipping invalid character(s)!');
                continue;
            }

            for (k = 0; k < rn; ++k) {
                rule = this.rules[k];
                successor = rule.apply(symbol, t);

                if (successor) {
                    console.log(symbol, ' ->', successor);
                    if (Array.isArray(successor)) {
                        next = next.concat(successor);
                    } else {
                        next.push(successor);
                    }

                    break;
                }
            }
        }

        this.t = t;

        // next = states[t]
        this.states[t] = next;
        return next;
    };

    this.Turtle = function () {
        this.position = new Point();
        this.heading = false;

        this.instructions = {};

        this.word = false;
        this.currentAction = false;
        this.currentActionIndex = 0;
        this.currentActionTime = 0;

        this.lastUpdateTime = false;

        this.actionHistory = [];
    };

    this.Turtle.prototype.addInstruction = function (symbol, action) {
        this.instructions[symbol] = action;
    };

    this.Turtle.prototype.start = function (word, point, heading) {
        this.word = word;
        this.currentActionIndex = 0;
        this.currentActionTime = 0;
        this.lastUpdateTime = false;
        this.currentAction = false;

        this.position = point || this.position;
        this.heading = heading || this.heading || new Point(1, 0);
    };

    this.Turtle.prototype.update = function () {
        if (!this.word || this.currentActionIndex < 0 || this.currentActionIndex > this.word.length) {
            return;
        }

        var now = aiScript.pInst.millis();

        var symbol = this.word[this.currentActionIndex];
        var desiredActionCtor = this.instructions[symbol];

        if (!desiredActionCtor) {
            this.nextSymbol();
        } else {
            if (!this.currentAction) {
                this.currentAction = new desiredActionCtor();
                this.currentAction.enter(this);
                this.lastUpdateTime = now;
            }

            if (!this.currentAction.update(this, this.currentActionTime, aiScript.pInst.lerp)) {
                this.nextSymbol();
            }
        }

        this.currentActionTime += now - (this.lastUpdateTime || 0);
        this.lastUpdateTime = now;
    };

    this.Turtle.prototype.draw = function (g) {
        for (var i = 0, n = this.actionHistory.length; i < n; ++i) {
            this.actionHistory[i].draw(this, g, false);
        }

        if (this.currentAction) {
            this.currentAction.draw(this, g, true);
        };
    };

    this.Turtle.prototype.nextSymbol = function () {
        if (this.currentAction) {
            this.actionHistory.push(this.currentAction);
            this.currentAction.exit(this);
        }

        this.currentActionIndex += 1;
        this.currentActionTime = 0;
        this.currentAction = false;
    };

    this.MoveForwardAction = function(distance, time, draw) {
        return (function MoveForwardDist(distance, time, draw) {
            var action = function() {
                
            };

            action.prototype.enter = function (turtle) {
                this.initial = turtle.position.clone();

                this.target = turtle.heading.clone().norm().mul(distance).add(turtle.position);
                this.t = 0;
            };

            action.prototype.update = function (turtle, elapsed, lerp) {
                this.t = elapsed / time;

                turtle.position.x = lerp(this.initial.x, this.target.x, this.t);
                turtle.position.y = lerp(this.initial.y, this.target.y, this.t);

                return this.t <= 1.0;
            };

            action.prototype.draw = function (turtle, g, current) {
                g.stroke(255, 255, 255);
                if (current) {
                    g.fill(255, 255, 255);
                    g.ellipse(turtle.position.x, turtle.position.y, 5, 5);
                    if (draw) {
                        g.line(this.initial.x, this.initial.y, turtle.position.x, turtle.position.y);
                    }
                } else {
                    if (draw) {
                        g.fill(0, 0, 255);
                        g.line(this.initial.x, this.initial.y, this.target.x, this.target.y);
                        g.ellipse(this.initial.x, this.initial.y, 5, 5);
                        g.ellipse(this.target.x, this.target.y, 5, 5);
                    }
                }
            };

            action.prototype.exit = function (turtle) {

            };

           return action;
        })(distance, time, draw === undefined ? true : draw);
    };

    this.RotateAction = function (angle) {
        return (function Rotate(angle) {
            var action = function () {

            };

            action.prototype.enter = function (turtle) {
                this.initial = turtle.position.clone();

                turtle.heading.rotate(angle).norm();
            };

            action.prototype.update = function (turtle, elapsed, lerp) {
                return false;
            };

            action.prototype.draw = function (turtle, g, current) {
                

            };

            action.prototype.exit = function (turtle) {

            };

            return action;
        })(angle);
    };
};