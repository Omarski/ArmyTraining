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
        answerState: [],
        draggedItemLetter: "",
        draggedItemTarget: "",
        draggedItemData: "",
        numMoved: 0,
        mediaCaption: null
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.prompt = props.page.prompt ? props.page.prompt.text : "";
        data.page = props.page;

        //LINE 25 causes an error on Lesson 9/18 Pages 33/167 (cannot read property 'text' of null --> Is this supposed to be props.page.text?

        if(props.page.info && props.page.info.property){
            props.page.info.property.map(function(item){
                if(item.name === "mediacaption"){
                    data.mediaCaption = item.value;
                }
            });
        }

        props.page.matchSource.map(function(item, index){
          //  var label = item.nut.uttering.utterance.native.text;
          //  data.answerState.push({label: label, isMoved: false, currentBox: "", correctBox: item.letter});
            var mediaType = "audio";
            var letter = item.letter;
            var displayField = "";
            var uttering = "";
            var utterance = "";
            var passedData = "000"+index;

            if(item.nut){
                uttering = item.nut.uttering;
                utterance = uttering.utterance;

                if(uttering.media){
                    mediaType = uttering.media[0].type || "audio";
                    passedData = uttering.media[0].zid || "000"+index;
                }else{
                    mediaType = "string";
                    if(utterance.ezread && utterance.ezread.text !== ""){
                        displayField = "ezread";
                        passedData = utterance.ezread.text;
                    }else if(utterance.translation && utterance.translation.text !== ""){
                        displayField = "translation";
                        passedData = utterance.translation.text;
                    }else if(utterance.native && utterance.native.text !== ""){
                        displayField = "native";
                        passedData = utterance.native.text;
                    }else if (utterance.phonetic && utterance.phonetic.text !== ""){
                        displayField = "phonetic";
                        passedData = utterance.phonetic.text;
                    }
                }
            }else if (item.media){

                mediaType = item.media.type || "audio";
                passedData = item.media.xid || "000"+index;
                // console.log("passedData", passedData);
            }

            // console.log("passedData", passedData);
            data.answerState.push({letter: letter, isMoved: false, currentBox: "", currentBoxIndex: -1, mediaType: mediaType, displayField: displayField, passedData: passedData});
        });
    }
    data.answerState = AGeneric().shuffle(data.answerState);
    return data;
}

function playAudio(zid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    var newSource = "data/media/" + zid + ".mp3";
    if(audio && source){
        // play audio, or stop the audio if currently playing
        source.src = newSource;
        if(audio.paused){
            audio.load();
            audio.play();
            audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            audio.onended = function(){audio.pause(); };
        }else{
            audio.pause();
        }
    }
}

