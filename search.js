const lunr = require('lunr');
const documenterSearchIndex = require('./search_index.js');
const juliaStopWords = require('./stopwords.js');

// list below is the lunr 2.1.3 list minus the intersect with names(Base)
// (all, any, get, in, is, which) and (do, else, for, let, where, while, with)
// ideally we'd just filter the original list but it's not available as a variable
lunr.stopWordFilter = lunr.generateStopWordFilter(juliaStopWords)

// add . as a separator, because otherwise "title": "Documenter.Anchors.add!"
// would not find anything if searching for "add!", only for the entire qualification
lunr.tokenizer.separator = /[\s\-\.]+/

// custom trimmer that doesn't strip @ and !, which are used in julia macro and function names
lunr.trimmer = function(token) {
    return token.update(function(s) {
        return s.replace(/^[^a-zA-Z0-9@!]+/, '').replace(/[^a-zA-Z0-9@!]+$/, '')
    })
}

lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'juliaStopWordFilter')
lunr.Pipeline.registerFunction(lunr.trimmer, 'juliaTrimmer')

var index = lunr(function() {
    this.ref('location')
    this.field('title')
    this.field('text')
    documenterSearchIndex['docs'].forEach(function(e) {
        this.add(e)
    }, this)
})
var store = {}

documenterSearchIndex['docs'].forEach(function(e) {
    store[e.location] = {
        title: e.title,
        category: e.category
    }
})

var documenterBaseURL = ""

function update_search(querystring) {
    tokens = lunr.tokenizer(querystring)
    results = index.query(function(q) {
        tokens.forEach(function(t) {
            q.term(t.toString(), {
                fields: ["title"],
                boost: 10,
                usePipeline: false,
                editDistance: 2,
                wildcard: lunr.Query.wildcard.NONE
            })
            q.term(t.toString(), {
                fields: ["text"],
                boost: 1,
                usePipeline: true,
                editDistance: 2,
                wildcard: lunr.Query.wildcard.NONE
            })
        })
    })
    return results
}

module.exports = update_search;
