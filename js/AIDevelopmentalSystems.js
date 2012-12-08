AIScript.modules.DevelopmentalSystems = function (aiScript, modules) {
    this.Alphabet = function () {
        this.symbols = Array.prototype.slice.call(arguments);
        this.symbols = (this.symbols[0] && Array.isArray(this.symbols[0]) ? this.symbols[0] : this.symbols);
    };

    this.Alphabet.prototype.contains = function (symbol) {
        return this.symbols.indexOf(symbol) in this.symbols;
    };

    this.Axiom = function (string) {
        this.string = string;
    };

    this.ProductionRule = function (predecessor, successor) {
        this.predecessor = predecessor;
        this.successor = successor;
    };

    this.ProductionRule.prototype.apply = function (symbol) {
        if (this.predecessor === symbol) {
            return this.successor;
        } else {
            return false;
        }
    };
};