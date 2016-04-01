var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');

// updated classNames to be lowercase
function getPageState(props) {
    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        prompt: "",
        volume: SettingsStore.voiceVolume(),
        answerState: [],
        draggedItemData: "",
        draggedItemTarget: "",
        isGraded: false,
        numMoved: 0
    } ;

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.prompt = props.page.prompt.text;
        data.page = props.page;

        props.page.matchSource.map(function(item, index){
            var label = item.nut.uttering.utterance.native.text;
            data.answerState.push({label: label, isMoved: false, currentBox: "", correctBox: item.letter});

        });
    }

    return data;
}

// Plays Audio filed named with the zid given
function playAudio(zid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + zid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
    }else{
        audio.pause();
    }

}

var OrderingView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    onDragging: function(e){
        e.dataTransfer.setData('text/plain', 'anything');
        var self = this;
        var state = self.state;
        var draggedItemData = "";
        var draggedItemTarget = "";

        if(state.numMoved != state.answerState.length && $(e.target).css("opacity") != 0.3) {
            if (e.target) {
                draggedItemData = $(e.target).attr("data");
                draggedItemTarget = e.target;
            }
        }else{
            draggedItemData = "";
            draggedItemTarget = "";
        }

        self.setState({
            draggedItemData: draggedItemData,
            draggedItemTarget: draggedItemTarget
        });
    },

    onDraggingOver: function(e){
        e.preventDefault();
        e.stopPropagation();
    },

    onDropping: function(e){
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        var state = self.state;
        var numMoved = state.numMoved;
        var answerState = state.answerState;
        // {label: label, isMoved: false, currentBox: ""}

        // get dragged item
        var draggedItemTarget = state.draggedItemTarget;
        var draggedItemData = state.draggedItemData;

        var dropLocation = "";

        //TODO: don't allow more than 1 answer
        switch($(e.target).attr("class")){
            case "or-answer-dropArea":
                dropLocation = $(e.target).attr("data-letter");
                break;
            default:
            //if($(e.target).parent().attr("class") == "OR-answer-dropArea"){
            //    dropLocation = $(e.target).parent().attr("data-letter");
            //}
        }

        var itemFound = false;
        if(state.numMoved != state.answerState && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemData != "" && dropLocation != "") {
                answerState.map(function (item) {
                    if (draggedItemData == item.label) {
                        item.currentBox = dropLocation;
                        item.isMoved = true;
                        if ($($(draggedItemTarget).parent()).attr("class") == "or-choices-container") {
                            $(draggedItemTarget).css("opacity", "0.3");
                            numMoved++;
                        }
                        itemFound = true;
                    }
                });
            }
        }

        self.setState({
            answerState: answerState,
            numMoved: numMoved
        })
    },

    onClick: function(e){
        var self = this;
        var state = self.state;
        var playable = true;
        var answerState = state.answerState;

        if($($(e.target).parent()).attr("class") == "or-choices-container"){
            answerState.map(function(item){
                if($(e.target).attr("data") == item.label){
                    if(item.isMoved){
                        playable = false;
                    }
                }
            });
        }

        if(playable) {
            state.page.matchSource.map(function (item) {
                uttering = item.nut.uttering;
                if ($(e.target).attr("data") == uttering.utterance.native.text) {
                    if(uttering.media){
                        playAudio(uttering.media[0].zid);
                    }
                }
            });
        }
    },

    reset: function() {
        var self = this;
        var state = self.state;
        var answerState = state.answerState;

        answerState.map(function (item) {
            item.isMoved = false;
            item.currentBox = "";
        });

        $(".or-playicon").each(function(i, item){
            $(item).css("opacity", "1.0");
        });

        self.setState({
            numMoved: 0,
            answerState: answerState
        });
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var button = "";
        var choices;
        var answerState = state.answerState;
        var numQuestions = answerState.length;
        var correct = "glyphicon or-feedback or-correct glyphicon-ok-circle";
        var incorrect = "glyphicon or-feedback or-incorrect glyphicon-remove-circle";
        var answerContainers;

        var isGraded = state.isGraded;
        var numMoved = state.numMoved;

        if(numMoved == numQuestions){
            var isCorrect = true;
            // check if correct and update accordingly

            for(var i = 0; i < answerState.length; i++){
                if(answerState[i].currentBox != answerState[i].correctBox){
                    isCorrect = false;
                    break;
                }
            }

            if(!isCorrect) {
                button = <button className="btn-primary or-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }else{

            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn-default or-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }

        choices = state.page.matchSource.map(function(item, index){

            //TODO: if(item is an image) return below, else construct other type

            return (<img key={page.xid +"choice-"+index}
                         src={"./data/media/myPlay.jpg"}
                         data={item.nut.uttering.utterance.native.text}
                         className="or-playicon"
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
            </img>);
        });

        answerContainers = state.page.matchTarget.map(function(item, index){
            var answerPrompt = item.nut.uttering.utterance.translation.text;
            var letter = item.letter;
            var answerRender = "";
            var feedback = "";
            var needCheck = state.numMoved == answerState.length;

            for(var i=0;i<state.answerState.length;i++){
                if(letter == state.answerState[i].currentBox){

                    if(needCheck){
                        if(state.answerState[i].currentBox == state.answerState[i].correctBox){
                            feedback = correct;
                        }else{
                            feedback = incorrect;
                        }
                    }

                    answerRender = <div src={"./data/media/myPlay.jpg"}
                                        data={state.answerState[i].label}
                                        className="or-playicon"
                                        draggable="true"
                                        onDragStart={self.onDragging}
                                        onClick={self.onClick}>
                        <img className="or-image" src={"./data/media/myPlay.jpg"}></img>
                        <div className={feedback}></div>
                    </div>;
                }
            }
            return(<div className = "or-answer" key={page.xid + "answer-"+index}>
                <div className="or-answer-prompt">{answerPrompt}</div>
                <div className="or-answer-dropArea"
                     data-letter={letter}
                     onDragOver={self.onDraggingOver}
                     onDrop={self.onDropping}>
                    {answerRender}
                </div>
            </div>);
        });

        return (
            <div className="or-container">
                <PageHeader sources={sources} title={title} key={page.xid}/>
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="or-prompt">{state.prompt}</div>
                <div className="or-buttons-container">{button}</div>
                <div className="or-choices-container">{choices}</div>
                <div className="or-answers-container">
                    {answerContainers}
                </div>
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

module.exports = OrderingView;