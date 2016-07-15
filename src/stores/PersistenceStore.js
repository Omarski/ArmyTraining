var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Assign = require('object-assign');
var ConfigConstants = require('../constants/ConfigConstants');
var PersistenceConstants = require('../constants/PersistenceConstants');
var SCORMActions = require('../actions/SCORMActions');

var CHANGE_EVENT = 'change';


var LOCAL_STORAGE_KEY = "enskill_storage";

var _dataCache = {};
var _isDirty = false;
var _storageType = ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE;

// TODO check when config is updated or change and update these
var _storageGetFunction = null;
var _storageSetFunction = null;


function getData(name) {
    // TODO make asynchronous

    // check cache first
    if (_dataCache && _dataCache.hasOwnProperty(name)) {
        return _dataCache[name];
    }

    // if not found load from storage
    switch (_storageType) {
        case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
            getDataLocalStorage();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
            getDataSCORM();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
            break;
        default:
            getDataLocalStorage(name);
    }

    // check cache first
    if (_dataCache && _dataCache.hasOwnProperty(name)) {
        return _dataCache[name];
    } else {
        console.log("error loading data for: " + name);
        return null;
    }
}

function getDataLocalStorage() {
    var _loadedData = store.get(LOCAL_STORAGE_KEY);

    // update cache
    if (_loadedData)
        _dataCache = _loadedData;
}


function getDataSCORM() {
    var loadedDataString = SCORMActions.dataLoad();

    // convert from JSON string to object
    var loadedDataObject = null;
    try {
        loadedDataObject = JSON.parse(loadedDataString);
    } catch (e) {
        // do something
    }

    // update cache
    if (loadedDataObject) {
        _dataCache = loadedDataObject;
    }
}


function removeData(name) {
    if (_dataCache.hasOwnProperty(name)) {
        // update local cache
        delete _dataCache[name];

        // TODO make asynchronous
        switch (_storageType) {
            case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
                setDataLocalStorage();
                break;
            case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
                setDataSCORM();
                break;
            case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
                break;
            default:
                setDataLocalStorage();
        }

        return true;
    }

    return false;
}


function setData(name, value) {
    // update local cache
    _dataCache[name] = value;

    // TODO make asynchronous
    switch (_storageType) {
        case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
            setDataLocalStorage();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
            setDataSCORM();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
            break;
        default:
            setDataLocalStorage();
    }

    // TODO add some validation?
    return true;
}

function setDataLocalStorage() {
    store.set(LOCAL_STORAGE_KEY, _dataCache);
}

function setDataSCORM() {
    // convert data to string
    var dataString = JSON.stringify(_dataCache);

    SCORMActions.dataSave(dataString);
}


function setStorageType(type) {
    _storageType = type;

    if (_storageType === ConfigConstants.CONFIG_STORAGE_TYPE_SCORM) {
        SCORMActions.initialize();
    }
}



var PersistenceStore = Assign({}, EventEmitter.prototype, {
    /**
     * Gets the data with the name
     * @param name
     * @returns {object}
     */
    get: function(name) {
        return getData(name);
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    }

});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case PersistenceConstants.PERSISTENCE_REMOVE:
            removeData(action.name);
            break;
        case PersistenceConstants.PERSISTENCE_SET:
            setData(action.name, action.value);
            break;
        case PersistenceConstants.PERSISTENCE_SET_STORAGE_TYPE:
            setStorageType(action.type);
            break;
        default:
        // no op
    }

});

module.exports = PersistenceStore;