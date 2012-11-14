(function (window, undefined) {
    // main object and entry point
    // provides access to processing.js to simulations
    function AIscript() {
        this.canvas = null;
        this.pInst = null;

        this.simulation = null;
        this.last = null;
    }

    AIscript.prototype.simulate = function (simulation) {
        if (this.simulation === simulation ||
                 simulation === undefined)
            return;

        if (this.simulation !== undefined) {
            this.simulation.exit(simulation);
        }

        this.last = this.simulation;
        this.simulation = simulation;

        this.simulation.enter(this.last);
    }

    AIscript.prototype.width = function () {
        if (this.canvas === undefined) return 0;
        else return this.canvas.width;
    }

    AIscript.prototype.height = function () {
        if (this.canvas === undefined) return 0;
        else return this.canvas.height;
    }

    AIscript.prototype.setup = function (processing) {
        return (function(processing) {
            return function () {
                processing.size(this.width(), this.height());
            }.bind(this);
        }).call(this, processing);
    };

    AIscript.prototype.draw = function (processing) {
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

    AIscript.prototype.mainLoop = function (processing) {
        processing.setup = this.setup(processing);
        processing.draw = this.draw(processing);
    };

    AIscript.prototype.start = function() {
        this.canvas = document.getElementById("Main");
        this.pInst = new Processing(this.canvas, this.mainLoop.bind(this));
    }


    function addOnloadEvent(fnc){
        if ( typeof window.addEventListener != "undefined" )
            window.addEventListener( "load", fnc, false );
        else if ( typeof window.attachEvent != "undefined" ) {
            window.attachEvent( "onload", fnc );
        }
        else {
            if ( window.onload != null ) {
                var oldOnload = window.onload;
                window.onload = function ( e ) {
                    oldOnload( e );
                    window[fnc]();
                };
            }
            else 
                window.onload = fnc;
        }
    }

    var ai = new AIscript();
    addOnloadEvent(ai.start.bind(ai));
})(this);