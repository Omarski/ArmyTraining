var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var LocalizationStore = require('../../../stores/LocalizationStore');
var PageHeader = require('../../widgets/PageHeader');
var UnitStore = require('../../../stores/UnitStore');


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
        isPaused: true,
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
                    passedData = uttering.media[0].zid.toString() || "000"+index;
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
                passedData = item.media.xid.toString() || "000"+index;
            }

            data.answerState.push({letter: letter, isMoved: false, currentBox: "", currentBoxIndex: -1, mediaType: mediaType, displayField: displayField, passedData: passedData});
        });
    }
    data.answerState = AGeneric().shuffle(data.answerState);
    return data;
}

function playAudio(zid, self){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    var newSource = "data/media/" + zid + ".mp3";
    var icons = document.getElementsByClassName("match-item-choices-container");

    if(audio && source){
        // play audio, or stop the audio if currently playing
        source.src = newSource;
        if(audio.paused){
            audio.load();
            audio.play();
            audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            setTimeout(function(){self.setState({
                isPaused: false
            })});
            Array.prototype.forEach.call(icons, function(item, index){
                if(zid.toString() === $(item).attr("data-passed")){
                    $(item.childNodes)[0].src = "images/icons/stoprecordn.png ";
                    audio.onended = function(){
                        $(item.childNodes)[0].src = "images/icons/playrecordn.png ";
                        audio.pause();
                        setTimeout(function(){self.setState({
                            isPaused: true
                        })});
                    };
                }
            });

        }else{
            Array.prototype.forEach.call(icons, function(item, index){
                $(item.childNodes)[0].src = "images/icons/playrecordn.png ";
            });
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


        if($(e.target).hasClass("match-item-answer-drop-area") || $(e.target).hasClass("match-item-answer-drop-area-image") || $(e.target).hasClass("glyph-answer")){
            //if(drop location isn't taken)
            var spotTaken = false;
            answerState.map(function(item){
                if(item.currentBoxIndex === Math.floor($(e.target).attr("data-index")) || item.currentBoxIndex === Math.floor($(e.target).parent().attr("data-index")) || item.currentBoxIndex === Math.floor($(e.target).parent().parent().attr("data-index")) ){
                    draggedItemLetter = "";
                    spotTaken = true;
                }
            });

            if(!spotTaken){
                dropLocation = $(e.target).attr("data-letter") || $(e.target).parent().attr("data-letter");
                dropLocationIndex = Math.floor($(e.target).attr("data-index")) ||  Math.floor($(e.target).parent().attr("data-index")) || 0;
            }else{
                // spot taken
            }
        }

        // clear answer if dragging off where it's placed.
        if($(e.target).hasClass("match-item-choices-container") || $(e.target).hasClass("glyph-choice") || $(e.target).hasClass("match-item-choice-td-text") || $(e.target).hasClass("match-item-image")) {
            if( !!$(draggedItemTarget).css("opacity")){
                if($(draggedItemTarget).parent().hasClass("match-item-answer-drop-area") || $(draggedItemTarget).parent().parent().hasClass("match-item-answer-drop-area-image")) {
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
                    }else{ // if( "image" || "audio" )

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
        var it = null;
        var parent = null;

        if($(e.target).hasClass("match-item-choices-container") || $(e.target).hasClass("glyph-choice")){
            answerState.map(function(item){
                it = $(e.target).attr("data") == item.passedData;
                parent = $(e.target).parent().attr("data") == item.passedData;
                if(it || parent){
                    // TODO: trigger image to change to stop? for duration?
                    if(it){
                        playAudio($(e.target).attr("data"), self);
                    }else if (parent){
                        playAudio($(e.target).parent().attr("data"), self);
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
        var correct = "glyphicon MI-feedback MI-correct ";
        var incorrect = "glyphicon MI-feedback MI-incorrect ";
        var answerContainers;
        var audio = document.getElementById('mainViewAudio');

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
            var numberNextToSpan = index + 1 + ".";
            switch(item.mediaType){
                case "audio":
                    var zid = item.passedData;
                    var draggableTitle = "paused";
                    if(audio){
                        draggableTitle = self.state.isPaused ? LocalizationStore.labelFor("PronunciationPage", "btnPlay") : LocalizationStore.labelFor("PronunciationPage", "btnStop");
                    }
                    draggable = (<a
                            href="#"
                            key={page.xid + "choice-"+index}
                            data={zid}
                            title={draggableTitle}
                            data-passed={item.passedData}
                            className="match-item-choices-container match-item-play-icon"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onDragOver={self.onDraggingOver}
                            onDrop={self.onDropping}
                            onClick={self.onClick}>
                            <img src="images/icons/playrecordn.png"  className="glyphicon glyph-choice match-item-audio">
                            </img>
                        </a>);
                    break;
                case "image":
                    var source = item.passedData;
                    var letter = item.letter;
                    draggable = (<img
                        className="match-item-choices-container match-item-image"
                        src={"data/media/"+source}
                        key={page.xid + "choice-"+index}
                        draggable="true"
                        data-passed={item.passedData}
                        data={letter}
                        onDragStart={self.onDragging}
                        onDragOver={self.onDraggingOver}
                        onDrop={self.onDropping}>
                    </img>);
                    break;
                case "string":
                    // the letter of the answer in current answer Container
                    var answerLetter = item.letter;
                    var text = item.passedData;

                    draggable = (<a
                            href="#"
                            key={page.xid + "choice-"+index}
                            data={answerLetter}
                            data-passed={item.passedData}
                            className="match-item-choices-container match-item-text-choice"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onDragOver={self.onDraggingOver}
                            onDrop={self.onDropping}>
                            {text}
                        </a>);
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
                // loop through the answerState array
                var numberNextToSpan = i + 1 + ".";
                var icon = "";
                if(index === state.answerState[i].currentBoxIndex) { // if there is an answer in this box
                    if (needCheck) { // does it need to be graded?
                        if (state.answerState[i].currentBox == state.answerState[i].letter) { // if correct
                            icon = (<img src="images/icons/completeexplorer.png"/>);
                            feedback = correct;
                        } else {
                            icon = (<img src="images/icons/failedquiz.png"/>);
                            feedback = incorrect;
                        }
                    }


                    // check the matchsource media type, if audio then do the generic play image, else load specific image
                    switch (state.answerState[i].mediaType) {
                        case "audio":
                            answerRender = (<a
                                    href="#"
                                    data={state.answerState[i].passedData}
                                    data-passed={state.answerState[i].passedData}
                                    draggable="true"
                                    className="match-item-play-icon"
                                    onDragStart={self.onDragging}
                                    onClick={self.onClick}>
                                        <img src="images/icons/playrecordn.png" className="glyphicon glyph-answer match-item-audio">
                                        </img>
                                        <div className={(feedback + ' match-item-feedback-audio')}>
                                            {icon}
                                        </div>
                                </a>);
                            break;
                        case "image":
                            var source = answerState[i].passedData;
                            answerRender = (<div>
                                <img
                                className="match-item-answer-image match-item-image"
                                src={"data/media/"+source}
                                draggable="true"
                                data-passed={source}
                                onDragStart={self.onDragging}
                                ></img>
                                <div className={(feedback  + ' match-item-feedback-image')}>
                                    {icon}
                                </div>
                            </div>);
                            break;
                        case "string":
                            answerRender = (<a
                                    href="#"
                                    className="match-item-text-choice"
                                    data-passed={answerState[i].passedData}
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    >
                                    {state.answerState[i].passedData}
                                    <div className={(feedback  + ' match-item-feedback-text')}>
                                        {icon}
                                    </div>
                                </a>);
                            break;
                        default:
                        // this shouldn't be reached unless you are moving videos
                    }
                }
            }

            // this return is for the drop areas with their question prompts
            //div className="match-item-answer-drop-area dropped audio-drop" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
            //<div className="match-item-answer-drop-area-audio match-item-answer-drop-area dropped" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>

            switch (state.answerState[0].mediaType) {
                case "audio":
                var row = (<tr>
                                <td className={"matchitem-choice-td"}>
                                    {choices[index]}
                                </td>
                                <td className={"matchitem-droparea-td"}>
                                    <div className="match-item-answer-drop-area dropped audio-drop" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
                                        {answerRender}
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
                                    <td className={"matchitem-question-td "}>
                                        <div className="match-item-answer-prompt">{answerPrompt}</div>
                                    </td>
                                </tr>);
                break;
                case "string":
                    var row = (<tr>
                                    <td className={"matchitem-choice-td match-item-choice-td-text"}
                                        onDragOver={self.onDraggingOver}
                                        onDrop={self.onDropping}>
                                    {choices[index]}
                                    </td>
                                    <td className={"matchitem-droparea-td matchitem-droparea-td-text"}>
                                        <div className="match-item-answer-drop-area dropped" data-letter={letter} data-index={index} onDragOver={self.onDraggingOver} onDrop={self.onDropping}>
                                            {answerRender}
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

        // var imageGrid = "";

            // var imageToupleRows = imageGridList.map(function(item, index){
            //     if (index % 2 === 0 ){
            //         return (<tr>{item[i]}{item[i+2]}</tr>);
            //     }
            //     if (index % 2 !== 0){
            //         return (<tr)
            //     }
            // });
        // var imagesLeftColumn = (<td>{imageToupleRows}</td>);
        // var answerRightColumn = (<td></td>);
        //
        // answerContainers = (
        //                        {imagesLeftColumn}
        //                        {answerRightColumn}
        //                    );
        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={state.mediaCaption} title={title} key={page.xid}/>
                    <div className="match-item-view-container">
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div>
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