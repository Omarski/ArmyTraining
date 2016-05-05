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

    getDLIGuides: function(){
        //jquery ajax load please
        console.log(".load");
        console.dir("#modalbody");
        $("#modalbody").load("../../reference/dli/Urdu_SCO_ur_bc_LSK/ur_bc_LSK/default.html");
    },

    getDliList: function(){
        var list = ["Baluchi", "Dari", "Pahsto(Afghanistan)", "Pashto(Pakistan)", "Punjabi", "Sindhi", "Urdu"];

        return({
            names: list
        })
    },

    constructDLI: function(){

        var popOverList = <Popover id="settingsPopover" title='Reference Section [NYI]'>
            <ButtonGroup vertical>
                <Button>Baluchi</Button>
                <Button>Dari</Button>
                <Button>Pahsto(Afghanistan)</Button>
                <Button>Pashto(Pakistan)</Button>
                <Button>Punjabi</Button>
                <Button>Sindhi</Button>
                <Button>Urdu</Button>
            </ButtonGroup>
        </Popover>;

        return popOverList;
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