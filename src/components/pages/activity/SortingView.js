var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        page: "",
        title: "",
        sources: [],
        pageType: "",
        prompt: "",
        answerState: [],
        draggedItemLetter: "",
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
         //   var label = item.nut.uttering.utterance.native.text;
         //   data.answerState.push({label: label, isMoved: false, currentBox: "", correctBox: item.letter});
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
                    if(utterance.ezread && utterance.ezread.text != ""){
                        displayField = "ezread";
                        passedData = utterance.ezread.text;
                    }else if(utterance.translation && utterance.translation.text != ""){
                        displayField = "translation";
                        passedData = utterance.translation.text;
                    }else if(utterance.native && utterance.native.text != ""){
                        displayField = "native";
                        passedData = utterance.native.text;
                    }else if (utterance.phonetic && utterance.phonetic.text != ""){
                        displayField = "phonetic";
                        passedData = utterance.phonetic.text;
                    }
                }
            }else if (item.media){
                mediaType = item.media.type;
                passedData = item.media.xid;
            }

            data.answerState.push({letter: letter, isMoved: false, currentBox: "", mediaType: mediaType, displayField: displayField, passedData: passedData});
        });
    }

    data.answerState = AGeneric().shuffle(data.answerState);

    return data;
}

function playAudio(zid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + zid + ".mp3";
    //audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }else{
        audio.pause();
    }

}

