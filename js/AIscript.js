(function (window, undefined) {
    var AIScript = function AIscript() {
        var args = Array.prototype.slice.call(arguments);

        var callback = args.pop();

        var modules = (args[0] && typeof args[0] === 'string') ? args : args[0];

        if (!(this instanceof AIScript)) {
            return new AIScript(modules, callback);
        }

        // init memebers after "new guard"
        this.canvas = null;
        this.pInst = null;

        this.simulation = null;
        this.paused = false;
        this.last = null;

        if (!modules || modules === '*') {
            modules = [];
            for (var i in AIScript.modules) {
                if (AIScript.modules.hasOwnProperty(i)) {
                    modules.push(i);
                }
            }
        }

        var fn;
        for (var i = 0; i < modules.length; i += 1) {
            fn = AIScript.modules[modules[i]];
            fn.call(fn, this, AIScript.modules); // init modules
        }

        callback.call(this, AIScript.modules);
    };

    AIScript.prototype.simulate = function (simulation) {
        if (this.simulation === simulation ||
                 simulation === null)
            return;

        if (this.simulation !== null) {
            this.simulation.exit(simulation);
        }

        this.last = this.simulation;
        this.simulation = simulation;

        this.simulation.enter(this.last);
        return this;    
    };

    AIScript.prototype.width = function () {
        if (this.canvas === undefined) return 0;
        else return this.canvas.width;
    };

    AIScript.prototype.height = function () {
        if (this.canvas === undefined) return 0;
        else return this.canvas.height;
    };

    AIScript.prototype.setup = function (processing) {
        return (function (processing) {
            return function () {
                processing.size(this.width(), this.height());
            }.bind(this);
        }).call(this, processing);
    };

    AIScript.prototype.draw = function (processing) {
        return (function (processing) {
            return function () {
                processing.size(this.width(), this.height());

                processing.fill(0, 0, 0);
                processing.noStroke();
                processing.rect(0, 0, this.width(), this.height());

                if (this.simulation) {
                    if (!this.paused) {
                        this.simulation.update();
                    };
                    this.simulation.draw(processing);
                    if (this.paused) {
                        processing.fill(255, 255, 255, 51);

                        for (var i = 0; i < 4; ++i) {
                            processing.text("PAUSED", 12 + Math.random() * 8, 56 + Math.random() * 8);
                        }

                        processing.fill(255, 102, 153);
                        processing.text("PAUSED", 14 + Math.random() * 1.1, 59 + Math.random() * 1.2);
                        processing.fill(255, 156, 156, 51);
                    };
                }
            }.bind(this);
        }).call(this, processing);
    };

    AIScript.prototype.mainLoop = function (processing) {
        processing.setup = this.setup(processing);
        processing.draw = this.draw(processing);
        processing.keyPressed = this.handleKeyPressed(processing);
        processing.keyReleased = this.handleKeyReleased(processing);
    };

    AIScript.prototype.handleKeyPressed = function (processing) {
        return (function () {
            return function () {
                if (this.simulation) {
                    if (this.simulation.handleKeyPressed) {
                        this.simulation.handleKeyPressed(processing.keyCode);
                    }
                }
            }.bind(this);
        }).call(this);
    };

    AIScript.prototype.handleKeyReleased = function (processing) {
        return (function () {
            return function () {
                if (this.simulation) {
                    if (this.simulation.handleKeyReleased) {
                        this.simulation.handleKeyReleased(processing.keyCode);
                    }
                }
            }.bind(this);
        }).call(this);
    };

    AIScript.prototype.start = function () {
        this.canvas = document.getElementById("Main");
        this.pInst = new Processing(this.canvas, this.mainLoop.bind(this));
    };

    AIScript.modules = {}
    this.AIScript = AIScript;
})(this);


// this is for testing only :: TO_REMOVE
function addEvent(target, event, fnc) {
    var onEvent = 'on' + event;

    if (typeof target.addEventListener != "undefined")
        target.addEventListener(event, fnc, false);
    else if (typeof window.attachEvent != "undefined") {
        target.attachEvent(onEvent, fnc);
    }
    else {
        if (target.onEvent !== null) {
            var oldOnload = target.onEvent;
            target.onEvent = function (e) {
                oldOnload(e);
                target[fnc]();
            };
        }
        else
            target.onEvent = fnc;
    }
}

AIScript.modules.Say = function Say (aiScript) {
    this.say = "hello";
    this.sayHello = function () {
        return this.say;
    }
}

AIScript.modules.Goodbye = function Goodbye(aiScript) {
    this.say = "goodbye";
    this.sayGoodbye = function () {
        return this.say;
    }
}

addEvent(window, 'load', function () {
    window.aiScript = AIScript('Space', 'Entities', 'Simulations', function (box) {
        var e = new box.Entities.Entity(0, 0, 1, 2);

        this.simulate(new box.Simulations.LineTestSimulation());
        this.start();
    });
});