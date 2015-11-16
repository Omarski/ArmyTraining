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

    data.answerState = AGeneric().shuffle(data.answerState);

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

var SortingView = React.createClass({
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
        switch($(e.target).attr("class")){
            case "sorting-columnA-dropArea":
                dropLocation = "A";
                break;
            case "sorting-columnB-dropArea":
                dropLocation = "B";
                break;
            default:
                if($(e.target).parent().attr("class") == "sorting-columnA-dropArea"){
                    dropLocation = "A";
                }
                if($(e.target).parent().attr("class") == "sorting-columnB-dropArea"){
                    dropLocation = "B";
                }
        }

        var itemFound = false;
        if(state.numMoved != state.answerState && $(draggedItemTarget).css("opacity") != 0.3) {
            if (draggedItemData != "" && dropLocation != "") {
                answerState.map(function (item) {
                    if (draggedItemData == item.label) {
                        item.currentBox = dropLocation;
                        item.isMoved = true;
                        if ($($(draggedItemTarget).parent()).attr("class") == "sorting-choices-container") {
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

       // console.dir($($(e.target).parent()).attr("class"));
        if($($(e.target).parent()).attr("class") == "sorting-choices-container"){
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

        $(".sorting-playicon").each(function(i, item){
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
        var correct = "glyphicon sorting-feedback sorting-correct glyphicon-ok-circle";
        var incorrect = "glyphicon sorting-feedback sorting-incorrect glyphicon-remove-circle";
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
                button = <button className="btn-primary sorting-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }else{

            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn-default sorting-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }
        //a clear all button, and a reset button. These do the same thing but are displayed as different things


        choices = state.page.matchSource.map(function(item, index){
            return (<img key={"choice-"+index}
                         src={"./data/media/myPlay.jpg"}
                         data={item.nut.uttering.utterance.native.text}
                         className="sorting-playicon"
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
                    </img>);
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

        //console.dir(answerState);
        //console.log("colContent before answerState map...");


        answerState.map(function(item, index){
            var isCorrect = "";
            if(state.numMoved == answerState.length) {
                isCorrect = (item.currentBox == item.correctBox);
            }
            if(item.currentBox == "A"){
                colAContent.push({label: item.label, isCorrect: isCorrect});
            }
            if(item.currentBox == "B"){
                colBContent.push({label: item.label, isCorrect: isCorrect});
            }
        });

        //console.log("colContent before creating img's...");
        //console.dir(colAContent);
        //console.dir(colBContent);


        colARender = colAContent.map(function(itemA, index){
            var feedbackA = "";
            if(state.numMoved == answerState.length){
                if(itemA.isCorrect){
                    feedbackA = correct;
                }else{
                    feedbackA = incorrect;
                }
            }
            return( <div key={"colA-"+itemA.label}
                         className="sorting-playicon"
                         data={itemA.label}
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
                <img className="sorting-image" src={"./data/media/myPlay.jpg"}></img>
                <div className={feedbackA}></div>
            </div>);
        });

        //console.log("colBContent: ");
        //console.dir(colBContent);
        //console.log("colBContent.map: ");
        colBRender = colBContent.map(function(itemB, index){
            var feedbackB = "";
            if(state.numMoved == answerState.length){
                if(itemB.isCorrect){
                    feedbackB = correct;
                }else{
                    feedbackB = incorrect;
                }
            }
            return( <div key={"colB-"+itemB.label}
                         className="sorting-playicon"
                         data={itemB.label}
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
                <img className="sorting-image" src={"./data/media/myPlay.jpg"}></img>
                <div className={feedbackB}></div>
            </div>);
        });

        //console.log("colBRender: ");
        //console.dir(colBRender);
        //console.log(colBRender);
        //console.dir($(colBRender[0]));

        return (
            <div className="sorting-container">
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="sorting-prompt">{state.prompt}</div>
                <div className="sorting-buttons-container">{button}</div>
                <div className="sorting-choices-container">{choices}</div>
                <div className="sorting-answers-container">
                    <div className="sorting-columnA">
                        <div className="sorting-columnA-title">{colATitle}</div>
                        <div className="sorting-columnA-dropArea"
                             onDragOver={self.onDraggingOver}
                             onDrop={self.onDropping}>
                            {colARender}
                        </div>
                    </div>
                    <div className="sorting-columnB">
                        <div className="sorting-columnB-title">{colBTitle}</div>
                        <div className="sorting-columnB-dropArea"
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

module.exports = SortingView;