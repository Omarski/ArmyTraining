var AppDispatcher = require('../dispatcher/AppDispatcher');

var SCORMActions = {

    bookmarkLoad: function() {
        return this.getParameter("cmi.location");
    },

    bookmarkSave: function(data) {
        // check if data is less than 1000 characters
        if (data && (data.length < 1000)) {
            this.setParameter("cmi.location", data);
        }
    },

    complete: function() {
        this.setParameter("cmi.score.scaled", "1.0");
        this.setParameter("cmi.success_status", "passed");
        this.setParameter("cmi.completion_status", "completed");
    },

    dataLoad: function() {
        return this.getParameter("cmi.suspend_data");
    },

    dataSave: function(data) {
        this.setParameter("cmi.suspend_data", data);
    },

    initialize: function() {
        try {
            doLMSInitialize();
        } catch (e) {
            // do something
        }
    },

    getLastError: function() {
        var errorCode = "mario";
        try {
            errorCode = doLMSGetLastError();
        } catch (e) {
            // do something
        }

        return errorCode;
    },

    getParameter: function(name) {
        if (name) {
            try {
                return doLMSGetValue(name);
            } catch (e) {
                // do something
            }
        }

        return null;
    },

    setParameter: function(name, value) {
        if (name && value) {
            try {
                doLMSSetValue(name, value);
                doLMSCommit();
            } catch (e) {
                // do something
            }
        }
    }
};

module.exports = SCORMActions;