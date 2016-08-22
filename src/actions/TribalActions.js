var AppDispatcher = require('../dispatcher/AppDispatcher');

var TribalActions = {

    bookmarkLoad: function(callbackFunc) {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.getValue(MFStoreType.SPECIFIC, "bookmark", callbackFunc);
        }
    },

    bookmarkSave: function(data) {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.setValue(MFStoreType.SPECIFIC, "bookmark", data, this.bookmarkSaveComplete);
        }
    },

    bookmarkSaveComplete: function() {
        // TODO do something?
    },

    complete: function() {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.setValue(MFStoreType.SPECIFIC, "cmi.completion_status", "completed", this.completionComplete);
        }
    },

    completionComplete: function() {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.sync();
        }
    },

    dataLoad: function(callbackFunc) {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.getValue(MFStoreType.SPECIFIC, "data", callbackFunc);
        }
    },

    dataSave: function(data) {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.setValue(MFStoreType.SPECIFIC, "data", data, this.dataSaveComplete);
        }
    },

    dataSaveComplete: function() {
        // TODO do something?
    }
};

module.exports = TribalActions;