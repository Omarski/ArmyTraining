var AppDispatcher = require('../dispatcher/AppDispatcher');
var CoachFeedbackConstants = require('../constants/CoachFeedbackConstants');

var CoachFeedbackActions = {

    /**
     * @param  {string} text
     */
    complete: function() {
        AppDispatcher.dispatch({
            actionType: CoachFeedbackConstants.COACH_FEEDBACK_LOAD_COMPLETE,
        });
    },

    load: function() {
        AppDispatcher.dispatch({
            actionType: CoachFeedbackConstants.COACH_FEEDBACK_LOAD,
        });
    }
};

module.exports = CoachFeedbackActions;
