/*
A simple pure untyped lambda calculus interpreter, which interprets pure untyped λ-expressions

Syntax:

<expression> := <variable> | <function> | <application>
<function> := \\<variable>.<expression>
<variable> := [a-z]
<application> := (<expression>][]*<expression>)

*/
class Interpreter {
    private source: string;
    private position: number;

    eval(source: string): string {
        this.source = source;
        this.position = 0;
        let originalExpr = this.parse();
        let reducedExpr = this.reduce(originalExpr);
        return reducedExpr.toString();
    }

    private reduce(expression: Expression): Expression {
        if (expression instanceof Variable) {
            return expression;
        }
        else if (expression instanceof Func) {
            return expression;
        }
        else if (expression instanceof Application) {
            if (expression.expr1 instanceof Func) {
                let func = expression.expr1 as Func;
                return this.reduce(this.substitute(func.variable, func.body, expression.expr2));
            }
            else if (expression.expr1 instanceof Application) {
                return this.reduce(new Application(this.reduce(expression.expr1), expression.expr2));
            }
            else {
                return expression;
            }
        }
    }

    private substitute(variable: Variable, body: Expression, value: Expression): Expression {
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
                let renamedVariable = new Variable(body.variable + "`");
                return new Func(renamedVariable, this.substitute(variable, this.substitute(body.variable, body.body, renamedVariable), value));
            }
            else {
                return new Func(body.variable, this.substitute(variable, body.body, value));
            }
        }
    }


    private isFreeVariable(variable: Variable, expression: Expression): boolean {
        if (expression instanceof Variable) {
            return variable.equals(expression);
        }
        else if (expression instanceof Func) {
            return expression.variable.equals(variable) && this.isFreeVariable(variable, expression.body);
        }
        else if (expression instanceof Application) {
            return this.isFreeVariable(variable, expression.expr1) || this.isFreeVariable(variable, expression.expr2);
        }
    }

    private parse(): Expression {
        if (this.position + 1 >= this.source.length) {
            return null;
        }
        var c = this.peek();
        if (c == "\\") {
            this.advance();
            let variable = this.parseVariable();
            if (this.consume() != ".") {
                this.throwSyntaxError("Missing '.'");
            }
            let body = this.parse();
            return new Func(variable, body);
        }
        else if (c == "(") {
            this.advance();
            let expr1 = this.parse();
            while (this.peek() == " ") {
                this.advance();
            }
            let expr2 = this.parse();
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
    }

    private parseVariable(): Variable {
        let variable = this.consume();
        if (!this.isAlpha(variable)) {
            this.throwSyntaxError("Variable can only be letter from a to z")
        }
        return new Variable(variable);
    }

    private consume(): string {
        let c = this.peek();
        this.advance();
        return c;
    }

    private peek(): string {
        return this.source.charAt(this.position);
    }

    private advance() {
        this.position += 1;
    }

    private isAlpha(char: string) {
        return char.match(/[a-z]/i);
    }

    private throwSyntaxError(message: string) {
        throw new SyntaxError(message + ", character at :" + this.position);
    }
}

abstract class Expression {
    abstract toString(): string;
}

class Variable extends Expression {
    name: string;
    constructor(name: string) {
        super();
        this.name = name;
    }
    equals(variable: Variable): boolean {
        return this.name == variable.name;
    }
    toString(): string {
        return this.name;
    }
}

class Func extends Expression {
    variable: Variable;
    body: Expression;
    constructor(variable: Variable, body: Expression) {
        super();
        this.variable = variable;
        this.body = body;
    }
    toString(): string {
        return "\\" + this.variable.toString() + "." + this.body.toString();
    }
}

class Application extends Expression {
    expr1: Expression;
    expr2: Expression;
    constructor(expr1: Expression, expr2: Expression) {
        super();
        this.expr1 = expr1;
        this.expr2 = expr2;
    }
    toString(): string {
        return "(" + this.expr1.toString() + " " + this.expr2.toString() + ")";
    }
}