module.exports = (Handlebars) => {
    return Handlebars.create({
        defaultLayout: 'layout', 
        extname: '.hbs',
        helpers: { // This was missing
            inc: function(value, options) {
                return parseInt(value) + 1;
            },
            list: function(items, options) {
                var out = "";
                
                for(var i=0; i<items.length; i++) {
                    out += options.fn(items[i]);
                }

                return out;
            },
            ifCond: (v1, operator, v2, options) => {
                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(this) : options.inverse(this);
                    case '===':
                        return (v1 === v2) ? options.fn(this) : options.inverse(this);
                    case '!=':
                        return (v1 != v2) ? options.fn(this) : options.inverse(this);
                    case '!==':
                        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                    case '<':
                        return (v1 < v2) ? options.fn(this) : options.inverse(this);
                    case '<=':
                        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                    case '>':
                        return (v1 > v2) ? options.fn(this) : options.inverse(this);
                    case '>=':
                        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                    case '&&':
                        return (v1 && v2) ? options.fn(this) : options.inverse(this);
                    case '||':
                        return (v1 || v2) ? options.fn(this) : options.inverse(this);
                    default:
                        return options.inverse(this);
                }
            },
            operation: (a, operator, b, options) => {
                switch (operator) {
                    case '-':
                        return options.fn(a-b);
                    default:
                        return options.inverse(this);
                }
            }
        }
    });
}