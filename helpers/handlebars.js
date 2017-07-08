module.exports = (Handlebars) => {
    return Handlebars.create({
        defaultLayout: 'layout', 
        extname: '.hbs',
        helpers: { // This was missing
            inc: function(value, options) {
                console.log('reading it');
                return parseInt(value) + 1;
            },
            list: function(items, options) {
                var out = "";
                
                for(var i=0; i<items.length; i++) {
                    out += options.fn(items[i]);
                }

                return out;
            }
        }
    });
}