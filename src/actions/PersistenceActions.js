var AppDispatcher = require('../dispatcher/AppDispatcher');
var PersistenceConstants = require('../constants/PersistenceConstants');

var PersistenceActions = {
    remove: function(name) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_REMOVE,
            name: name
        });
    },

    set: function(name, value) {
        AppDispatcher.dispatch({
            actionType: PersistenceConstants.PERSISTENCE_SET,
            name: name,
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