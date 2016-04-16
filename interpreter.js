var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
A simple pure untyped lambda calculus interpreter, which interprets pure untyped λ-expressions

Syntax:

<expression> := <variable> | <function> | <application>
<function> := \\<variable>.<expression>
<variable> := [a-z]
<application> := (<expression>][]*<expression>)

*/
var Interpreter = (function () {
    function Interpreter() {
    }
    Interpreter.prototype.eval = function (source) {
        this.source = source;
        this.position = 0;
        var originalExpr = this.parse();
        var reducedExpr = this.reduce(originalExpr);
        return reducedExpr.toString();
    };
    Interpreter.prototype.reduce = function (expression) {
        if (expression instanceof Variable) {
            return expression;
        }
        else if (expression instanceof Func) {
            return expression;
        }
        else if (expression instanceof Application) {
            if (expression.expr1 instanceof Func) {
                var func = expression.expr1;
                return this.reduce(this.substitute(func.variable, func.body, expression.expr2));
            }
            else if (expression.expr1 instanceof Application) {
                return this.reduce(new Application(this.reduce(expression.expr1), expression.expr2));
            }
            else {
                return expression;
            }
        }
    };
    Interpreter.prototype.substitute = function (variable, body, value) {
        if (body instanceof Variable) {
            return body.equals(variable) ? value : body;
        }
        else if (body instanceof Application) {
            return new Application(this.substitute(variable, body.expr1, value), this.substitute(variable, body.expr2, value));
        }
        else if (body instanceof Func) {
            if (variable == body.variable) {
                return body.body;
            }
            else if (this.isFreeVariable(body.variable, value) && this.isFreeVariable(variable, body.body)) {
                var renamedVariable = new Variable(body.variable + "`");
                return new Func(renamedVariable, this.substitute(variable, this.substitute(body.variable, body.body, renamedVariable), value));
            }
            else {
                return new Func(body.variable, this.substitute(variable, body.body, value));
            }
        }
    };
    Interpreter.prototype.isFreeVariable = function (variable, expression) {
        if (expression instanceof Variable) {
            return variable.equals(expression);
        }
        else if (expression instanceof Func) {
            return expression.variable.equals(variable) && this.isFreeVariable(variable, expression.body);
        }
        else if (expression instanceof Application) {
            return this.isFreeVariable(variable, expression.expr1) || this.isFreeVariable(variable, expression.expr2);
        }
    };
    Interpreter.prototype.parse = function () {
        if (this.position + 1 >= this.source.length) {
            return null;
        }
        var c = this.peek();
        if (c == "\\") {
            this.advance();
            var variable = this.parseVariable();
            if (this.consume() != ".") {
                this.throwSyntaxError("Missing '.'");
            }
            var body = this.parse();
            return new Func(variable, body);
        }
        else if (c == "(") {
            this.advance();
            var expr1 = this.parse();
            while (this.peek() == " ") {
                this.advance();
            }
            var expr2 = this.parse();
            if (this.consume() != ")") {
                this.throwSyntaxError("Missing ')'");
            }
            return new Application(expr1, expr2);
        }
        else if (this.isAlpha(c)) {
            return this.parseVariable();
        }
        else {
            this.throwSyntaxError("Unknown character");
        }
    };
    Interpreter.prototype.parseVariable = function () {
        var variable = this.consume();
        if (!this.isAlpha(variable)) {
            this.throwSyntaxError("Variable can only be letter from a to z");
        }
        return new Variable(variable);
    };
    Interpreter.prototype.consume = function () {
        var c = this.peek();
        this.advance();
        return c;
    };
    Interpreter.prototype.peek = function () {
        return this.source.charAt(this.position);
    };
    Interpreter.prototype.advance = function () {
        this.position += 1;
    };
    Interpreter.prototype.isAlpha = function (char) {
        return char.match(/[a-z]/i);
    };
    Interpreter.prototype.throwSyntaxError = function (message) {
        throw new SyntaxError(message + ", character at :" + this.position);
    };
    return Interpreter;
})();
var Expression = (function () {
    function Expression() {
    }
    return Expression;
})();
var Variable = (function (_super) {
    __extends(Variable, _super);
    function Variable(name) {
        _super.call(this);
        this.name = name;
    }
    Variable.prototype.equals = function (variable) {
        return this.name == variable.name;
    };
    Variable.prototype.toString = function () {
        return this.name;
    };
    return Variable;
})(Expression);
var Func = (function (_super) {
    __extends(Func, _super);
    function Func(variable, body) {
        _super.call(this);
        this.variable = variable;
        this.body = body;
    }
    Func.prototype.toString = function () {
        return "\\" + this.variable.toString() + "." + this.body.toString();
    };
    return Func;
})(Expression);
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(expr1, expr2) {
        _super.call(this);
        this.expr1 = expr1;
        this.expr2 = expr2;
    }
    Application.prototype.toString = function () {
        return "(" + this.expr1.toString() + " " + this.expr2.toString() + ")";
    };
    return Application;
})(Expression);
//# sourceMappingURL=interpreter.js.map