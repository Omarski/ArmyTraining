var AppDispatcher = require('../dispatcher/AppDispatcher');
var ASRConstants = require('../constants/ASRConstants');

var ASRActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ASRConstants.ASR_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ASRConstants.ASR_DESTROY
        });
    }

};

module.exports = ASRActions;