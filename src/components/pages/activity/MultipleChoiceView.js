var React = require('react');
var CoachFeedbackView = require('../../widgets/CoachFeedbackView');
var InfoTagConstants = require('../../../constants/InfoTagConstants');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var ImageCaption = require('../../widgets/ImageCaption');
var Utils = require('../../widgets/Utils');

function getPageState(props) {
    var mediaItems = "";
    var data = {
        page: null,
        title: "",
        sources: [],
        pageType: "",
        answers: [],
        prompt: "",
        media: "",
        haveAnswered: false,
        answerFeedback: "",
        correctAnswer: "",
        isQuestionaire: false,
        isQuizPage: false,
        bShuffle: true,
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.answers = props.page.answer;
        data.prompt = props.page.prompt.text;

        if (data.page.info && data.page.info.property) {

            if (Utils.findInfo(data.page.info, InfoTagConstants.INFO_PROP_QUESTIONNAIRE) != null) {
                data.isQuestionaire = true;
                data.bShuffle = false;
            }

            if (Utils.findInfo(data.page.info, InfoTagConstants.INFO_PROP_NOSHUFFLE) != null) {
                data.bShuffle = false;
            }
        }
    }

    // set if quiz page
    data.isQuizPage = PageStore.isQuizPage();

    if(props && props.page && props.page.media){

        // iterate over each media object composing the html
        mediaItems = props.page.media.map(function(item, index) {
            var filePath = "data/media/" + item.file;
            var result = <div key={index}>Unknown File Type</div>;

            if (item.type === "video") {
                if(item.file.split(".")[1] === "mp4") {
                    result = <div className={data.videoType} key={index}>
                        <video id="video" controls autoPlay volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source src={filePath} type="video/mp4"></source>
                        </video>
                        {data.caption}
                    </div>
                }
            }

            if (item.type === "image") {
                result = (<ImageCaption videoType={data.videoType} src={filePath} key={index} altText={item.title} />);
            }

            return result;
        });
    }

    // assign result to data
    data.media = mediaItems;


    if (data.bShuffle) {
        data.answers = AGeneric().shuffle(data.answers);
    }

    data.answers.map(function(item){
        if(item.correct == true){
            data.correctAnswer = item.nut.uttering.utterance.translation.text;
        }
    });

    return data;
}

function getFeedback(answers, selectedAnswer){
    var getter = "getFeedback could not find selected Answer.";
    answers.map(function(item){
        var text = item.nut.uttering.utterance.translation.text;
        if(selectedAnswer == text){
            if (item.feedback) {
                getter = item.feedback.text;
            }
        }
    });
    return(getter);
}

var MultipleChoiceView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        // TODO remove me after alpha-----------------------------------------------------------------------------------
        // iterate over answer objects
        var recommendedMap = {};
        for (var answerIndex in this.state.answers) {

            var answerObj = this.state.answers[answerIndex];

            if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info && answerObj.nut.uttering.info.property) {

                // iterate over each property object
                for (var propertyIndex in answerObj.nut.uttering.info.property) {

                    var propertyObject = answerObj.nut.uttering.info.property[propertyIndex];

                    // if recommended found put into map
                    if (propertyObject.name && propertyObject.name == "recommended") {

                        if (answerObj.nut.uttering.utterance && answerObj.nut.uttering.utterance.translation) {
                            recommendedMap[answerObj.nut.uttering.utterance.translation.text] = 1;
                        }
                        break;
                    }
                }
            }
        }

        // iterate over each item and check if recommended
        $(".multiple-choice-checkbox").each(function () {
            // check if text is in the recommended if so mark it checked
            if (this.value in recommendedMap) {
                this.checked = true;
            }
        });
        // TODO end of remove me----------------------------------------------------------------------------------------
    },

    componentDidUpdate: function(){
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    answerChange: function(answer) {
        var self = this;
        var state = this.state;
        var feedback = state.answerFeedback;
        var target = state.correctAnswer;
        var isCorrect = false;

        // iterate over each checkbox checking if it was correct
        $(".multiple-choice-checkbox").each(function () {
            if (this.value == answer) {
                this.checked = true;
                isCorrect = (answer == target);
                feedback = (<CoachFeedbackView text={getFeedback(state.answers, answer)} isCorrect={isCorrect} />);
            } else {
                this.checked = false;
            }
        });

        // update state
        self.setState({
            haveAnswered: true,
            answerFeedback: feedback
        });

        // for now only record if its a quiz page or questionnaire
        if (state.isQuizPage || state.isQuestionaire) {
            // TODO <-------------- MOVE TO ITS OWN OBJECT------------------------------------------
            // create new answer object
            var answerObj = {
                answer: {
                    answer: answer,
                    passed: isCorrect,
                    question: state.prompt,
                    target: target
                }
            }
            // TODO END <-------------- MOVE TO ITS OWN OBJECT---------------------------------------

            // submit answer to page
            PageActions.answer(answerObj);
        }
    },

    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;
        var title = page.title;
        var sources = self.state.sources;
        var media = state.media;
        var feedbackElement = "";

        // construct media container
        var mediaContainer = "";
        if (media) {
            mediaContainer = (
                <div className="infoMediaContainer">
                    {media}
                </div>
            );
        }

        if(state.haveAnswered && !self.state.isQuestionaire && !state.isQuizPage) {
            feedbackElement = state.answerFeedback
        }

        var choices;
        var _this = this;
        choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            return (<li key={page.xid + String(index)} className="list-group-item multiple-choice-list-group-item" >
                        <div className="checkbox multiple-choice-checkbox">
                            <label>
                                <input type="checkbox" className="multiple-choice-checkbox" value={ans} onClick={_this.answerChange.bind(_this, ans)}>{ans}</input>
                            </label>
                        </div>
                    </li>);
        });


        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="container">
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                        </div>
                        <div>
                            {mediaContainer}
                        </div>
                        <div className="row">
                            <ul className="list-group multiple-choice-choices-container">
                                {choices}
                            </ul>
                        </div>
                        <div className="row">
                            {feedbackElement}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if(this.isMounted()) {
            this.setState(getPageState());
        }
    }
});

module.exports = MultipleChoiceView;