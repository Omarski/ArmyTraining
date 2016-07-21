var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var FooterConstants = require('../constants/FooterConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _nextDisabled = false;
var _prevDisabled = false;

var FooterStore = assign({}, EventEmitter.prototype, {
    isNextDisabled: function() {
        return _nextDisabled;
    },

    isPrevDisabled: function() {
        return _prevDisabled;
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
        case FooterConstants.FOOTER_DISABLE_ALL:
            _nextDisabled = true;
            _prevDisabled = true;
            FooterStore.emitChange();
            break;
        case FooterConstants.FOOTER_DISABLE_NEXT:
            _nextDisabled = true;
            FooterStore.emitChange();
            break;
        case FooterConstants.FOOTER_DISABLE_PREV:
            _prevDisabled = true;
            FooterStore.emitChange();
            break;
        case FooterConstants.FOOTER_ENABLE_ALL:
            _nextDisabled = false;
            _prevDisabled = false;
            FooterStore.emitChange();
            break;
        case FooterConstants.FOOTER_ENABLE_NEXT:
            _nextDisabled = false;
            FooterStore.emitChange();
            break;
        case FooterConstants.FOOTER_ENABLE_PREV:
            _prevDisabled = false;
            FooterStore.emitChange();
            break;
        default:
            // no op
    }
});

module.exports = FooterStore;