/**
 * Created by Alec on 3/9/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ConfigConstants = require('../constants/ConfigConstants');
var ConfigActions = require('../actions/ConfigActions');
var PageStore = require('../stores/PageStore');
var DliView = require("../components/widgets/DliView");

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = {
        objectives: data
    }
}

function destroy() {

}

var _needsASR = false;
var _hasDLI = false;
var _hasReference = false;


 function loadConfig() {
     $.getJSON("data/config.json", function(data){
         // is there a DLI file?
         if(data.hasOwnProperty('dli')){
             _hasDLI = true;
         }

         // is there an asr?
         if(data.hasOwnProperty('asr')){
             _needsASR = true;
         }

         // is there are reference section?
         if(data.hasOwnProperty('reference')){
             _hasReference = true;
         }
     });
}

var ConfigStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    isASREnabled: function(){
        return (_needsASR);
    },

    hasDLI: function(){
        return(_hasDLI);
    },

    hasReference: function(){
        return (_hasReference);
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
        case ConfigConstants.CONFIG_CREATE:
            create(action.data);
            ConfigStore.emitChange();
            break;
        case ConfigConstants.CONFIG_LOAD:
            loadConfig();
            break;
        case ConfigConstants.CONFIG_LOAD_COMPLETE:
            ConfigStore.emitChange();
            break;
        case ConfigConstants.CONFIG_DESTROY:
            destroy();
            ConfigStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ConfigStore;
window.ConfigStore = ConfigStore;