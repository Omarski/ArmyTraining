var React = require('react');
var CoachFeedbackStore = require('../../stores/CoachFeedbackStore');
var SettingsStore = require('../../stores/SettingsStore');

var COACH_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var COACH_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

function getCoachFeedbackState(props) {
    return {
        isCorrect: props.isCorrect || false,
        text: props.text || ""
    };
}

function playCoachFeedback() {
    // find video
    var coachVideo = document.getElementById("coachVideo");

    // load and play it
    if (coachVideo != null) {
        coachVideo.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
        coachVideo.load();
        coachVideo.play();
    }
}

var CoachFeedbackView = React.createClass({

    propTypes: {
        isCorrect: React.PropTypes.bool,
        text: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            isCorrect: false,
            text: ""
        };
    },

    getInitialState: function () {
        return getCoachFeedbackState(this.props);
    },

    componentDidMount: function() {
        playCoachFeedback();
    },

    componentDidUpdate: function() {
        playCoachFeedback();
    },

    componentWillMount: function() {
        //SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //SettingsStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var cannedText = "";
        var coachMedia = "";
        var feedbackMap = {};
        var feedbackClass = "glyphicon MC-glyphicon MC-feedback";
        var mediaDir = "data/media/"; // TODO <-------------should be a global setting----------------------------------

        // get feedback object based on correctness
        if (this.props.isCorrect) {
            feedbackClass += " multiple-choice-feedback-icon multiple-choice-correct " + COACH_GLYPHICON_CORRECT_CLS;
            feedbackMap = CoachFeedbackStore.getPositiveFeedback();
        } else {
            feedbackClass += " multiple-choice-feedback-icon multiple-choice-incorrect " + COACH_GLYPHICON_INCORRECT_CLS;
            feedbackMap = CoachFeedbackStore.getNegativeFeedback();
        }

        if (feedbackMap.length > 0) {
            // get random one
            var feedbackObject = feedbackMap[Math.floor(Math.random() * feedbackMap.length)];

            // construct media element
            if ("asset" in feedbackObject && feedbackObject["asset"].length > 0) {
                switch(feedbackObject["type"]) {
                    case "video/mp4":
                        coachMedia = (
                            <div className="thumbnail">
                                <video id="coachVideo" width="110" height="110" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                                    <source src={mediaDir + feedbackObject["asset"]} type="video/mp4"></source>
                                </video>
                            </div>
                        );
                        break;
                    case "image/jpeg":
                        coachMedia = (
                            <div className="thumbnail">
                                <img src={mediaDir + feedbackObject["asset"]}></img>
                            </div>
                        );
                        break;
                    default:
                        break;
                }
            }

            // get text
            if ("text" in feedbackObject && feedbackObject["text"].length > 0) {
                cannedText = feedbackObject["text"];
            }
        }

        return (
            <div className="alert alert-dismissible multiple-choice-alert " role="alert" >
                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <div className="multiple-choice-alert-text">
                    {coachMedia}<h5><span className={feedbackClass}></span>{cannedText}<br></br>{this.props.text}</h5>
                </div>
            </div>
        );
    },
});

module.exports = CoachFeedbackView;