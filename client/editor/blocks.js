var blocks = {};

blocks.loaded = {
    'variables/set': require('./blocks/variables/set'),
    'variables/get': require('./blocks/variables/get'),
    'variables/print': require('./blocks/variables/print'),
    'maths/number': require('./blocks/maths/number'),
    'maths/operator': require('./blocks/maths/operator'),
    'logic/boolean': require('./blocks/logic/boolean')
};

blocks.categories = function() {
    var cats = {};

    for(var iden in blocks.loaded) {
        var block = blocks.loaded[iden];

        if(cats[block.category] === undefined) {
            cats[block.category] = [];
        }

        cats[block.category].push(block);
    }

    return cats;
};

module.exports = blocks;
