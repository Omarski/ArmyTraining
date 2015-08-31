var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var NotificationConstants = require('../constants/NotificationConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _visible = false;
var _title = "test title";
var _body = "test body";
var _percent = "";
var _allowDismiss = false;

function show(data) {
    _title = data.title;
    _body = data.body;
    _percent = data.percent;
    if (data.allowDismiss === true) {
        _allowDismiss = true;
    }
    _visible = true;
    $('#notificationView').modal('show');
}

function hide() {
    _visible = false;
    $('#notificationView').modal('hide');
}

var NotificationStore = assign({}, EventEmitter.prototype, {

    isVisible: function() {
        return _visible;
    },

    allowDismiss:function() {
        return _allowDismiss;
    },

    title: function() {
        return _title;
    },

    body: function() {
        return _body;
    },

    percent: function() {
        return _percent;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {


    switch(action.actionType) {
        case NotificationConstants.NOTIFICATION_SHOW:
            show(action.data);
            NotificationStore.emitChange();
            break;
        case NotificationConstants.NOTIFICATION_HIDE:
            hide();
            NotificationStore.emitChange();
            break;
        case NotificationConstants.NOTIFICATION_UPDATE_TITLE:
            _title = action.data;
            NotificationStore.emitChange();
            break;
        case NotificationConstants.NOTIFICATION_UPDATE_BODY:
            _body = action.data;
            NotificationStore.emitChange();
            break;
        case NotificationConstants.NOTIFICATION_UPDATE_PERCENT:
            _percent = action.data;
            NotificationStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = NotificationStore;