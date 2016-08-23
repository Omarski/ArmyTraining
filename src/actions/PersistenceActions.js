var AppDispatcher = require('../dispatcher/AppDispatcher');
var PersistenceConstants = require('../constants/PersistenceConstants');

var PersistenceActions = {
    initialize: function(storageType) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_INITIALIZE,
            storageType: storageType
        });
    },

    flush: function() {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_FLUSH
        });
    },

    remove: function(name) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_REMOVE,
            name: name
        });
    },

    removeBookmark: function() {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_REMOVE_BOOKMARK
        });
    },

    set: function(name, value) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_SET,
            name: name,
            value: value
        });
    },

    setBookmark: function(value) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_SET_BOOKMARK,
            value: value
        });
    },

    setStorageType: function(type) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_SET_STORAGE_TYPE,
            type: type
        });
    }
};

module.exports = PersistenceActions;