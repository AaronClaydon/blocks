var $ = require('jquery');

//this is all very temporary
module.exports.init = function(id, categories) {
    var html = '';

    for(var title in categories) {
        html += '<strong>' + title + '</strong><br/>';

        var category = categories[title];
        category.forEach(function(block) {
            html += '- ' + block.identifier + '<br/>';
        });

        html += '<br/>';
    }

    $(id).html(html);
};
