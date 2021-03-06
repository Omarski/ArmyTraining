var React = require('react');
var CoachFeedbackView = require('../../widgets/CoachFeedbackView');
var InfoTagConstants = require('../../../constants/InfoTagConstants');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var ImageCaption = require('../../widgets/ImageCaption');
var Utils = require('../../widgets/Utils');
var SettingsStore = require('../../../stores/SettingsStore');

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
        isQuizPage: false,
        bShuffle: true
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.answers = props.page.answer;
        data.prompt = props.page.prompt.text;

        if (data.page.info && data.page.info.property) {

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
                        <video id="video" controls autoPlay={SettingsStore.autoPlaySound()} volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
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

var MultipleChoiceView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentDidMount: function() {
        // only in a quiz for now
        if (this.state.isQuizPage) {
            // load previous selected answer for this page
            var previousAnswer = PageStore.getPageAnswer();
            if (previousAnswer !== null && previousAnswer.answer !== null) {
                // mark answer that matches
                $(".multiple-choice-checkbox").each(function () {
                    // TODO change to not assume it is the translation channel
                    if (this.value && (this.value === previousAnswer.answer.nut.uttering.utterance.translation.text)) {
                        this.checked = true;
                    }
                });

            } else {
                // save no answer
                var saveAnswerFun = this.saveAnswer;
                setTimeout(function() {
                    saveAnswerFun(null, null);
                }, 0.1);
            }
        }
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    answerChange: function(answer) {
        var self = this;
        var state = this.state;
        var audio = document.getElementById('mainViewAudio');
        var source = document.getElementById('mainViewMp3Source');

        // for the answer you clicked, get it's feedback
        var feedbackText = (answer.feedback && answer.feedback.text) ? answer.feedback.text : "";
        var feedback = (<CoachFeedbackView text={feedbackText} isCorrect={answer.correct} />);

        // update state
        self.setState({
            haveAnswered: true,
            answerFeedback: feedback
        });

        // for now only record if its a quiz page
        if (state.isQuizPage) {
            this.saveAnswer(answer, answer.correct);

            source.src = "data/media/Click01a.mp3";
        } else {
            /* trigger audio */
            if (source) {
                if(answer.correct){
                    source.src = "data/media/Correct.mp3";
                }else{
                    source.src = "data/media/Incorrect.mp3";
                }
            }
        }
        if(audio && source) {
            audio.load();
            audio.play();
            audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
        }
    },

    saveAnswer: function(answerObj, correct) {
        var state = this.state;
        var answerCorrect = false;

        if (correct === true) {
            answerCorrect = true;
        }

        // TODO <-------------- MOVE TO ITS OWN OBJECT------------------------------------------
        // create new answer object
        var answerObj = {
            answer: {
                answer: answerObj,
                passed: answerCorrect,
                question: state.prompt,
                target: state.correctAnswer
            }
        };
        // TODO END <-------------- MOVE TO ITS OWN OBJECT---------------------------------------

        // submit answer to page
        PageActions.answer(answerObj);
    },

    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;

        if (!page) {
            return (<div></div>);
        }

        var title = page.title;
        var sources = self.state.sources;
        var media = state.media;
        var feedbackElement = "";
        var chapterId = PageStore.chapter().xid;

        // construct media container
        var mediaContainer = "";
        if (media) {
            mediaContainer = (
                <div className="infoMediaContainer">
                    {media}
                </div>
            );
        }

        if(state.haveAnswered && !state.isQuizPage) {
            feedbackElement = state.answerFeedback;
        }

        var choices;
        choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            function containsAllAscii(str) {
                return  /^[\000-\177]*$/.test(str) ;
            }

            var bigFontNonAscii = {};


            if(!containsAllAscii(ans)){
                // !ans.match(/[\u2018\u2019]/g) <------- checks for a unicode apostrophe
                    if(!ans.match(new RegExp(/[a-z]/i))){
                        bigFontNonAscii = {fontSize: "20px"};
                    }
            }

            // TODO: allow for the text to be any of the text channels
            return (<li key={chapterId + page.xid + String(index)} className="list-group-item multiple-choice-list-group-item" >
                        <div className="checkbox multiple-choice-checkbox">
                            <label className="multiple-choice-label-remove-padding-left" style={bigFontNonAscii}>
                                <input type="radio" name="question" aria-label={ans} className="multiple-choice-checkbox multiple-choice-radio multiple-choice-input-padding-right" value={ans} onClick={self.answerChange.bind(self, item)}></input>
                                {ans}
                            </label>
                        </div>
                    </li>);
        });

        var multipleChoiceMedia = "";

        if (document.documentMode && (document.documentMode === 9)){
            if(media){
                multipleChoiceMedia = (
                    <div className="multiple-choice-flex ie-nine-class-multiple-choice">
                        <div className="col-md-4 col-sm5 col-xs-12">
                        {mediaContainer}
                        </div>
                        <div className="multiple-choice-row-container-ie col-md-8 col-sm-7">
                            <div className="mc-choices-and-feedback-container">
                                <div className="row multiple-choice-row-ie">
                                    <ul className="list-group multiple-choice-choices-container list-group-item-mobile">
                                        {choices}
                                    </ul>
                                </div>
                                <div className="row multiple-choice-row-ie">
                                    {feedbackElement}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                multipleChoiceMedia = (
                    <div className="multiple-choice-flex">
                        <div>
                        {mediaContainer}
                        </div>
                        <div className="multiple-choice-row-container-ie">
                            <div className="mc-choices-and-feedback-container">
                                <div className="row multiple-choice-row-ie">
                                    <ul className="list-group multiple-choice-choices-container list-group-item-mobile">
                                        {choices}
                                    </ul>
                                </div>
                                <div className="row multiple-choice-row-ie">
                                    {feedbackElement}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

        } else {
            multipleChoiceMedia = (
                    <div className="multiple-choice-flex">
                        <div>
                            {mediaContainer}
                        </div>
                        <div className="multiple-choice-row-container">
                            <div className="mc-choices-and-feedback-container">
                                <div className="row multiple-choice-row">
                                    <ul className="list-group multiple-choice-choices-container list-group-item-mobile">
                                        {choices}
                                    </ul>
                                </div>
                                <div className="row multiple-choice-row">
                                    {feedbackElement}
                                </div>
                            </div>
                        </div>
                    </div>
            );
        }

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="multiple-choice-container">
                        <div>
                            <h4 className="multi-choice-header-mobile-margin">
                                {state.prompt}
                            </h4>
                        </div>
                        {multipleChoiceMedia}
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
            this.setState(getPageState(this.props));
        }
    }
});

module.exports = MultipleChoiceView;