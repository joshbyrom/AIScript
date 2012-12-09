AIScript.modules.DevelopmentalSystems = function (aiScript, modules) {
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

    this.Turtle = function (position, lsystem, graphics) {
        this.system = lsystem;
        this.graphics = graphics;

        this.position = position;
        this.heading = new Point();
        this.l = new Point(-1, 0);
        this.u = new Point(0, 1);
    };
};