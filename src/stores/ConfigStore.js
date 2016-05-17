/**
 * Created by Alec on 3/9/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ConfigConstants = require('../constants/ConfigConstants');
var ConfigActions = require('../actions/ConfigActions');
var PageStore = require('../stores/PageStore');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;

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
var _DliList = null;
var _hasReference = false;

// initialize this configStore from relevant json files
 function loadConfig() {
    //get asr data from file
    $.getJSON("data/ASR/asr.json", function(data){
        if(data && data.needsASR){
            _needsASR = data.needsASR;
        }
    });

    // get dli data....
    $.getJSON("data/dli/dli.json", function(data){
        if(data && data.dliPaths){
            _DliList = data.dliPaths;
        }
    });

     setTimeout(function () {
         if(_DliList){
             _hasDLI = true;
         }
         ConfigActions.loadComplete();
     }, 100);

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

    getDliList: function(){
        return({
            dli: _DliList
        })
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