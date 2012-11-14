(function (window, undefined) {
    function AIscript() {
        this.canvas = null;
        this.pInst = null;
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