var SortingView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    onDragging: function(e){
        //e.dataTransfer.setData('text/plain', 'anything');
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
            case "sorting-columnA-dropArea sorting-drop-area":
                dropLocation = "A";
                break;
            case "sorting-columnB-dropArea sorting-drop-area":
                dropLocation = "B";
                break;
            default:
                if($(e.target).parent().attr("class") == "sorting-columnA-dropArea sorting-drop-area"){
                    dropLocation = "A";
                }
                if($(e.target).parent().attr("class") == "sorting-columnB-dropArea sorting-drop-area"){
                    dropLocation = "B";
                }
        }
        var itemFound = false;
        if(state.numMoved != state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemLetter != "" && dropLocation != "") {
                answerState.map(function (item) {
                    if ($(draggedItemTarget)[0].innerHTML == item.passedData) {
                        item.currentBox = dropLocation;
                        item.isMoved = true;
                        if ($($(draggedItemTarget).parent()).attr("class") == "sorting-choices-container-text choice") {
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

        if($($(e.target).parent()).attr("class") == "sorting-choices-container"){
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

        $(".sorting-choices-list div").each(function(i, item){
            $(item).css("opacity", "1.0");
        });

        answerState = AGeneric().shuffle(answerState);

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
        var title = page.title;
        var sources = self.state.sources;
        var button = "";
        var choices;
        var answerState = state.answerState;
        var numQuestions = answerState.length;
        var colATitle = "";
        var colAContent = [];
        var colARender;
        var colBTitle = "";
        var colBContent = [];
        var colBRender;
        var correct = "glyphicon sorting-feedback sorting-correct glyphicon-ok-circle";
        var incorrect = "glyphicon sorting-feedback sorting-incorrect glyphicon-remove-circle";
        var isGraded = state.isGraded;
        var numMoved = state.numMoved;
        var numCorrect = 0;
        var isCorrect = true;
        var feedback = "";

        if(numMoved == numQuestions){
            for(var i = 0; i < answerState.length; i++){
                if(answerState[i].currentBox == answerState[i].letter){
                    numCorrect++;
                }
            }

            if(numCorrect < answerState.length){
                isCorrect = false;
            }

            feedback = <div className="row sorting-feedback-text">
                            <h5>
                                {"You got " + numCorrect + " out of " + answerState.length + " correct"}
                            </h5>
                        </div>;

            if(!isCorrect) {
                button = <button className="btn btn-action sorting-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn btn-action sorting-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }
        //a clear all button, and a reset button. These do the same thing but are displayed as different things

            // check the matchsource media type, if audio then do the generic play image, else load specific image
        choices = state.answerState.map(function(item, index){
            var draggable = "";

            switch(item.mediaType){
                case "audio":
                    var zid = item.passedData;
                    draggable = <li className="sorting-choices-container" key={page.xid + "choice-"+index}>
                        <div
                            data={zid}
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onClick}
                            className="sorting-playicon"
                            >
                            <span className="glyphicon glyphicon-play-circle sorting-playicon"></span>
                        </div>
                    </li>;

                    break;
                case "image":
                    var source = item.passedData;
                    var letter = item.letter;
                    draggable = <li key={page.xid + "choice-"+index}>
                        <div
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

                    draggable = <li className="sorting-choices-container-text choice" key={page.xid + "choice-"+index}>
                        <div
                            data={answerLetter}
                            draggable="true"
                            onDragStart={self.onDragging}
                            >
                            {text}
                        </div>
                    </li>;
                    break;
                default:
                // this shouldn't be reached unless you are moving videos
            }

            return (draggable);
        });

        state.page.matchTarget.map(function(item, index){
            var description = item.nut.uttering.utterance.translation.text;
            if(item.letter == "A"){
                colATitle = description;
            }
            if(item.letter == "B"){
                colBTitle = description;
            }
        });

        answerState.map(function(item, index){
            //{letter: letter, isMoved: false, currentBox: "", mediaType: mediaType, displayField: displayField, passedData: passedData}
            var isCorrect = "";
            if(state.numMoved == answerState.length) {
                isCorrect = (item.currentBox == item.letter);
            }
            if(item.currentBox == "A"){
                colAContent.push({letter: item.letter, mediaType: item.mediaType, displayField: item.displayField, passedData: item.passedData, isCorrect: isCorrect});
            }
            if(item.currentBox == "B"){
                colBContent.push({letter: item.letter, mediaType: item.mediaType, displayField: item.displayField, passedData: item.passedData, isCorrect: isCorrect});
            }
        });

        colARender = colAContent.map(function(itemA, index){
            var feedbackA = "";
            var answerRender = "";
            if(state.numMoved == answerState.length){
                if(itemA.isCorrect){
                    feedbackA = correct;
                }else{
                    feedbackA = incorrect;
                }
            }

            switch(itemA.mediaType){
                case "audio":
                    var answerLetter = itemA.letter;
                    var answerData = itemA.passedData;
                    answerRender = <li key={page.xid + "colA-"+index+itemA.passedData}>
                            <div
                                className="sorting-playicon"
                                data={answerData}
                                draggable="true"
                                onDragStart={self.onDragging}
                                onClick={self.onClick}>
                                <span className="glyphicon glyphicon-play-circle"></span>
                                <div className={feedbackA}></div>
                            </div>
                        </li>;
                    break;
                case "image":
                    var source = itemA.passedData;
                    answerRender = <li key={page.xid + "choice-"+index}>
                        <div
                            draggable="true"
                            onDragStart={self.onDragging}>
                            <img src={"data/media/"+source}></img>
                            <div draggable="false" className={feedbackA}></div>
                        </div>
                    </li>;
                    break;
                case "string":
                    answerRender = <li className="sorting-choices-container-text answer" key={page.xid + "colA-"+index+itemA.passedData}>
                        <div
                            draggable="true"
                            onDragStart={self.onDragging}>
                            {itemA.passedData}
                        </div>
                        <span className={feedbackA}></span>
                    </li>;
                    break;
                default:
                    // why are you dragging a video?
            }


            return answerRender;
        });

        colBRender = colBContent.map(function(itemB, index){
            var feedbackB = "";
            var answerRender = "";
            if(state.numMoved == answerState.length){
                if(itemB.isCorrect){
                    feedbackB = correct;
                }else{
                    feedbackB = incorrect;
                }
            }


            switch(itemB.mediaType){
                case "audio":
                    var answerLetter = itemB.letter;
                    var answerData = itemB.passedData;
                    answerRender = <li key={page.xid + "colA-"+itemB.passedData}>
                        <div
                            className="sorting-playicon"
                            data={answerData}
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onClick}>
                            <span className="glyphicon glyphicon-play-circle"></span>
                        </div>
                        <div className={feedbackB}></div>
                    </li>;
                    break;
                case "image":
                    var source = itemB.passedData;
                    answerRender = <li key={page.xid + "choice-"+index}>
                        <div
                            draggable="true"
                            onDragStart={self.onDragging}>
                            <img draggable="false" src={"data/media/"+source}></img>
                            <div className={feedbackB}></div>
                        </div>
                    </li>;
                    break;
                case "string":
                    answerRender = <li className="sorting-choices-container-text answer" key={page.xid + "colA-"+itemB.passedData}>
                        <div
                            draggable="true"
                            onDragStart={self.onDragging}>
                            {itemB.passedData}
                        </div>
                        <span className={feedbackB}></span>
                    </li>;
                    break;
                default:
                // why are you dragging a video?
            }


            return answerRender;
        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="container">
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                        </div>
                        {feedback}
                        <div className="row sorting-choices-container">
                            <ul className="sorting-choices-list">{choices}</ul>
                        </div>
                        <div className="row">
                            <div className="col-md-6 sorting-column sorting-columnA">
                                <div className="panel panel-default sorting-panel">
                                    <div className="panel-heading sorting-panel-heading">{colATitle}</div>
                                    <div className="panel-body">
                                        <div className="sorting-columnA-dropArea sorting-drop-area"
                                             onDragOver={self.onDraggingOver}
                                             onDrop={self.onDropping}>
                                            <ul className="sorting-choices-list">{colARender}</ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 sorting-column sorting-columnB">
                                <div className="panel panel-default sorting-panel">
                                    <div className="panel-heading sorting-panel-heading">{colBTitle}</div>
                                    <div className="panel-body">
                                        <div className="sorting-columnB-dropArea sorting-drop-area"
                                             onDragOver={self.onDraggingOver}
                                             onDrop={self.onDropping}>
                                            <ul className="sorting-choices-list">{colBRender}</ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row sorting-actions">{button}</div>
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

module.exports = SortingView;