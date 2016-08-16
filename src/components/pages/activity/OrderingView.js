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
        numMoved: 0,
        lastDraggable:null
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

    onDraggableClick: function(e){

        console.log("Dragging...");
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

        //highlight
        if (self.state.lastDraggable) $(self.state.lastDraggable).css({"border":"1px solid #ddd"});
        $(e.target).css({"border":"2px solid #f6ae23"});

        self.setState({
            draggedItemLetter: draggedItemLetter,
            draggedItemTarget: draggedItemTarget,
            draggedItemData: draggedItemData,
            lastDraggable: e.target
        });

        //Audio?
        if ($(e.target).hasClass("or-playicon")) self.onClick(e);
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

        if($(e.target).hasClass("or-text-choice") || $(e.target).hasClass("or-image") || $(e.target).hasClass("or-play-icon") || $(e.target).hasClass("or-choice-selection") || $(e.target).hasClass("or-choices-container")) {
            if( !!$(draggedItemTarget).css("opacity")){
                if($(draggedItemTarget).parent().parent().hasClass("col-md-3") || $(draggedItemTarget).parent().parent().hasClass("or-answer")) {
                    answerState.map(function (item) {


                        if(draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.isMoved = false;
                            item.currentBox = "";
                            item.currentBoxIndex = -1;
                        }
                    });

                    $(".or-choice-selection").map(function(i, index){
                        if(index.attributes.getNamedItem("data-passed").value === draggedItemTarget.attributes.getNamedItem("data-passed").value ){
                            $(index).css("opacity", "1.0");
                            numMoved--;
                        }
                    });
                }
            }
        }

        var itemFound = false;

        if($(draggedItemTarget).css("opacity") != 0.3 && (dropLocation !== "") ){
            source.src = "data/media/Drop01.mp3";
            if(audio && source) {
                audio.load();
                audio.play();
                audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            }
        }

        if(state.numMoved !== state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemLetter !== "" && dropLocation !== "") {
                answerState.map(function (item) {
                    if(item.mediaType === "string"){
                        if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                            item.currentBox = dropLocation;
                            item.currentBoxIndex = dropLocationIndex;
                            item.isMoved = true;
                            if ($(draggedItemTarget).parent().hasClass("or-choices-container")) {
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
                            if($(draggedItemTarget).parent().hasClass("or-choices-container"))  {
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

    onTargetClick: function(e){
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        var state = self.state;
        var numMoved = state.numMoved;
        var answerState = state.answerState;
        var audio = document.getElementById('mainViewAudio');
        var source = document.getElementById('mainViewMp3Source');
        var lastDraggable = self.state.lastDraggable;

        // get dragged item
        var draggedItemTarget = state.draggedItemTarget;
        var draggedItemLetter = state.draggedItemLetter;
        var draggedItemData = state.draggedItemData;
        var dropLocation = "";
        var dropLocationIndex = -1;

        if (lastDraggable) {
            switch ($(e.target).attr("class")) {
                case "or-answer-drop-area":
                    //if(drop location isn't taken)
                    var spotTaken = false;
                    answerState.map(function (item) {
                        if (item.currentBoxIndex === Math.floor($(e.target).attr("data-index"))) {
                            draggedItemLetter = "";
                            spotTaken = true;
                        }
                    });
                    if (!spotTaken) {
                        dropLocation = $(e.target).attr("data-letter");
                        dropLocationIndex = Math.floor($(e.target).attr("data-index"));
                    }
                    break;
                default:
                //if($(e.target).parent().attr("class") == "OR-answer-dropArea"){
                //    dropLocation = $(e.target).parent().attr("data-letter");
                //}
            }

            if ($(e.target).hasClass("or-text-choice") || $(e.target).hasClass("or-image") || $(e.target).hasClass("or-play-icon") || $(e.target).hasClass("or-choice-selection") || $(e.target).hasClass("or-choices-container")) {
                if (!!$(draggedItemTarget).css("opacity")) {
                    if ($(draggedItemTarget).parent().parent().hasClass("col-md-3") || $(draggedItemTarget).parent().parent().hasClass("or-answer")) {
                        answerState.map(function (item) {


                            if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                                item.isMoved = false;
                                item.currentBox = "";
                                item.currentBoxIndex = -1;
                            }
                        });

                        $(".or-choice-selection").map(function (i, index) {
                            if (index.attributes.getNamedItem("data-passed").value === draggedItemTarget.attributes.getNamedItem("data-passed").value) {
                                $(index).css("opacity", "1.0");
                                numMoved--;
                            }
                        });
                    }
                }
            }

            var itemFound = false;

            if ($(draggedItemTarget).css("opacity") != 0.3 && (dropLocation !== "")) {
                source.src = "data/media/Drop01.mp3";
                if (audio && source) {
                    audio.load();
                    audio.play();
                    audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
                }
            }

            if (state.numMoved !== state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
                if (draggedItemLetter !== "" && dropLocation !== "") {
                    answerState.map(function (item) {
                        if (item.mediaType === "string") {
                            if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                                item.currentBox = dropLocation;
                                item.currentBoxIndex = dropLocationIndex;
                                item.isMoved = true;
                                if ($(draggedItemTarget).parent().hasClass("or-choices-container")) {
                                    $(draggedItemTarget).css("opacity", "0.3");
                                    numMoved++;
                                }
                                itemFound = true;
                            }
                        } else { // if ("image" || "audio")
                            if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
                                item.currentBox = dropLocation;
                                item.currentBoxIndex = dropLocationIndex;
                                item.isMoved = true;
                                if ($(draggedItemTarget).parent().hasClass("or-choices-container")) {
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
            });

            $(".or-answer-drop-area").css({"border":"1px solid #ddd"});
            if (self.state.lastDraggable) $(self.state.lastDraggable).css({"border":"1px solid #ddd"});

        }
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
        $(".or-choice-selection").each(function(i, item){
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
        var correct = "glyphicon or-feedback or-correct ";
        var incorrect = "glyphicon or-feedback or-incorrect ";
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

            var audio = document.getElementById('mainViewAudio');
            var source = document.getElementById('mainViewMp3Source');
            if(isCorrect){
                // play correct audio
                source.src = "data/media/Correct.mp3";
            } else {
                // play incorrect audio
                source.src = "data/media/Incorrect.mp3";
                button = <button className="btn btn-action or-tryAgain btn-rst" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }
            if(audio && source) {
                audio.load();
                audio.play();
                audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn btn-action or-clear btn-rst" onClick={self.reset}>Clear All</button>; // clear all button
        }

        choices = state.answerState.map(function(item, index){
            var draggable = "";
            switch (item.mediaType){
                case "audio":
                    var zid = item.passedData;
                    draggable =
                        <a
                            href="#"
                            data-passed={item.passedData}
                            data={zid}
                            key={page.xid + "choice-"+index}
                            className="or-playicon or-choice-selection"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onDraggableClick}>
                            <span className="glyphicon">
                                <img src="images/icons/playrecordingn.png" />
                            </span>
                        </a>;
                    break;
                case "image":
                    var source = item.passedData;
                    var letter = item.letter;
                    draggable =
                        <div>
                            <img
                                data-passed={item.passedData}
                                key={page.xid + "choice-"+index}
                                className="or-choice-selection"
                                draggable="true"
                                data={letter}
                                onDragStart={self.onDragging}
                                onClick={self.onDraggableClick}
                                src={"data/media/"+source}></img>
                        </div>;
                    break;
                case "string":
                    // the letter of the answer in current answer Container
                    var answerLetter = item.letter;
                    var text = item.passedData;

                    draggable =
                        <a
                            href="#"
                            key={page.xid + "choice-"+index}
                            data-passed={item.passedData}
                            data={answerLetter}
                            className="or-text-choice or-choice-selection"
                            draggable="true"
                            onDragStart={self.onDragging}
                            onClick={self.onDraggableClick}>
                            {text}
                        </a>;
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

                    var icon = "";
                    if(needCheck){
                        if(state.answerState[i].currentBox == state.answerState[i].letter){
                            icon = (<img src="images/icons/completeexplorer.png"/>);
                            feedback = correct;
                        }else{
                            icon = (<img src="images/icons/failedquiz.png"/>);
                            feedback = incorrect;
                        }
                    }

                    // check the matchsource media type, if audio then do the generic play image, else load specific image
                    switch (state.answerState[i].mediaType) {
                        case "audio":
                            answerRender = <a
                                href="#"
                                data-passed={state.answerState[i].passedData}
                                data={state.answerState[i].passedData}
                                className="or-play-icon or-answer-placed"
                                draggable="true"
                                onDragStart={self.onDragging}
                                onClick={self.onClick}>
                                <span className="glyphicon ">
                                    <img src="images/icons/playrecordn.png"/>
                                </span>


                                <div className={feedback}>
                                    {icon}
                                </div>
                            </a>;
                            break;
                        case "image":
                            var source = answerState[i].passedData;
                            answerRender =
                                <div>
                                    <img
                                        data-passed={source}
                                        draggable="true"
                                        className="or-answer-placed"
                                        key={page.xid + "choice-"+index}
                                        onDragStart={self.onDragging}
                                        src={"data/media/"+source}></img>
                                    <div className={feedback}>
                                        {icon}
                                    </div>
                                </div>;
                            break;
                        case "string":
                            answerRender = (
                                <a
                                    href="#"
                                    data-passed={state.answerState[i].passedData}
                                    className="or-text-choice or-answer-placed"
                                    draggable="true"
                                    onDragStart={self.onDragging}
                                    >
                                    {state.answerState[i].passedData}
                                    <div className={feedback}>
                                        {icon}
                                    </div>
                                </a>
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
                     onClick={self.onTargetClick}
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
                            <div className="or-choices-container"
                                onDragOver={self.onDraggingOver}
                                onDrop={self.onDropping}>
                                {choices}
                            </div>
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


// var React = require('react');
// var PageStore = require('../../../stores/PageStore');
// var SettingsStore = require('../../../stores/SettingsStore');
// var PageHeader = require('../../widgets/PageHeader');
//
// // updated classNames to be lowercase
// function getPageState(props) {
//     var data = {
//         page: "",
//         sources: [],
//         title: "",
//         pageType: "",
//         prompt: "",
//         answerState: [],
//         draggedItemLetter: "",
//         draggedItemTarget: "",
//         draggedItemData: "",
//         isGraded: false,
//         numMoved: 0
//     } ;
//
//     if (props && props.page) {
//         data.title = props.page.title;
//         data.pageType = props.page.type;
//         data.prompt = props.page.prompt.text;
//         data.page = props.page;
//
//         props.page.matchSource.map(function(item, index){
//             //  var label = item.nut.uttering.utterance.native.text;
//             //  data.answerState.push({label: label, isMoved: false, currentBox: "", correctBox: item.letter});
//             var mediaType = "audio";
//             var letter = item.letter;
//             var displayField = "";
//             var uttering = "";
//             var utterance = "";
//             var passedData = "";
//
//             if(item.nut){
//                 uttering = item.nut.uttering;
//                 utterance = uttering.utterance;
//
//                 if(uttering.media){
//                     mediaType = uttering.media[0].type;
//                     passedData = uttering.media[0].zid;
//                 }else{
//                     mediaType = "string";
//                     if(utterance.ezread && utterance.ezread.text !== ""){
//                         displayField = "ezread";
//                         passedData = utterance.ezread.text;
//                     }else if(utterance.translation && utterance.translation.text !== ""){
//                         displayField = "translation";
//                         passedData = utterance.translation.text;
//                     }else if(utterance.native && utterance.native.text !== ""){
//                         displayField = "native";
//                         passedData = utterance.native.text;
//                     }else if (utterance.phonetic && utterance.phonetic.text !== ""){
//                         displayField = "phonetic";
//                         passedData = utterance.phonetic.text;
//                     }
//                 }
//             }else if (item.media){
//                 mediaType = item.media.type;
//                 passedData = item.media.xid;
//             }
//             data.answerState.push({letter: letter, isMoved: false, currentBox: "", currentBoxIndex: -1, mediaType: mediaType, displayField: displayField, passedData: passedData});
//         });
//     }
//     data.answerState = AGeneric().shuffle(data.answerState);
//     return data;
// }
//
// // Plays Audio filed named with the zid given
// function playAudio(zid){
//     var audio = document.getElementById('audio');
//     var source = document.getElementById('mp3Source');
//     // construct file-path to audio file
//     source.src = "data/media/" + zid + ".mp3";
//     // play audio, or stop the audio if currently playing
//     if(audio.paused){
//         audio.load();
//         audio.play();
//         audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
//     }else{
//         audio.pause();
//     }
//
// }
//
// var OrderingView = React.createClass({
//     getInitialState: function() {
//         var pageState = getPageState(this.props);
//         return pageState;
//     },
//
//     onDragging: function(e){
//         // var dragItems = document.querySelectorAll('[draggable=true]');
//         // for (var i = 0; i < dragItems.length; i++) {
//         //     addEvent(dragItems[i], 'dragstart', function (event) {
//         //         // store the ID of the element, and collect it on the drop later on
//         //
//         //         event.dataTransfer.setData('Text', 'nothing');
//         //     });
//         // }
//
//         e.dataTransfer.setData("text", e.target.id);
//
//
//         var self = this;
//         var state = self.state;
//         var draggedItemLetter = "";
//         var draggedItemTarget = "";
//         var audio = document.getElementById('mainViewAudio');
//         var source = document.getElementById('mainViewMp3Source');
//
//         source.src = "data/media/Grab02.mp3";
//         if(audio && source) {
//             audio.load();
//             audio.play();
//             audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
//         }
//         if(state.numMoved != state.answerState.length && $(e.target).css("opacity") != 0.3) {
//             if (e.target) {
//                 draggedItemLetter = $(e.target).attr("data");
//                 draggedItemTarget = e.target;
//                 draggedItemData = $(e.target).attr("data-passed");
//             }
//         }else{
//             draggedItemLetter = "";
//             draggedItemTarget = "";
//             draggedItemData = "";
//         }
//
//         self.setState({
//             draggedItemLetter: draggedItemLetter,
//             draggedItemTarget: draggedItemTarget,
//             draggedItemData: draggedItemData
//         });
//     },
//
//     onDraggingOver: function(e){
//         e.preventDefault();
//         e.stopPropagation();
//     },
//
//     onDropping: function(e){
//         e.preventDefault();
//         e.stopPropagation();
//         var self = this;
//         var state = self.state;
//         var numMoved = state.numMoved;
//         var answerState = state.answerState;
//         var audio = document.getElementById('mainViewAudio');
//         var source = document.getElementById('mainViewMp3Source');
//
//         // get dragged item
//         var draggedItemTarget = state.draggedItemTarget;
//         var draggedItemLetter = state.draggedItemLetter;
//         var draggedItemData = state.draggedItemData;
//         var dropLocation = "";
//         var dropLocationIndex = -1;
//
//         switch($(e.target).attr("class")){
//             case "or-answer-drop-area":
//                 //if(drop location isn't taken)
//                 var spotTaken = false;
//                 answerState.map(function(item){
//                     if(item.currentBoxIndex === Math.floor($(e.target).attr("data-index")) ){
//                         draggedItemLetter = "";
//                         spotTaken = true;
//                     }
//                 });
//                 if(!spotTaken){
//                     dropLocation = $(e.target).attr("data-letter");
//                     dropLocationIndex = Math.floor($(e.target).attr("data-index"));
//                 }
//                 break;
//             default:
//             //if($(e.target).parent().attr("class") == "OR-answer-dropArea"){
//             //    dropLocation = $(e.target).parent().attr("data-letter");
//             //}
//         }
//
//         if($(e.target).hasClass("or-text-choice") || $(e.target).hasClass("or-image") || $(e.target).hasClass("or-play-icon") || $(e.target).hasClass("or-choice-selection") || $(e.target).hasClass("or-choices-container")) {
//             if( !!$(draggedItemTarget).css("opacity")){
//                 if($(draggedItemTarget).parent().parent().hasClass("col-md-3") || $(draggedItemTarget).parent().parent().hasClass("or-answer")) {
//                     answerState.map(function (item) {
//
//
//                         if(draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
//                             item.isMoved = false;
//                             item.currentBox = "";
//                             item.currentBoxIndex = -1;
//                         }
//                     });
//
//                     $(".or-choice-selection").map(function(i, index){
//                         if(index.attributes.getNamedItem("data-passed").value === draggedItemTarget.attributes.getNamedItem("data-passed").value ){
//                             $(index).css("opacity", "1.0");
//                             numMoved--;
//                         }
//                     });
//                 }
//             }
//         }
//
//         var itemFound = false;
//
//         if($(draggedItemTarget).css("opacity") != 0.3 && (dropLocation !== "") ){
//             source.src = "data/media/Drop01.mp3";
//             if(audio && source) {
//                 audio.load();
//                 audio.play();
//                 audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
//             }
//         }
//
//         if(state.numMoved !== state.answerState.length && $(draggedItemTarget).css("opacity") != 0.3) {
//             if (draggedItemLetter !== "" && dropLocation !== "") {
//                 answerState.map(function (item) {
//                     if(item.mediaType === "string"){
//                         if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
//                             item.currentBox = dropLocation;
//                             item.currentBoxIndex = dropLocationIndex;
//                             item.isMoved = true;
//                             if ($(draggedItemTarget).parent().hasClass("or-choices-container")) {
//                                 $(draggedItemTarget).css("opacity", "0.3");
//                                 numMoved++;
//                             }
//                             itemFound = true;
//                         }
//                     }else{ // if ("image" || "audio")
//                         if (draggedItemTarget.attributes.getNamedItem("data-passed").value === item.passedData) {
//                             item.currentBox = dropLocation;
//                             item.currentBoxIndex = dropLocationIndex;
//                             item.isMoved = true;
//                             if($(draggedItemTarget).parent().hasClass("or-choices-container"))  {
//                                 $(draggedItemTarget).css("opacity", "0.3");
//                                 numMoved++;
//                             }
//                             itemFound = true;
//                         }
//                     }
//                 });
//             }
//         }
//
//         self.setState({
//             answerState: answerState,
//             numMoved: numMoved
//         })
//     },
//
//     onClick: function(e){
//         var self = this;
//         var state = self.state;
//         var playable = true;
//         var answerState = state.answerState;
//
//         if($($(e.target).parent()).attr("class") == "or-choices-container"){
//             answerState.map(function(item){
//                 if($(e.target).attr("data") == item.passedData){
//                     if(item.isMoved){
//                         playable = false;
//                     }
//                 }
//             });
//         }
//
//         if(playable) {
//             playAudio($(e.target).attr("data"));
//         }
//     },
//
//     reset: function() {
//         var self = this;
//         var state = self.state;
//         var answerState = state.answerState;
//
//         answerState.map(function (item) {
//             item.isMoved = false;
//             item.currentBox = "";
//             item.currentBoxIndex = -1;
//         });
//
//         answerState = AGeneric().shuffle(answerState);
//
//         // change class to be the container of the media object
//         $(".or-choice-selection").each(function(i, item){
//             $(item).css("opacity", "1.0");
//         });
//
//         self.setState({
//             numMoved: 0,
//             answerState: answerState
//         });
//     },
//
//     componentWillMount: function() {
//         //PageStore.addChangeListener(this._onChange);
//     },
//
//     componentDidMount: function() {
//         //PageStore.addChangeListener(this._onChange);
//     },
//
//     componentWillUnmount: function() {
//         //PageStore.removeChangeListener(this._onChange);
//     },
//     render: function() {
//         var self = this;
//         var state = self.state;
//         var page = self.state.page;
//         var title = self.state.title;
//         var sources = self.state.sources;
//         var button = "";
//         var choices;
//         var answerState = state.answerState;
//         var numQuestions = answerState.length;
//         var correct = "glyphicon or-feedback or-correct ";
//         var incorrect = "glyphicon or-feedback or-incorrect ";
//         var answerContainers;
//
//         var isGraded = state.isGraded;
//         var numMoved = state.numMoved;
//
//         if(numMoved === numQuestions){
//             var isCorrect = true;
//             // check if correct and update accordingly
//
//             for(var i = 0; i < answerState.length; i++){
//                 if(answerState[i].currentBox !== answerState[i].letter){
//                     isCorrect = false;
//                     break;
//                 }
//             }
//
//             var audio = document.getElementById('mainViewAudio');
//             var source = document.getElementById('mainViewMp3Source');
//             if(isCorrect){
//                 // play correct audio
//                 source.src = "data/media/Correct.mp3";
//             } else {
//                 // play incorrect audio
//                 source.src = "data/media/Incorrect.mp3";
//                 button = <button className="btn btn-action or-tryAgain btn-rst" onClick={self.reset}>Try Again</button>; // reset button if wrong
//             }
//             if(audio && source) {
//                 audio.load();
//                 audio.play();
//                 audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
//             }
//         }
//         if(numMoved > 0 && numMoved < numQuestions){
//             button = <button className="btn btn-action or-clear btn-rst" onClick={self.reset}>Clear All</button>; // clear all button
//         }
//
//         choices = state.answerState.map(function(item, index){
//             var draggable = "";
//             switch (item.mediaType){
//                 case "audio":
//                     var zid = item.passedData;
//                     draggable =
//                         <a
//                             href="#"
//                             data-passed={item.passedData}
//                             data={zid}
//                             key={page.xid + "choice-"+index}
//                             className="or-playicon or-choice-selection"
//                             draggable="true"
//                             onDragStart={self.onDragging}
//                             onClick={self.onClick}>
//                             <span className="glyphicon">
//                                 <img src="images/icons/playrecordingn.png" />
//                             </span>
//                         </a>;
//                     break;
//                 case "image":
//                     var source = item.passedData;
//                     var letter = item.letter;
//                     draggable =
//                         <div>
//                             <img
//                                 data-passed={item.passedData}
//                                 key={page.xid + "choice-"+index}
//                                 className="or-choice-selection"
//                                 draggable="true"
//                                 data={letter}
//                                 onDragStart={self.onDragging}
//                                 src={"data/media/"+source}></img>
//                         </div>;
//                     break;
//                 case "string":
//                     // the letter of the answer in current answer Container
//                     var answerLetter = item.letter;
//                     var text = item.passedData;
//
//                     draggable =
//                         <a
//                             href="#"
//                             key={page.xid + "choice-"+index}
//                             data-passed={item.passedData}
//                             data={answerLetter}
//                             className="or-text-choice or-choice-selection"
//                             draggable="true"
//                             onDragStart={self.onDragging}>
//                             {text}
//                         </a>;
//                     break;
//                 default:
//                     // this shouldn't be reached unless you are moving videos, i hope
//             }
//
//             return (draggable);
//         });
//
//         answerContainers = state.page.matchTarget.map(function(item, index){
//             var answerPrompt = item.nut.uttering.utterance.translation.text;
//             var letter = item.letter;
//             var answerRender = (<div className="or-drop-area-index">
//                                     <span>
//                                         {index + 1}
//                                     </span>
//                                 </div>);
//             var feedback = "";
//             var needCheck = state.numMoved == answerState.length;
//
//             for(var i=0;i<state.answerState.length;i++){
//                 if(index === state.answerState[i].currentBoxIndex){
//
//                     var icon = "";
//                     if(needCheck){
//                         if(state.answerState[i].currentBox == state.answerState[i].letter){
//                             icon = (<img src="images/icons/completeexplorer.png"/>);
//                             feedback = correct;
//                         }else{
//                             icon = (<img src="images/icons/failedquiz.png"/>);
//                             feedback = incorrect;
//                         }
//                     }
//
//                     // check the matchsource media type, if audio then do the generic play image, else load specific image
//                     switch (state.answerState[i].mediaType) {
//                         case "audio":
//                             answerRender = <a
//                                 href="#"
//                                 data-passed={state.answerState[i].passedData}
//                                 data={state.answerState[i].passedData}
//                                 className="or-play-icon or-answer-placed"
//                                 draggable="true"
//                                 onDragStart={self.onDragging}
//                                 onClick={self.onClick}>
//                                 <span className="glyphicon ">
//                                     <img src="images/icons/playrecordn.png"/>
//                                 </span>
//
//
//                                 <div className={feedback}>
//                                     {icon}
//                                 </div>
//                             </a>;
//                             break;
//                         case "image":
//                             var source = answerState[i].passedData;
//                             answerRender =
//                                 <div>
//                                     <img
//                                         data-passed={source}
//                                         draggable="true"
//                                         className="or-answer-placed"
//                                         key={page.xid + "choice-"+index}
//                                         onDragStart={self.onDragging}
//                                         src={"data/media/"+source}></img>
//                                     <div className={feedback}>
//                                         {icon}
//                                     </div>
//                                 </div>;
//                             break;
//                         case "string":
//                             answerRender = (
//                                 <a
//                                     href="#"
//                                     data-passed={state.answerState[i].passedData}
//                                     className="or-text-choice or-answer-placed"
//                                     draggable="true"
//                                     onDragStart={self.onDragging}
//                                     >
//                                     {state.answerState[i].passedData}
//                                     <div className={feedback}>
//                                         {icon}
//                                     </div>
//                                 </a>
//                             );
//                             break;
//                         default:
//                         // this shouldn't be reached unless you are moving videos
//                     }
//                 }
//             }
//             return(<li className = "or-answer" key={page.xid + "answer-"+index}>
//                 <div className="or-answer-prompt">{answerPrompt}</div>
//                 <div className="or-answer-drop-area"
//                      data-letter={letter}
//                      data-index={index}
//                      onDragOver={self.onDraggingOver}
//                      onDrop={self.onDropping}>
//                     {answerRender}
//                 </div>
//             </li>);
//         });
//
//         return (
//             <div>
//                 <div className="or-container" key={"page-" + this.state.page.xid}>
//                     <PageHeader sources={sources} title={title} key={page.xid}/>
//                     <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
//                         <source id="mp3Source" src="" type="audio/mp3"></source>
//                         Your browser does not support the audio format.
//                     </audio>
//                     <h4 className="or-prompt">{state.prompt}</h4>
//
//                     <div className="container-fluid or-choice-answer-container">
//                         <div className="row">
//                             <div className="or-choices-container"
//                                 onDragOver={self.onDraggingOver}
//                                 onDrop={self.onDropping}>
//                                 {choices}
//                             </div>
//                         </div>
//                         <div className="row">
//                             <ul className="or-answers-container">
//                                 {answerContainers}
//                             </ul>
//                         </div>
//                         <div className="row">
//                             {button}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     },
//     /**
//      * Event handler for 'change' events coming from the BookStore
//      */
//     _onChange: function() {
//         this.setState(getPageState());
//     }
// });
//
// module.exports = OrderingView;