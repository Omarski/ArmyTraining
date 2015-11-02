var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        feedbackResponse: "",
        image: "",
        prompt: "",
        volume: SettingsStore.voiceVolume(),
        haveListened: false,
        haveAnswered: false,
        isCorrect: false,
        answers: []
    };

    var imageZid = "";

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        imageZid = props.page.media[0].zid;
        data.prompt = props.page.prompt.text;
        data.answers = props.page.answer;
    }

    data.answers = AGeneric().shuffle(data.answers);

    if(imageZid != ""){
        data.image = "./data/media/" + imageZid + ".jpg";
    }


    return data;
}

function listenCheck(self){
    // play the audio prmopt from the click to listen box
    var zid = self.state.page.question.media[0].zid;
    playAudio(zid);
    $("#audio").bind('ended', function(){
        self.setState({
            haveListened: true
        });
    });
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

var ListeningComprehensionView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //SettingsStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        var selectedAns = null;
        $(".LC-answers").click(function(e){
            selectedAns = e.target.value;
            if(e.target.className != "LC-answers disabled") {
                $(".LC-answers").each(function () {
                    this.checked = (this.value == selectedAns);
                    this.className = ("LC-answers disabled");
                });
            }else{
                $(".LC-answers").each(function () {
                    if(this.value == selectedAns){
                        this.checked = !this.checked;
                    }
                });
            }
        });
    },

    componentWillUnmount: function() {
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var response = state.feedbackResponse;
        var coach = "";
        var answerString = "";
        var feedbackClass = "glyphicon LC-glyphicon LC-feedback";
        var promptString = state.prompt;

        var responder = "";
        if(state.haveAnswered) {
            responder = <div>
                <div className="LC-coach">{coach}</div>
                <div className="LC-answerString">{answerString}</div>
                <div className="LC-response">{response}</div>
                <div className={feedbackClass}></div>
            </div>;
        }

        var choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;

            return (<input type="checkbox" className="LC-answers" value={ans}>{ans}</input>);
        });

        var question = "";
        if(state.haveListened){
            question = <div className="LC-ResponseContainer">
                <div className="LC-prompt">{promptString}</div>
                <div className="LC-answers-container">{choices}</div>
                {responder}
            </div>;
        }


        return (
            <div className="LC-container">
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="LC-InteractionContainer">
                    <img className="row LC-Image" src={state.image}></img>
                    <div className="LC-promptContainer" onClick={function(){listenCheck(self)}}>
                        Click to Listen
                    </div>
                </div>
                {question}
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = ListeningComprehensionView;