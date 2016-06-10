var AppDispatcher = require('../dispatcher/AppDispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var PageStore = require('./PageStore');
var QuestionnaireConstants = require('../constants/QuestionnaireConstants');

var CHANGE_EVENT = 'change';
var _data = {};


var QuestionnaireStore = Assign({}, EventEmitter.prototype, {

    addAnswer: function(answer) {
        var currentPage = PageStore.page();
        if (currentPage !== null) {
            _data[currentPage.xid] = answer;
        }
    },

    getAnswer: function() {
        var currentPage = PageStore.page();
        if (currentPage !== null && _data[currentPage.xid] != null) {
            return _data[currentPage.xid];
        }
        return null;
    },

    getPlaylists: function() {
        if (_data) {
            var values = [];
            for (var key in _data) {
                for (var playlists in _data[key]) {
                    if (_data[key][playlists] !== null) {
                        var split = _data[key][playlists].split(',');
                        for (var index in split) {  // TODO <--- ugh i hate this
                            // check if not already added
                            if (!(split[index] in values)) {
                                values.push(split[index]);
                            }
                        }
                    }
                }
            }
            return values;
        }
        return [];
    },

    reset: function() {
        _data = {};
    }

});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case QuestionnaireConstants.QUESTIONNAIRE_ANSWER:
            QuestionnaireStore.addAnswer(action.data);
            break;
        case QuestionnaireConstants.QUESTIONNAIRE_RESET:
            QuestionnaireStore.reset();
            break;
        default:
        // no op
    }
});

module.exports = QuestionnaireStore;