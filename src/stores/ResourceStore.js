var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');


var resourceData = {
    "quiz-view-quiz-complete": "Your score was {0}%. Congratulations! You have successfully completed this section. You may now move on to the next section in your course of instruction.",
    "quiz-view-quiz-failed": "Your score was {0}%. You may want to review the section and try this quiz again."
};

var ResourceStore = assign({}, EventEmitter.prototype, {
    /**
     * @param (string) name - Key name of the resource to search for
     * @returns (string) Value of resource if found or an empty string if not found
     */
    getText: function(name, parameters) {
        if (resourceData[name]) {
            var resourceText = resourceData[name];

            // if provided, iterate over parameters replacing tokens for replacement text
            if (parameters != null) {
                var paramLen = parameters.length;
                while(paramLen--) {
                    var regex = new RegExp("\\{" + paramLen + "\\}", 'g');
                    resourceText = resourceText.replace(regex, parameters[paramLen]);
                }
            }

            return resourceText;
        }

        return "";
    }

});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        // TODO should be loaded from a localization file
        // case ResourceConstants.RESOURCE_COMPLETE:
        // case ResourceConstants.RESOURCE_LOAD:
        // default:
    }

});

module.exports = ResourceStore;