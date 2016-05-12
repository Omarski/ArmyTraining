/**
 * Created by Alec on 3/9/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ConfigConstants = require('../constants/ConfigConstants');
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


var ConfigStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    loadConfig: function() {
        // read in config file and store in memeory
    },

    isASREnabled: function(){
        return _needsASR;
    },

    getDliList: function(){
        // var list = ["Baluchi", "Dari", "Pahsto(Afghanistan)", "Pashto(Pakistan)", "Punjabi", "Sindhi", "Urdu"];
        var list = [{
            name: "Baluchi",
            path: "dli/Baluchi_SCO_bt_bc_LSK/bt_bc_LSK/default.html"
        },{
            name: "Dari",
            path: "dli/Dari_pg_bc_SCORM_2004/pg_bc_LSK/default.html"
        },{
            name: "Pahsto(Afghanistan)",
            path: "dli/Pahsto(Afghanistan)_SCO_pu_bc_SCORM_2004/pu_bc_LSK/default.html"
        },{
            name: "Pashto(Pakistan)",
            path: "dli/Pashto(Pakistan)_pw_bc_SCORM_2004/pw_bc_LSK/default.html"
        },{
            name: "Punjabi",
            path: "dli/Punjabi_pj_bc_SCORM_2004/pj_bc_LSK/default.html"
        },{
            name: "Sindhi",
            path: "dli/Sindhi_sd_bc_SCORM_2004/sd_bc_LSK/default.html"
        },{
            name: "Urdu",
            path: "dli/Urdu_SCO_ur_bc_LSK/ur_bc_LSK/default.html"
        }];
        // read which DLI Guides are available from the config file


        return({
            dli: list
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
        case ConfigConstants.ACTIVE_DIALOG_OBJECTIVE_CREATE:
            create(action.data);
            ConfigStore.emitChange();
            break;
        case ConfigConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY:
            destroy();
            ConfigStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ConfigStore;
window.ConfigStore = ConfigStore;