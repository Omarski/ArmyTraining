var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Assign = require('object-assign');
var ConfigConstants = require('../constants/ConfigConstants');
var PersistenceConstants = require('../constants/PersistenceConstants');
var PersistenceActions = require('../actions/PersistenceActions');
var SCORMActions = require('../actions/SCORMActions');
var TribalActions = require('../actions/TribalActions');
var DevToolActions = require('../actions/DevToolsActions');

var CHANGE_EVENT = 'change';

var LOCAL_STORAGE_KEY = "enskill_storage";
var LOCAL_STORAGE_BOOKMARK_KEY = "bookmark";

var _bookmarkDataCache = {};
var _dataCache = {};
var _isDirty = false;
var _storageType = ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE;

// TODO check when config is updated or change and update these
var _bSaveOnDataChange = false;
var _storageGetFunction = null;
var _storageSetFunction = null;
var _initialLoadComplete = false;

function flushData() {
    // TODO make asynchronous
    switch (_storageType) {
        case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
            flushLocalStorage();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
            flushDataSCORM();
            flushLocalStorage(); // TODO hack for now <----
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
            flushDataTribal();
            break;
        default:
            flushLocalStorage();
    }

    // TODO add some validation?
    return true;
}

function flushLocalStorage() {
    store.set(LOCAL_STORAGE_KEY, _dataCache);
}

function flushDataSCORM() {
    // convert data to string
    var dataString = JSON.stringify(_dataCache);

    setTimeout(function() {
        SCORMActions.dataSave(dataString);

        var error = SCORMActions.getLastError();
        DevToolActions.log('---> error code: ' + error);
    }, 0.1);
}

function flushDataTribal() {
    // convert data to string
    var dataString = JSON.stringify(_dataCache);

    setTimeout(function() {
        TribalActions.dataSave(dataString);
    }, 0.1);
}

function getBookmarkData() {
    // TODO make asynchronous

    // check cache first
    if (_bookmarkDataCache && _bookmarkDataCache.hasOwnProperty(LOCAL_STORAGE_BOOKMARK_KEY)) {
        return _bookmarkDataCache[LOCAL_STORAGE_BOOKMARK_KEY];
    }

    // if not found load from storage
    switch (_storageType) {
        case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
            getBookmarkDataLocalStorage();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
            getBookmarkDataSCORM();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
            break;
        default:
            getBookmarkDataLocalStorage(name);
    }

    // check cache again
    if (_bookmarkDataCache && _bookmarkDataCache.hasOwnProperty(LOCAL_STORAGE_BOOKMARK_KEY)) {
        return _bookmarkDataCache[LOCAL_STORAGE_BOOKMARK_KEY];
    } else {
        // report some error
        return null;
    }

}

function getBookmarkDataLocalStorage() {
    var _loadedData = store.get(LOCAL_STORAGE_BOOKMARK_KEY);

    // update bookmark cache
    if (_loadedData)
        _bookmarkDataCache = _loadedData;
}

function getBookmarkDataSCORM() {
    
    var loadedDataString = SCORMActions.bookmarkLoad();
    // convert from JSON string to object
    var loadedDataObject = null;
    try {
        loadedDataObject = JSON.parse(loadedDataString);
    } catch (e) {
        // do something
    }

    // update cache
    if (loadedDataObject) {
        _bookmarkDataCache = loadedDataObject;
    }
}

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

    // for now always mark complete
    _initialLoadComplete = true;
    setTimeout(function () {
        PersistenceActions.complete();
    });

    // check cache first
    if (_dataCache && _dataCache.hasOwnProperty(name)) {
        return _dataCache[name];
    } else {
        // report some error
        return null;
    }
}

function getDataLocalStorage() {
    var _loadedData = store.get(LOCAL_STORAGE_KEY);

    // update cache
    if (_loadedData) {
        _dataCache = _loadedData;
    }
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


    // TODO for now fall back to local storage
    var error = SCORMActions.getLastError();
    if (error != 0) {
        getDataLocalStorage();
        DevToolActions.log('successful data load');
    }
    DevToolActions.log(name + ' error code: ' + error);
}


function removeData(name) {
    if (_dataCache.hasOwnProperty(name)) {
        // update local cache
        delete _dataCache[name];

        // save it
        if (_bSaveOnDataChange) {
            flushData();
        }

        return true;
    }

    return false;
}

function removeBookmarkData() {
    if (_bookmarkDataCache.hasOwnProperty(LOCAL_STORAGE_BOOKMARK_KEY)) {

        delete _bookmarkDataCache[LOCAL_STORAGE_BOOKMARK_KEY];

        // TODO make asynchronous
        switch (_storageType) {
            case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
                setBookmarkDataLocalStorage();
                break;
            case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
                setBookmarkDataSCORM();
                break;
            case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
                break;
            default:
                setBookmarkDataLocalStorage();
        }

        return true;
    }

    return false;
}


function setBookmarkData(value) {
    // update local bookmark cache
    _bookmarkDataCache[LOCAL_STORAGE_BOOKMARK_KEY] = value;

    // TODO make asynchronous
    switch(_storageType) {
        case ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE:
            setBookmarkDataLocalStorage();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_SCORM:
            setBookmarkDataSCORM();
            break;
        case ConfigConstants.CONFIG_STORAGE_TYPE_TRIBAL:
            break;
        default:
            setBookmarkDataLocalStorage();
    }

    // TODO add some validation
    return true;
}

function setBookmarkDataLocalStorage() {
    store.set(LOCAL_STORAGE_BOOKMARK_KEY, _bookmarkDataCache);
}

function setBookmarkDataSCORM() {
    // convert data to string
    var dataString = JSON.stringify(_bookmarkDataCache);

    setTimeout(function() {
        SCORMActions.bookmarkSave(dataString);
    }, 0.1);
}


function setData(name, value) {
    // update local cache
    _dataCache[name] = value;

    // save it
    if (_bSaveOnDataChange) {
        flushData();
    }

    // TODO add some validation?
    return true;
}

function setStorageType(type) {
    _storageType = type;

    if (_storageType === ConfigConstants.CONFIG_STORAGE_TYPE_SCORM) {
        setTimeout(function() {
            SCORMActions.initialize();
        }, 0.1);
    }
    else if (_storageType == ConfigConstants.CONFIG_STORAGE_TYPE_LOCAL_STORAGE) {
        _bSaveOnDataChange = true;
    }
}

function setComplete() {
    _initialLoadComplete = true;
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

    complete: function() {
        return _initialLoadComplete;
    },

    getBookmark: function() {
        return getBookmarkData();
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
        case PersistenceConstants.PERSISTENCE_FLUSH:
            flushData();
            break;
        case PersistenceConstants.PERSISTENCE_REMOVE:
            removeData(action.name);
            break;
        case PersistenceConstants.PERSISTENCE_REMOVE_BOOKMARK:
            removeBookmarkData();
            break;
        case PersistenceConstants.PERSISTENCE_SET:
            setData(action.name, action.value);
            break;
        case PersistenceConstants.PERSISTENCE_SET_BOOKMARK:
            setBookmarkData(action.value);
            break;
        case PersistenceConstants.PERSISTENCE_SET_STORAGE_TYPE:
            setStorageType(action.type);
            break;
        case PersistenceConstants.PERSISTENCE_COMPLETE:
            setComplete();
            PersistenceStore.emitChange();
            break;
        default:
        // no op
    }

});

module.exports = PersistenceStore;