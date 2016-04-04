var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        prompt: "",
        volume: SettingsStore.voiceVolume(),
        answerState: [],
        draggedItemLetter: "",
        draggedItemTarget: "",
        isGraded: false,
        numMoved: 0
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.prompt = props.page.prompt.text;
        data.page = props.page;

        props.page.matchSource.map(function(item, index){
          //  var label = item.nut.uttering.utterance.native.text;
          //  data.answerState.push({label: label, isMoved: false, currentBox: "", correctBox: item.letter});
            var mediaType = "audio";
            var letter = item.letter;
            var displayField = "";
            var uttering = item.nut.uttering;
            var utterance = uttering.utterance;
            var passedData = "";

            if(uttering.media){
                mediaType = uttering.media[0].type;
            }else{
                mediaType = "string";
                if(utterance.ezread.text != ""){
                    displayField = "ezread";
                    passedData = utterance.ezread.text;
                }else if(utterance.translation.text != ""){
                    displayField = "translation";
                    passedData = utterance.translation.text;
                }else if(utterance.native.text != ""){
                    displayField = "native";
                    passedData = utterance.native.text;
                }else{
                    displayField = "phonetic";
                    passedData = utterance.phonetic.text;
                }
            }

            data.answerState.push({letter: letter, isMoved: false, currentBox: "", mediaType: mediaType, displayField: displayField, passedData: passedData});
        });
    }

    return data;
}

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

