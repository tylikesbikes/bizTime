const slugify = require('slugify');

function slugifyCompanyName(compName) {
    return slugify(compName, {
        replacement:'_',
        lower:true,
        trim: true
    })
}

module.exports = slugifyCompanyName;