var MatchItemView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    onDragging: function(e){
        // var dragItems = document.querySelectorAll('[draggable=true]');
        // for (var i = 0; i < dragItems.length; i++) {
        //     addEvent(dragItems[i], 'dragstart', function (event) {
        //         // store the ID of the element, and collect it on the drop later on
        //
        //         event.dataTransfer.setData('Text', 'nothing');
        //     });
        // }

        e.dataTransfer.setData("text", e.target.id);

        var self = this;
        var state = self.state;
        var draggedItemLetter = "";
        var draggedItemTarget = "";
        var draggedItemData = "";
        var audio = document.getElementById('mainViewAudio');
        var source = document.getElementById('mainViewMp3Source');

        source.src = "data/media/Grab02.mp3";
        if(audio && source) {
            audio.load();
            audio.play();
            audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
        }
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
        var audio = document.getElementById('mainViewAudio');
        var source = document.getElementById('mainViewMp3Source');


        // get dragged item
        var draggedItemTarget = state.draggedItemTarget;
        var draggedItemLetter = state.draggedItemLetter;
        var draggedItemData = state.draggedItemData;
        var dropLocation = "";
        var dropLocationIndex = -1;


        if($(e.target).hasClass("match-item-answer-drop-area") || $(e.target).hasClass("match-item-answer-drop-area-image")){
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
            }else{
                //console.log("spot taken");
            }
        }

        // clear answer if dragging off where it's placed.
        if($(e.target).hasClass("match-item-text-choice") || $(e.target).hasClass("match-item-image") || $(e.target).hasClass("match-item-play-icon")) {
            if( !!$(draggedItemTarget).css("opacity")){
                if($(draggedItemTarget).parent().hasClass("match-item-answer-drop-area")) {
                    answerState.map(function (item) {
                        if(draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData){
                            item.isMoved = false;
                            item.currentBox = "";
                            item.currentBoxIndex = -1;
                        }
                    });

                    $(".match-item-choices-container").map(function(i, index){
                        if(index.attributes.getNamedItem("data-passed").value === draggedItemTarget.attributes.getNamedItem("data-passed").value ){
                            $(index).css("opacity", "1.0");
                            numMoved--;
                        }
                    });
                }
            }
        }

        var itemFound = false;

        if($(draggedItemTarget).css("opacity") != 0.0 && (dropLocation !== "") ){
            source.src = "data/media/Drop01.mp3";
            if(audio && source) {
                audio.load();
                audio.play();
                audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            }
        }

        if(state.numMoved !== state.answerState.length && $(draggedItemTarget).css("opacity") != 0.0) {
            if (draggedItemLetter !== "" && dropLocation !== "") {
                answerState.map(function (item, index) {
                    if(item.mediaType === "string"){
                        if ($(draggedItemTarget)[0].textContent === item.passedData) {
                            item.currentBox = dropLocation;
                            item.currentBoxIndex = dropLocationIndex;
                            item.isMoved = true;
                            if ($(draggedItemTarget).hasClass("match-item-choices-container")) {
                                $(draggedItemTarget).css("opacity", "0.0");
                                numMoved++;
                            }
                            itemFound = true;
                        }
                    } else { // if( "image" || "audio" )

                        // console.log("draggedItemTarget", draggedItemTarget, "draggedItemTarget.attributes", draggedItemTarget.attributes);
                        if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.currentBox = dropLocation;
                            item.currentBoxIndex = dropLocationIndex;
                            item.isMoved = true;
                            if ($(draggedItemTarget).hasClass("match-item-choices-container")) {
                                $(draggedItemTarget).css("opacity", "0.0");
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

        if($(e.target).hasClass("match-item-play-icon")){
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

        $(".match-item-choices-container").each(function(i, item){
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
        var correct = "glyphicon MI-feedback MI-correct glyphicon-ok";
        var incorrect = "glyphicon MI-feedback MI-incorrect glyphicon-remove";
        var answerContainers;

        var numMoved = state.numMoved;
        //                                    <div className={(feedback + ' match-item-feedback-audio')}></div>

        if(numMoved === numQuestions){
            var isCorrect = true;
            // check if correct and update accordingly

            for(var i = 0; i < answerState.length; i++){
                if(answerState[i].currentBox !== answerState[i].letter){
                    isCorrect = false;
                    break;
                }
            }

            var audio = document.getElementById('mainViewAudio');
            var source = document.getElementById('mainViewMp3Source');
            if(isCorrect){
                // play correct audio
                source.src = "data/media/Correct.mp3";
            } else {
                // play incorrect audio
                source.src = "data/media/Incorrect.mp3";
                button = <button className="btn btn-action MI-tryAgain btn-rst" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }
            if(audio && source) {
                audio.load();
                audio.play();
                audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            }
        }

        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn btn-action MI-clear btn-rst" onClick={self.reset}>Clear All</button>; // clear all button
        }

        // check the matchsource media type, if audio then do the generic play image, else load specific image

        choices = state.answerState.map(function(item, index){
            var draggable = "";
            // if(audio)
            // console.log("state.answerState", state.answerState);
            // console.log("item", item);
            var numberNextToSpan = index + 1 + ".";
            switch(item.mediaType){
                case "audio":
                    var zid = item.passedData;
                    // console.log("state", state);
                    // console.log("item.passedData", item.passedData);
                    draggable = (<div
                            key={page.xid + "choice-"+index}
                            data={zid}
                            data-passed={item.passedData}
                            className="match-item-choices-container match-item-play-icon"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onDragOver={self.onDraggingOver}
                            onDrop={self.onDropping}
                            onClick={self.onClick}>
                            <span className="glyphicon glyphicon-play-circle match-item-audio"></span>
                            <h5 className="match-item-number">{numberNextToSpan}</h5>
                        </div>);
                    break;
                case "image":
                    var source = item.passedData;
                    var letter = item.letter;
                    draggable = (<div
                            key={page.xid + "choice-"+index}
                            draggable="true"
                            data-passed={item.passedData}
                            data={letter}
                            className="match-item-choices-container"
                            onDragStart={self.onDragging}
                            onDragOver={self.onDraggingOver}
                            onDrop={self.onDropping}>
                            <img draggable="false" className="match-item-image" src={"data/media/"+source}></img>
                        </div>);
                    break;
                case "string":
                    // the letter of the answer in current answer Container
                    var answerLetter = item.letter;
                    var text = item.passedData;

                    draggable = (<div
                            key={page.xid + "choice-"+index}
                            data={answerLetter}
                            data-passed={item.passedData}
                            className="match-item-choices-container match-item-text-choice"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onDragOver={self.onDraggingOver}
                            onDrop={self.onDropping}>
                            {text}
                        </div>);
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
            // have array of boolean's equal length to answerState
            for(var i=0;i<state.answerState.length;i++){
                // console.log("i", i);
                // console.log("state.answerState", state.answerState);
                // loop through the answerState array
                var numberNextToSpan = i + 1 + ".";
                if(index === state.answerState[i].currentBoxIndex) { // if there is an answer in this box
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
                            answerRender = (<div
                                    data={state.answerState[i].passedData}
                                    data-passed={state.answerState[i].passedData}
                                    draggable="true"
                                    className="match-item-play-icon"
                                    onDragStart={self.onDragging}
                                    onClick={self.onClick}>
                                    <span className="glyphicon glyphicon-play-circle match-item-audio"></span>
                                    <h5 className="match-item-number">{numberNextToSpan}</h5>
                                    <div className={(feedback + ' match-item-feedback-audio')}></div>
                                </div>);
                            break;
                        case "image":
                            var source = answerState[i].passedData;
                            answerRender = (<div
                                    draggable="true"
                                    data-passed={source}
                                    onDragStart={self.onDragging}
                                    className="match-item-answer-image"
                                >

                                    <img draggable="false" className="match-item-image" src={"data/media/"+source}></img>
                                    <div className={(feedback  + ' match-item-feedback-image')}></div>
                                </div>);
                            break;
                        case "string":
                            answerRender = (<div
                                    className="match-item-text-choice"
                                    data-passed={answerState[i].passedData}
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    >
                                    {state.answerState[i].passedData}
                                    <div className={(feedback  + ' match-item-feedback-text')}></div>
                                </div>);
                            break;
                        default:
                        // this shouldn't be reached unless you are moving videos
                    }
                }
            }

            // this return is for the drop areas with their question prompts
            //
            switch (state.answerState[0].mediaType) {
                case "audio":
                var row = (<tr>
                                <td className={"matchitem-choice-td"}>
                                    {choices[index]}
                                </td>
                                <td className={"matchitem-droparea-td"}>
                                    <div className="match-item-answer-drop-area dropped" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
                                        {answerRender}
                                        <span className="glyphicon glyphicon-play-circle match-item-audio match-item-audio-grayed-out"></span>
                                    </div>
                                </td>
                                <td className={"matchitem-question-td"}>
                                    <div className="match-item-answer-prompt">{answerPrompt}</div>
                                </td>
                            </tr>);
                break;
                case "image":
                    var row = (<tr>
                                    <td className={"matchitem-choice-td match-item-choice-image"}>
                                        {choices[index]}
                                    </td>
                                    <td className={"matchitem-droparea-td"}>
                                        <div className="match-item-answer-drop-area-image dropped" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
                                            {answerRender}
                                        </div>
                                    </td>
                                    <td className={"matchitem-question-td"}>
                                        <div className="match-item-answer-prompt">{answerPrompt}</div>
                                    </td>
                                </tr>);
                break;
                case "string":
                    var row = (<tr>
                                    <td className={"matchitem-choice-td"}>
                                    {choices[index]}
                                    </td>
                                    <td className={"matchitem-droparea-td"}>
                                        <div className="match-item-answer-drop-area dropped" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
                                            {answerRender}
                                            <span className="glyphicon glyphicon-play-circle match-item-audio match-item-audio-grayed-out"></span>
                                        </div>
                                    </td>
                                    <td className={"matchitem-question-td"}>
                                        <div className="match-item-answer-prompt">{answerPrompt}</div>
                                    </td>
                              </tr>);
                break;
                default:
            }


            return (row);
        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={state.mediaCaption} title={title} key={page.xid}/>
                    <div className="container">
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="row">
                            <h4 className="match-item-prompt">{state.prompt}</h4>
                        </div>

                        <table className={"table table-striped table-bordered table-condensed"}>
                            <tbody>
                                {answerContainers}
                            </tbody>
                        </table>
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