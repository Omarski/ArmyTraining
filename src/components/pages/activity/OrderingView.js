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
        answerState: [],
        draggedItemLetter: "",
        draggedItemTarget: "",
        draggedItemData: "",
        isGraded: false,
        numMoved: 0
    } ;

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
            var uttering = "";
            var utterance = "";
            var passedData = "";

            if(item.nut){
                uttering = item.nut.uttering;
                utterance = uttering.utterance;

                if(uttering.media){
                    mediaType = uttering.media[0].type;
                    passedData = uttering.media[0].zid;
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
            }else if (item.media){
                mediaType = item.media.type;
                passedData = item.media.xid;
            }
            data.answerState.push({letter: letter, isMoved: false, currentBox: "", currentBoxIndex: -1, mediaType: mediaType, displayField: displayField, passedData: passedData});
        });
    }
    data.answerState = AGeneric().shuffle(data.answerState);
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
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
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
        var draggedItemLetter = "";
        var draggedItemTarget = "";

        if(state.numMoved != state.answerState.length && $(e.target).css("opacity") != 0.3) {
            if (e.target) {
                draggedItemLetter = $(e.target).attr("data");
                draggedItemTarget = e.target;
                draggedItemData = $(e.target).attr("data-passed");
            }
        }else{
            draggedItemLetter = "";
            draggedItemTarget = "";
            draggedItemData = "";
        }

        self.setState({
            draggedItemLetter: draggedItemLetter,
            draggedItemTarget: draggedItemTarget,
            draggedItemData: draggedItemData
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

        // get dragged item
        var draggedItemTarget = state.draggedItemTarget;
        var draggedItemLetter = state.draggedItemLetter;
        var draggedItemData = state.draggedItemData;
        var dropLocation = "";
        var dropLocationIndex = -1;

        switch($(e.target).attr("class")){
            case "or-answer-drop-area":
                //if(drop location isn't taken)
                var spotTaken = false;
                answerState.map(function(item){
                    if(item.currentBoxIndex === Math.floor($(e.target).attr("data-index")) ){
                        draggedItemLetter = "";
                        spotTaken = true;
                    }
                });
                if(!spotTaken){
                    dropLocation = $(e.target).attr("data-letter");
                    dropLocationIndex = Math.floor($(e.target).attr("data-index"));
                }
                break;
            default:
            //if($(e.target).parent().attr("class") == "OR-answer-dropArea"){
            //    dropLocation = $(e.target).parent().attr("data-letter");
            //}
        }

        if($(e.target).hasClass("or-text-choice") || $(e.target).hasClass("or-image") || $(e.target).hasClass("or-play-icon")) {
            if( !!$(draggedItemTarget).css("opacity")){
                if($(draggedItemTarget).parent().parent().hasClass("col-md-3") || $(draggedItemTarget).parent().parent().hasClass("or-answer")) {
                    answerState.map(function (item) {


                        if(draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.isMoved = false;
                            item.currentBox = "";
                            item.currentBoxIndex = -1;
                        }
                    });

                    $(".or-choices-container div").map(function(i, index){
                        if(index.attributes.getNamedItem("data-passed").value === draggedItemTarget.attributes.getNamedItem("data-passed").value ){
                            $(index).css("opacity", "1.0");
                            numMoved--;
                        }
                    });
                }
            }
        }

        var itemFound = false;
        if(state.numMoved !== state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemLetter !== "" && dropLocation !== "") {
                answerState.map(function (item) {
                    if(item.mediaType === "string"){
                        if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.currentBox = dropLocation;
                            item.currentBoxIndex = dropLocationIndex;
                            item.isMoved = true;
                            if ($(draggedItemTarget).parent().parent().attr("class") === "or-choices-container") {
                                $(draggedItemTarget).css("opacity", "0.3");
                                numMoved++;
                            }
                            itemFound = true;
                        }
                    }else{ // if ("image" || "audio")
                        if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.currentBox = dropLocation;
                            item.currentBoxIndex = dropLocationIndex;
                            item.isMoved = true;
                            if ($(draggedItemTarget).parent().parent().attr("class") === "or-choices-container") {
                                $(draggedItemTarget).css("opacity", "0.3");
                                numMoved++;
                            }
                            itemFound = true;
                        }
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
            item.currentBoxIndex = -1;
        });

        answerState = AGeneric().shuffle(answerState);

        // change class to be the container of the media object
        $(".or-choices-container div").each(function(i, item){
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

        if(numMoved === numQuestions){
            var isCorrect = true;
            // check if correct and update accordingly

            for(var i = 0; i < answerState.length; i++){
                if(answerState[i].currentBox !== answerState[i].letter){
                    isCorrect = false;
                    break;
                }
            }

            if(!isCorrect) {
                button = <button className="btn btn-action or-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }else{

            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn btn-action or-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }

        choices = state.answerState.map(function(item, index){
            var draggable = "";
            switch (item.mediaType){
                case "audio":
                    var zid = item.passedData;
                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
                            data-passed={item.passedData}
                            data={zid}
                            className="or-playicon"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onClick}>
                            <span className="glyphicon glyphicon-play-circle"></span>
                        </div>
                    </li>;
                    break;
                case "image":
                    var source = item.passedData;
                    var letter = item.letter;
                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
                            data-passed={item.passedData}
                            draggable="true"
                            data={letter}
                            onDragStart={self.onDragging}>
                            <img draggable="false" src={"data/media/"+source}></img>
                        </div>
                    </li>;
                    break;
                case "string":
                    // the letter of the answer in current answer Container
                    var answerLetter = item.letter;
                    var text = item.passedData;

                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
                            data-passed={item.passedData}
                            data={answerLetter}
                            className="or-text-choice"
                            draggable="true"
                            onDragStart={self.onDragging}>
                            {text}
                        </div>
                    </li>;
                    break;
                default:
                    // this shouldn't be reached unless you are moving videos, i hope
            }

            return (draggable);
        });

        answerContainers = state.page.matchTarget.map(function(item, index){
            var answerPrompt = item.nut.uttering.utterance.translation.text;
            var letter = item.letter;
            var answerRender = (<div className="or-drop-area-index">
                                    <span>
                                        {index + 1}
                                    </span>
                                </div>);
            var feedback = "";
            var needCheck = state.numMoved == answerState.length;

            for(var i=0;i<state.answerState.length;i++){
                if(index === state.answerState[i].currentBoxIndex){

                    if(needCheck){
                        if(state.answerState[i].currentBox == state.answerState[i].letter){
                            feedback = correct;
                        }else{
                            feedback = incorrect;
                        }
                    }

                    // check the matchsource media type, if audio then do the generic play image, else load specific image
                    switch (state.answerState[i].mediaType) {
                        case "audio":
                            answerRender = <div
                                data-passed={state.answerState[i].passedData}
                                data={state.answerState[i].passedData}
                                className="or-play-icon"
                                draggable="true"
                                onDragStart={self.onDragging}
                                onClick={self.onClick}>
                                <span className="glyphicon glyphicon-play-circle"></span>

                                <div className={feedback}></div>
                            </div>;
                            break;
                        case "image":
                            var source = answerState[i].passedData;
                            answerRender = <li key={page.xid + "choice-"+index}>
                                <div
                                    data-passed={source}
                                    draggable="true"
                                    onDragStart={self.onDragging}>
                                    <img draggable="false" src={"data/media/"+source}></img>
                                    <div className={feedback}></div>
                                </div>
                            </li>;
                            break;
                        case "string":
                            answerRender = (
                                <div
                                    data-passed={state.answerState[i].passedData}
                                    className="or-text-choice"
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    >
                                    {state.answerState[i].passedData}
                                    <div className={feedback}></div>
                                </div>
                            );
                            break;
                        default:
                        // this shouldn't be reached unless you are moving videos
                    }
                }
            }
            return(<li className = "or-answer" key={page.xid + "answer-"+index}>
                <div className="or-answer-prompt">{answerPrompt}</div>
                <div className="or-answer-drop-area"
                     data-letter={letter}
                     data-index={index}
                     onDragOver={self.onDraggingOver}
                     onDrop={self.onDropping}>
                    {answerRender}
                </div>
            </li>);
        });

        return (
            <div>
                <div className="or-container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <h4 className="or-prompt">{state.prompt}</h4>

                    <div className="container-fluid or-choice-answer-container">
                        <div className="row">
                            <ul className="or-choices-container"
                                onDragOver={self.onDraggingOver}
                                onDrop={self.onDropping}>
                                {choices}
                            </ul>
                        </div>
                        <div className="row">
                            <ul className="or-answers-container">
                                {answerContainers}
                            </ul>
                        </div>
                        <div className="row">
                            {button}
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

module.exports = OrderingView;