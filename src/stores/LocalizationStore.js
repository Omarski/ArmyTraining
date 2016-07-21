var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var LocalizationConstants = require('../constants/LocalizationConstants');
var LocalizationActions = require('../actions/LocalizationActions');
var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = data;
}

function loadLocalization() {
    $.getJSON("dist/en.json", function(data){
        setTimeout(function () {
            LocalizationActions.create(data);
        }, 100);
    });
}

var LocalizationStore = assign({}, EventEmitter.prototype, {
    data: function() {
        return _data;
    },

    /**
     * @param (string) section
     * @param (string) item
     * @param (item) parameters - Optional. List of parameters that will be replaced into the found resource
     * @returns (string) Value of resource if found or an empty string if not found
     */
    labelFor: function(section, item, parameters) {
        var result = "Unknown label for " + section + " : " + item;
        if (section && item && _data[section] && _data[section][item]) {
            result = _data[section][item];
            
            // if provided, iterate over parameters replacing tokens for replacement text
            if (parameters != null) {
                var paramLen = parameters.length;
                while(paramLen--) {
                    var regex = new RegExp("\\{" + paramLen + "\\}", 'g');
                    result = result.replace(regex, parameters[paramLen].toString());
                }
            }
        }
        return result;
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
        case LocalizationConstants.LOCALIZATION_CREATE:
            create(action.data);
            LocalizationStore.emitChange();
            break;
        case LocalizationConstants.LOCALIZATION_LOAD:
            loadLocalization();
            break;
        case LocalizationConstants.LOCALIZATION_LOAD_COMPLETE:
            LocalizationStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = LocalizationStore;
