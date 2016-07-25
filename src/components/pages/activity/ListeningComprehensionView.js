var React = require('react');
var CoachFeedbackView = require('../../widgets/CoachFeedbackView');
var ClosedCaption = require('../../widgets/ClosedCaption');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var LocalizationStore = require('../../../stores/LocalizationStore');
var PageActions = require('../../../actions/PageActions');
var PageHeader = require('../../widgets/PageHeader');

var LC_PLAY_ICON = " glyphicon glyphicon-play-circle";
var LC_STOP_ICON = " fa fa-stop-circle-o";

function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        sources: [],
        image: "",
        prompt: "",
        imageCaption: "",
        haveListened: false,
        haveAnswered: false,
        isCorrect: false,
        isListening: false,
        isQuizPage: false,
        answers: [],
        correctAnswer: "",
        answerFeedback: "No Answer Selected.",
        transcript: "",
        addClickComplete: false
    };

    var imageZid = "";

    // set if quiz page
    data.isQuizPage = PageStore.isQuizPage();

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        imageZid = props.page.media[0].zid;
        data.prompt = props.page.prompt.text;
        data.answers = props.page.answer;
        if(props.page.question && props.page.question.utterance && props.page.question.utterance.translation){
            data.transcript = props.page.question.utterance.translation.text;
        }
        props.page.answer.map(function(item){
            if(item.correct === true){
                data.correctAnswer = item.nut.uttering.utterance.translation.text;
            }
        });
    }

    data.answers = AGeneric().shuffle(data.answers);

    if(imageZid != ""){
        data.image = "./data/media/" + imageZid + ".jpg";
        if(props.page.media && props.page.media[0].info && props.page.media[0].info.property){
            props.page.media[0].info.property.map(function(item){
                // imagination may not be the final description name
                if(item.name === "imagination"){
                    data.imageCaption = item.value;
                }
            });
        }
    }


    return data;
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
    }else{
        audio.pause();
    }

}

function getFeedback(answers, selectedAnswer){
    var getter = "getFeedback could not find selected Answer.";
    answers.map(function(item){
        var translation = item.nut.uttering.utterance.translation;
        if(selectedAnswer == translation.text){
            getter = item.feedback.text;
        }
    });
    return(getter);
}

