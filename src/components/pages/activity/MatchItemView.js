var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


function getPageState(props) {
    var data = {
        page: "",
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

var MatchItemView = React.createClass({
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

        //if(state.numMoved != state.answerState.length && $(e.target).css("opacity") != 0.3) {
        //    if (e.target) {
        //        draggedItemData = $(e.target).attr("data");
        //        draggedItemTarget = e.target;
        //    }
        //}else{
        //    draggedItemData = "";
        //    draggedItemTarget = "";
        //}

        //console.log("dragging: ");
        //console.log($(e.target).attr("data"));

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

        //console.log("dropping on class: ");
        //console.log($(e.target).attr("class"));
        //console.dir(draggedItemTarget);
        //console.log($(e.target).parent().attr("class"));

        //switch($(e.target).attr("class")){
        //    case "MI-columnA-dropArea":
        //        dropLocation = "A";
        //        break;
        //    case "MI-columnB-dropArea":
        //        dropLocation = "B";
        //        break;
        //    default:
        //        if($(e.target).parent().attr("class") == "MI-columnA-dropArea"){
        //            dropLocation = "A";
        //        }
        //        if($(e.target).parent().attr("class") == "MI-columnB-dropArea"){
        //            dropLocation = "B";
        //        }
        //}

        //var itemFound = false;
        //if(state.numMoved != state.answerState && $(draggedItemTarget).css("opacity") != 0.3) {
        //    if (draggedItemData != "" && dropLocation != "") {
        //        answerState.map(function (item) {
        //            if (draggedItemData == item.label) {
        //                item.currentBox = dropLocation;
        //                item.isMoved = true;
        //                if ($($(draggedItemTarget).parent()).attr("class") == "MI-choices-container") {
        //                    $(draggedItemTarget).css("opacity", "0.3");
        //                    numMoved++;
        //                }
        //                itemFound = true;
        //            }
        //        });
        //    }
        //}

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

        // console.dir($($(e.target).parent()).attr("class"));
        if($($(e.target).parent()).attr("class") == "MI-choices-container"){
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
                    playAudio(uttering.media[0].zid);
                }
            });
        }

        //zid = $(e.target.parentElement).attr("data-question-zid");
        //playAudio(zid);
        //console.dir($(e.target).attr("data"));
    },

    reset: function() {
        var self = this;
        var state = self.state;
        var answerState = state.answerState;

        answerState.map(function (item) {
            item.isMoved = false;
            item.currentBox = "";
        });

        //$(".MI-playicon").each(function(i, item){
        //    $(item).css("opacity", "1.0");
        //});

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
        var button = "";
        var choices;
        var answerState = state.answerState;
        var numQuestions = answerState.length;
        var colATitle = "a little column A";
        var colAContent = [];
        var colARender;
        var colBTitle = "a little column B";
        var colBContent = [];
        var colBRender;
        var correct = "glyphicon MI-feedback MI-correct glyphicon-ok-circle";
        var incorrect = "glyphicon MI-feedback MI-incorrect glyphicon-remove-circle";

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
                button = <button className="btn-primary MI-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }else{

            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn-default MI-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }

        choices = state.page.matchSource.map(function(item, index){
            return (<img key={"choice-"+index}
                         src={"./data/media/myPlay.jpg"}
                         data={item.nut.uttering.utterance.native.text}
                         className="MI-playicon"
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
            </img>);
        });

        // get the prompt for each answer, it will act as a different box like the sort page

        // render all the answer boxes if they have something in them. "simpler" because only 1 item in each box.
        // maybe turn each column into an answer container. Make a dynamic list of them. only added code is to prevent
        // more than one item being dropped.
        return (
            <div className="MI-container">
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="MI-prompt">{state.prompt}</div>
                <div className="MI-buttons-container">{button}</div>
                <div className="MI-choices-container">{choices}</div>
                <div className="MI-answers-container">
                    <div className="MI-columnA">
                        <div className="MI-columnA-title">{colATitle}</div>
                        <div className="MI-columnA-dropArea"
                             onDragOver={self.onDraggingOver}
                             onDrop={self.onDropping}>
                            {colARender}
                        </div>
                    </div>

                    <div className="MI-columnB">
                        <div className="MI-columnB-title">{colBTitle}</div>
                        <div className="MI-columnB-dropArea"
                             onDragOver={self.onDraggingOver}
                             onDrop={self.onDropping}>
                            {colBRender}
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
    }
});

module.exports = MatchItemView;