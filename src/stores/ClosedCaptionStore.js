var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ClosedCaptionConstants = require('../constants/ClosedCaptionConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _visible = false;

function show() {
    _visible = true;
}

function hide() {
    _visible = false;
}


var ClosedCaptionStore = assign({}, EventEmitter.prototype, {

    visible: function() {
        return _visible;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case ClosedCaptionConstants.CLOSED_CAPTION_SHOW:
            show();
            ClosedCaptionStore.emitChange();
            break;
        case ClosedCaptionConstants.CLOSED_CAPTION_HIDE:
            hide();
            ClosedCaptionStore.emitChange();
            break;
        default:
        // no op
    }
});


module.exports = ClosedCaptionStore;