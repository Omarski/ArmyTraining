/**
 * Created by Alec on 3/9/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ConfigConstants = require('../constants/ConfigConstants');
var ConfigActions = require('../actions/ConfigActions');
var PageStore = require('../stores/PageStore');
var PersistenceActions = require('../actions/PersistenceActions');
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
var _hasHelp = false;
var _hasSettings = false;
var _hasBookmark = false;
var _hasAbout = false;
var _hasDownloadPDF = false;
var _hasResetCourse = false;
var _hasPageHeaderAudio = false;
var _storageType = ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE;


 function loadConfig() {
     $.getJSON("data/config.json")
         .done(function(data){
         // is there a DLI file?
         if(data){
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

             if(data.hasOwnProperty('help')){
                 _hasHelp = true;
             }

             if(data.hasOwnProperty('settings')){
                 _hasSettings = true;
             }

             if(data.hasOwnProperty('bookmark')){
                 _hasBookmark = true;
             }

             if(data.hasOwnProperty('about')){
                 _hasAbout = true;
             }

             if(data.hasOwnProperty('downloadPDF')){
                 _hasDownloadPDF = true;
             }

             if(data.hasOwnProperty('resetCourse')){
                 _hasResetCourse = true;
             }

             if(data.hasOwnProperty('pageHeaderAudio')){
                 _hasPageHeaderAudio = true;
             }

             // get storage type
             if (data.hasOwnProperty('storage')){
                 _storageType = data['storage'];
             }
         }
         ConfigActions.loadComplete();
        })
        .fail(function(){
             ConfigActions.loadComplete();
         });
}

var ConfigStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    isASREnabled: function(){
        return (_needsASR);
    },

    getStorageType: function(){
        return _storageType;
    },

    hasDLI: function(){
        // return false;
        return(_hasDLI);
    },

    hasReference: function(){
        // return false;
        return (_hasReference);
    },

    hasHelp: function(){
        // return false;
        return (_hasReference);
    },

    hasSetting: function(){
        // return false;
        return (_hasSettings);
    },

    hasBookmark: function(){
        // return false;
        return (_hasBookmark);
    },

    hasAbout: function(){
        // return true;
        return (_hasAbout);
    },

    hasDownloadPDF: function(){
        // return true;
        return (_hasDownloadPDF);
    },

    hasReset: function(){
        // return true;
        return (_hasResetCourse);
    },

    hasPageHeaderAudio: function(){
        return (_hasPageHeaderAudio);
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