var AppDispatcher = require('../dispatcher/AppDispatcher');

var TribalActions = {

    bookmarkLoad: function() {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.getValue(MFStoreType.SPECIFIC, "bookmark", this.bookmarkLoadComplete);
        }
    },

    bookmarkLoadComplete: function(value) {
        // TODO
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

    dataLoad: function() {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.getValue(MFStoreType.SPECIFIC, "data", this.dataLoadComplete)
        }
    },

    dataLoadComplete: function(value) {
        // TODO
    },

    dataSave: function(data) {
        if (window.plugins && window.plugins.clientPlugin) {
            var jkoPlugin = window.plugins.clientPlugin;
            jkoPlugin.setValue(MFStoreType.SPECIFIC, "data", data, this.dataSaveComplete)
        }
    },

    dataSaveComplete: function() {
        // TODO do something?
    }
};

module.exports = TribalActions;