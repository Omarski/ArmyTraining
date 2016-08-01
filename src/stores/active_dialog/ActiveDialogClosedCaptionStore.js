var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogClosedCaptionConstants = require('../../constants/active_dialog/ActiveDialogClosedCaptionConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _visible = true;
var _transcript = "";

function show() {
    _visible = true;
}

function hide() {
    _visible = false;
}

function setTranscript(data) {
    _transcript = data;
}


var ActiveDialogClosedCaptionStore = assign({}, EventEmitter.prototype, {

    visible: function() {
        return _visible;
    },

    transcript: function() {
        return _transcript;
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
        case ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_UPDATE_TRANSCRIPT:
            setTranscript(action.data);
            ActiveDialogClosedCaptionStore.emitChange();
            break;
        case ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_SHOW:
            show();
            ActiveDialogClosedCaptionStore.emitChange();
            break;
        case ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_HIDE:
            hide();
            ActiveDialogClosedCaptionStore.emitChange();
            break;
        default:
        // no op
    }
});


module.exports = ActiveDialogClosedCaptionStore;