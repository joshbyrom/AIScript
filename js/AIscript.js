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
            fn.call(fn, this); // init modules
        }

        callback.call(AIScript.modules, this);

        AIScript.prototype.simulate = function (simulation) {
            if (this.simulation === simulation ||
                     simulation === undefined)
                return;

            if (this.simulation !== undefined) {
                this.simulation.exit(simulation);
            }

            this.last = this.simulation;
            this.simulation = simulation;

            this.simulation.enter(this.last);
            return this;    // using train wreck!
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
                    if (this.simulation) {
                        this.simulation.update();
                        this.simulation.draw();
                    }
                }.bind(this);
            }).call(this, processing);
        };

        AIScript.prototype.mainLoop = function (processing) {
            processing.setup = this.setup(processing);
            processing.draw = this.draw(processing);
        };

        AIScript.prototype.start = function () {
            this.canvas = document.getElementById("Main");
            this.pInst = new Processing(this.canvas, this.mainLoop.bind(this));
        };
    };

    AIScript.modules = {}
    this.AIScript = AIScript;
})(this);


// this is for testing only :: TO_REMOVE
function addOnloadEvent(fnc) {
    if (typeof window.addEventListener != "undefined")
        window.addEventListener("load", fnc, false);
    else if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onload", fnc);
    }
    else {
        if (window.onload != null) {
            var oldOnload = window.onload;
            window.onload = function (e) {
                oldOnload(e);
                window[fnc]();
            };
        }
        else
            window.onload = fnc;
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

addOnloadEvent(function () {
    AIScript('Say', 'Goodbye', function (box) {
        console.log(this.Say.sayHello());
        console.log(this.Goodbye.sayGoodbye());
        //addOnloadEvent(box.start.bind(box));
    });
});