var MatchItemView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    onDragging: function(e){
        e.dataTransfer.setData('text/plain', 'anything');
        var self = this;
        var state = self.state;
        var draggedItemLetter = "";
        var draggedItemTarget = "";

        if(state.numMoved != state.answerState.length && $(e.target).css("opacity") != 0.3) {
            if (e.target) {
                draggedItemLetter = $(e.target).attr("data");
                draggedItemTarget = e.target;
            }
        }else{
            draggedItemLetter = "";
            draggedItemTarget = "";
        }

        self.setState({
            draggedItemLetter: draggedItemLetter,
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
        var draggedItemLetter = state.draggedItemLetter;
        var dropLocation = "";

        switch($(e.target).attr("class")){
            case "match-item-answer-drop-area thumbnail":
                dropLocation = $(e.target).attr("data-letter");
                break;
            default:
                //if($(e.target).parent().attr("class") == "match-item-answer-drop-area"){
                //    dropLocation = $(e.target).parent().attr("data-letter");
                //}
        }

        var itemFound = false;
        if(state.numMoved != state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemLetter != "" && dropLocation != "") {
                answerState.map(function (item) {
                    if (draggedItemLetter == item.letter) {
                        item.currentBox = dropLocation;
                        item.isMoved = true;
                        if ($($(draggedItemTarget).parent()).attr("class") == "match-item-choices-container thumbnail") {
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

        if($($(e.target).parent()).attr("class") == "match-item-choices-container"){
            answerState.map(function(item){
                if($(e.target).attr("data") == item.passedData){
                    if(item.isMoved){
                        playable = false;
                    }
                }
            });
        }

        if(playable) {
            playAudio($(e.target).attr("data"));
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

        $(".match-item-play-icon").each(function(i, item){
            $(item).css("opacity", "1.0");
        });

        self.setState({
            numMoved: 0,
            answerState: answerState
        });
    },

    componentWillMount: function() {
        //PageStore.removeChangeListener(this._onChange);
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
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
        var correct = "glyphicon MI-feedback MI-correct glyphicon-ok-circle";
        var incorrect = "glyphicon MI-feedback MI-incorrect glyphicon-remove-circle";
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
                button = <button className="btn-primary MI-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }else{

            }
        }

        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn-default MI-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }

        // check the matchsource media type, if audio then do the generic play image, else load specific image

        choices = state.answerState.map(function(item, index){
            var draggable = "";
            // if(audio)
            switch(item.mediaType){
                case "audio":
                    var zid = item.nut.uttering.media[0].zid;
                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
                            data={zid}
                            className="match-item-play-icon"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onClick}>
                            <span className="glyphicon glyphicon-play-circle"></span>
                        </div>
                    </li>;
                    break;
                case "image":
                    break;
                case "string":
                    // the letter of the answer in current answer Container
                    var answerLetter = item.letter;
                    var displayField = item.displayField;
                    // convert letter to int, this will be used to access the matchSource array
                    var matchSourceEquivalentIndex = answerLetter.charCodeAt(0)-65;
                    // get the display field of the media object associated with this answer
                    var text = item.passedData;

                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
                            data={answerLetter}
                            className="match-item-text-choice"
                            draggable="true"
                            onDragStart={self.onDragging}>
                            {text}
                        </div>
                    </li>;
                    break;
                default:
                // this shouldn't be reached unless you are moving videos
            }

            return (draggable);
        });

        answerContainers = state.page.matchTarget.map(function(item, index){
            // for each Answer Area...
            var answerPrompt = item.nut.uttering.utterance.translation.text;
            // prompt should be whatever text it decides is appropriate, i.e. native/ezread/phonetic/translation

            var letter = item.letter;
            var answerRender = "";
            var feedback = "";
            var needCheck = state.numMoved == answerState.length;

            for(var i=0;i<state.answerState.length;i++){
                // loop through the answerState array
                if(letter == state.answerState[i].currentBox) { // if there is an answer in this box

                    if (needCheck) { // does it need to be graded?
                        if (state.answerState[i].currentBox == state.answerState[i].letter) { // if correct
                            feedback = correct;
                        } else {
                            feedback = incorrect;
                        }
                    }

                    // check the matchsource media type, if audio then do the generic play image, else load specific image
                    switch (state.answerState[i].mediaType) {
                        case "audio":
                            // the letter of the answer in current answer Container
                            var answerLetter = state.answerState[i].letter;
                            // convert letter to int, this will be used to access the matchSource array
                            var matchSourceEquivalentIndex = answerLetter.charCodeAt(0) - 65;
                            // get the Zid of the media object associated with this answer
                            var matchSourceEquivalentZid = state.page.matchSource[matchSourceEquivalentIndex].nut.uttering.media[0].zid;
                            answerRender = <div
                                    data={matchSourceEquivalentZid}
                                    className="match-item-play-icon"
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    onClick={self.onClick}>
                                    <span className="glyphicon glyphicon-play-circle"></span>

                                    <div className={feedback}></div>
                                </div>;
                            break;
                        case "image":
                            // todo: image
                            break;
                        case "string":
                            // the letter of the answer in current answer Container
                            var answerLetter = state.answerState[i].letter;
                            var displayField = state.answerState[i].displayField;
                            // convert letter to int, this will be used to access the matchSource array
                            var matchSourceEquivalentIndex = answerLetter.charCodeAt(0) - 65;
                            // get the display field of the media object associated with this answer
                            var matchSourceEquivalentText = "";

                            switch (displayField) {
                                case "ezread":
                                    matchSourceEquivalentText = state.page.matchSource[matchSourceEquivalentIndex].nut.uttering.utterance.ezread.text;
                                    break;
                                case "native":
                                    matchSourceEquivalentText = state.page.matchSource[matchSourceEquivalentIndex].nut.uttering.utterance.native.text;
                                    break;
                                case "phonetic":
                                    matchSourceEquivalentText = state.page.matchSource[matchSourceEquivalentIndex].nut.uttering.utterance.phonetic.text;
                                    break;
                                case "translation":
                                    matchSourceEquivalentText = state.page.matchSource[matchSourceEquivalentIndex].nut.uttering.utterance.translation.text;
                                    break;
                                default:
                                    matchSourceEquivalentText = "Expected Text Not Found."
                            }

                            answerRender = (
                                <div
                                    className="match-item-text-choice"
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    >
                                    {matchSourceEquivalentText}
                                    <div className={feedback}></div>
                                </div>
                            );
                            break;
                        default:
                        // this shouldn't be reached unless you are moving videos
                    }
                }
            }

            return (<li key={page.xid + String(index)} className="match-item-answer" key={"answer-"+index}>
                <div className="content">
                    <div className="row match-item-answer-row">
                        <div className="col-md-2">
                            <div className="match-item-answer-drop-area thumbnail"
                                 data-letter={letter}
                                 onDragOver={self.onDraggingOver}
                                 onDrop={self.onDropping}>
                                {answerRender}
                            </div>
                        </div>
                        <div className="col-md-10">
                            <div className="match-item-answer-prompt">{answerPrompt}</div>
                        </div>
                    </div>
                </div>
            </li>);
        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <div className="container">
                        <audio id="audio" volume={this.state.volume}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="row">
                            <h4 className="match-item-prompt">{state.prompt}</h4>
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <ul className="match-item-choices-container">{choices}</ul>
                            </div>
                            <div className="col-md-10">
                                <ul className="match-item-answers-container">
                                    {answerContainers}
                                </ul>
                            </div>
                        </div>
                        <div className="row">
                            <div className="match-item-buttons">{button}</div>
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