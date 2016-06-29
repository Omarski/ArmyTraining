var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var AppStateConstants = require('../constants/AppStateConstants');

var CHANGE_EVENT = 'change';

var _windowWidth = window.innerWidth;
var _windowHeight = window.innerHeight;
var _lastKnownDevice = null;
var _renderChange = false;
var _MOBILE_WIDTH = 767;
var _TABLET_WIDTH = 1068;
var _MOBILE = "mobile";
var _TABLET = "tablet";
var _DESKTOP = "desktop";

function updateState() {
    var device = "";
    if (AppStateStore.isMobile()) {
        device = _MOBILE;
    } else if (AppStateStore.isTablet()) {
        device = _TABLET;
    } else if (AppStateStore.isDesktop()) {
        device = _DESKTOP;
    }

    if (_lastKnownDevice !== device) {
        _renderChange = true;
        _lastKnownDevice = device;
    } else {
        _renderChange = false;
    }
}

var AppStateStore = assign({}, EventEmitter.prototype, {

    device: function () {
        return _lastKnownDevice;
    },

    renderChange: function () {
        return _renderChange;
    },

    getHeight: function () {
        return _windowHeight;
    },

    getWidth: function () {
        return _windowWidth;
    },

    isMobile: function () {
        return (_windowWidth <= _MOBILE_WIDTH);
    },

    isTablet: function () {
        return (_windowWidth > _MOBILE_WIDTH && _windowWidth <= _TABLET_WIDTH);
    },

    isDesktop: function () {
        return (_windowWidth > _TABLET_WIDTH);
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
        case AppStateConstants.APP_STATE_SIZE_CHANGE:
            _windowWidth = window.innerWidth;
            _windowHeight = window.innerHeight;
            updateState();
            AppStateStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = AppStateStore;