var ListeningComprehensionView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        SettingsStore.addChangeListener(this._onSettingsChange);
    },

    componentDidMount: function() {

        //SettingsStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        var self = this;
        var state = this.state;
        var selectedAns = null;
        var haveAnswered = false;
        var isCorrect = false;
        var feedback = state.answerFeedback;
        var target = state.correctAnswer;
        if(!state.addClickComplete) {
            $(".listening-comp-checkbox").click(function (e) {
                selectedAns = e.target.value;
                haveAnswered = true;
                $(".listening-comp-checkbox").each(function () {
                    if (this.value == selectedAns) {
                        this.checked = true;
                        isCorrect = (selectedAns == target);
                        feedback = (<CoachFeedbackView text={getFeedback(state.answers, selectedAns)} isCorrect={isCorrect} />);
                    } else {
                        this.checked = false;
                    }
                });

                // record if is a quiz page
                if (state.isQuizPage) {
                    // create new answer object
                    var answerObj = {
                        answer: {
                            answer: selectedAns,
                            passed: isCorrect,
                            question: state.prompt,
                            target: state.correctAnswer
                        }
                    };

                    // submit answer to page
                    PageActions.answer(answerObj);
                }else{
                    /* trigger audio */
                    var audio = document.getElementById('mainViewAudio');
                    var source = document.getElementById('mainViewMp3Source');
                    if (source) {
                        if(isCorrect){
                            source.src = "data/media/Correct.mp3";
                        }else{
                            source.src = "data/media/Incorrect.mp3";
                        }
                    }
                    if(audio && source) {
                        audio.load();
                        audio.play();
                        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
                    }
                }

                self.setState({
                    haveAnswered: haveAnswered,
                    isCorrect: isCorrect,
                    answerFeedback: feedback,
                    addClickComplete: true
                });
            });
        }
    },

    handleClick: function(){
        var self = this;
        var state = self.state;

        if(state.isQuizPage){
            var audio = document.getElementById('mainViewAudio');
            var source = document.getElementById('mainViewMp3Source');

            if (source) {
                source.src = "data/media/Click01a.mp3";
            }

            if(audio && source) {
                audio.load();
                audio.play();
                audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            }
        }
    },

    listenCheck: function(){
        // play the audio prompt from the click to listen box
        //find the zid of the audio
        var self = this;
        var zid = 0;
        if(self.state && self.state.page){
            if(self.state.page.media){

            }
            zid = self.state.page.question.media[0].zid || 0;
        }

        if(zid && zid !== 0){
            if(self.state.isListening){
                self.setState({
                    isListening: false
                });
                playAudio(zid);
            }else{
                self.setState({
                    isListening: true
                });
                playAudio(zid);
                $("#audio").bind('ended', function(){
                    self.setState({
                        haveListened: true,
                        isListening: false
                    });
                });
            }
        }
    },

    componentWillUnmount: function() {
        SettingsStore.removeChangeListener(this._onSettingsChange);
    },
    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;
        var title = page.title;
        var sources = self.state.sources;
        var feedbackElement = "";
        var playButtonIcon = self.state.isListening ? LC_STOP_ICON : LC_PLAY_ICON;
        // if answered added coach feedback
        if(state.haveAnswered && !state.isQuizPage) {
            feedbackElement = state.answerFeedback
        }

        var cc = "";
        if (state.transcript !== "") { // add transcript of audio for 508 compliance
            cc = (
                <div>
                    <ClosedCaption transcript={state.transcript}/>
                </div>
            );
        }

        var choices;
        choices = state.answers.map(function(item, index){
            var ans = "";
            if(item.nut && item.nut.uttering && item.nut.uttering.utterance){
                var utterance = item.nut.uttering.utterance;
                if(utterance.ezread && utterance.ezread.text !== ""){
                    ans = utterance.ezread.text;
                }else if(utterance.translation && utterance.translation.text !== ""){
                    ans = utterance.translation.text;
                }else if(utterance.native && utterance.native.text !== ""){
                    ans = utterance.native.text;
                }else if (utterance.phonetic && utterance.phonetic.text !== ""){
                    ans = utterance.phonetic.text;
                }
            }

            return (<li key={page.xid + String(index)} className="list-group-item" >
                        <div class="checkbox">
                            <label>
                                    <input title={ans} alt={ans} aria-label={ans} type="radio" onClick={self.handleClick} className="listening-comp-checkbox listening-comp-radio" value={ans}>
                                    </input>
                                {ans}
                            </label>
                        </div>
                    </li>);
        });

        var question = "";
        var interactionColumn = "col-md-6";
        if(state.haveListened){
            question = (
                <div className="col-md-6">
                    <div className="container-fluid">
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                        </div>
                        <div className="listening-comp-prompt">
                            <button title={LocalizationStore.labelFor("tools", "btnListen")}
                                    alt={LocalizationStore.labelFor("tools", "btnListen")}
                                    type="button"
                                    onClick={self.listenCheck}
                                    className="btn btn-default btn-lg btn-link btn-step btn-clk btn-lc-btn"
                                    aria-label={LocalizationStore.labelFor("tools", "btnListen")}>
                                <span className={"btn-icon lc-glyphicon" + playButtonIcon} aria-hidden="true"></span>
                            </button>
                        </div>
                        <div className="row">
                            <ul className="list-group listening-comp-choices-container">
                                {choices}
                            </ul>
                        </div>
                        <div className="row">
                            {feedbackElement}
                        </div>
                    </div>
                </div>
            );
        }else{
            // right side before user listens to the question
            question = (
                <div className="col-md-6">
                    <div className="container-fluid">
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                            <div className="listening-comp-prompt">
                                <button title={LocalizationStore.labelFor("tools", "btnListen")}
                                        alt={LocalizationStore.labelFor("tools", "btnListen")}
                                        type="button"
                                        onClick={self.listenCheck}
                                        className="btn btn-default btn-lg btn-link btn-step btn-clk btn-lc-btn"
                                        aria-label={LocalizationStore.labelFor("tools", "btnListen")}>
                                    <span className={"btn-icon lc-glyphicon" + playButtonIcon} aria-hidden="true"></span>
                                </button>
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
                    <div className="container">
                        {cc}
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="row">
                            <div className={interactionColumn}>
                                <div className="container-fluid">
                                    <div className="listening-comp-interaction-container">
                                        <img title={this.state.imageCaption} alt={this.state.imageCaption} aria-label={this.state.imageCaption} className="row listening-comp-image" src={state.image}></img>

                                    </div>
                                </div>
                            </div>
                            {question}
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
        this.setState(getPageState());
    },
    _onSettingsChange: function(){
        this.setState({
            updated: true
        });
    }
});

module.exports = ListeningComprehensionView;