
// TODO commute literals on the left side of a target operand, when possible

module.exports = solve;
function solve(target, source) {
    return solve.semantics.solve(target, source);
}

solve.semantics = {

    solve: function (target, source) {
        if (this.simplifiers.hasOwnProperty(target.type)) {
            target = this.simplifiers[target.type](target);
        }
        while (this.solvers.hasOwnProperty(target.type)) {
            source = this.solvers[target.type](target, source);
            target = target.args[0];
            if (this.simplifiers.hasOwnProperty(target.type)) {
                target = this.simplifiers[target.type](target);
            }
        }
        return [target, source];
    },

    simplifiers: {
        add: function (syntax) {
            var left = syntax.args[0];
            if (left.type === "literal" && left.value === "") {
                return {
                    type: "string",
                    args: [syntax.args[1]]
                };
            } else {
                return syntax;
            }
        }
    },

    solvers: {
        // e.g.,
        // !y = x
        // y = !x
        reflect: function (target, source) {
            return {type: target.type, args: [source]};
        },
        // e.g.,
        // y + 1 = x
        // y = x - 1
        invert: function (target, source, operator) {
            return {type: operator, args: [
                source,
                target.args[1]
            ]};
        },
        number: function (target, source) {
            return this.reflect(target, source);
        },
        string: function (target, source) {
            return this.reflect(target, source);
        },
        not: function (target, source) {
            return this.reflect(target, source);
        },
        neg: function (target, source) {
            return this.reflect(target, source);
        },
        add: function (target, source) {
            return this.invert(target, source, 'sub');
        },
        sub: function (target, source) {
            return this.invert(target, source, 'add');
        },
        mul: function (target, source) {
            return this.invert(target, source, 'div');
        },
        div: function (target, source) {
            return this.invert(target, source, 'mul');
        },
        pow: function (target, source) {
            return this.invert(target, source, 'root');
        },
        root: function (target, source) {
            return this.invert(target, source, 'pow');
        }
    }

};

