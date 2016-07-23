var AppDispatcher = require('../dispatcher/AppDispatcher');
var assign = require('object-assign');
var CoachFeedbackActions = require('../actions/CoachFeedbackActions');
var CoachFeedbackConstants = require('../constants/CoachFeedbackConstants');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';
var _negativeFeedback = {};
var _positiveFeedback = {};

/**
 * Load coach feedback model data from external file
 */
function load() {

    var imageSource = "MainlandFemale_Render01_exercisecrop.jpg";

    // TODO load from external file or fetch from another store
    // TODO for now just hardcode data
    _positiveFeedback = [
        {
            "asset": "coach_feedback_GREATJOB.mp4",
            "text": "Great job!",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_OUTSTANDING.mp4",
            "text": "Outstanding!",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_THATSEXACTLYRIGHT.mp4",
            "text": "That's exactly right.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_WELLDONE.mp4",
            "text": "Well done!",
            "type": "video/mp4"
        },
    ];

    _negativeFeedback = [
        {
            "asset": "coach_feedback_THATSNOTQUITERIGHT.mp4",
            "text": "That's not quite right.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_KEEPTRYING.mp4",
            "text": "Keep trying.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_NOTQUITE.mp4",
            "text": "Not quite.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_IMSORRYBUT.mp4",
            "text": "I'm sorry, but that is not correct.",
            "type": "video/mp4"
        },
    ];

    // dispatch data is loaded
    setTimeout(function () {
        CoachFeedbackActions.complete();
    }, 100);

}

var CoachFeedbackStore = assign({}, EventEmitter.prototype, {

    getNegativeFeedback: function() {
        return _negativeFeedback;
    },

    getPositiveFeedback: function() {
        return _positiveFeedback;
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
        case CoachFeedbackConstants.COACH_FEEDBACK_LOAD:
            load();
            break;
        case CoachFeedbackConstants.COACH_FEEDBACK_LOAD_COMPLETE:
            CoachFeedbackStore.emitChange();
            break;
        default:
            break;
    }

});

module.exports = CoachFeedbackStore;