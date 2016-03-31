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
    //audio.src = "data/media/" + xid + ".mp3";
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
                button = <button className="btn btn-action sorting-tryAgain" onClick={self.reset}>Try Again</button>; // reset button if wrong
            }
        }
        if(numMoved > 0 && numMoved < numQuestions){
            button = <button className="btn btn-action sorting-clear" onClick={self.reset}>Clear All</button>; // clear all button
        }
        //a clear all button, and a reset button. These do the same thing but are displayed as different things

// why is this span here?
            // check the matchsource media type, if audio then do the generic play image, else load specific image
        <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
        choices = state.page.matchSource.map(function(item, index){
            return (<li className="sorting-choices-container" key={page.xid + "choice-"+index}>
                        <div
                             data={item.nut.uttering.utterance.native.text}
                             draggable="true"
                             onDragStart={self.onDragging}
                             onClick={self.onClick}
                             className="sorting-playicon"
                            >
                            <span className="glyphicon glyphicon-play-circle sorting-playicon"></span>
                        </div>
                    </li>);
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

        colARender = colAContent.map(function(itemA, index){
            var feedbackA = "";
            if(state.numMoved == answerState.length){
                if(itemA.isCorrect){
                    feedbackA = correct;
                }else{
                    feedbackA = incorrect;
                }
            }


            result = <div key={page.xid + "colA-"+itemA.label}
                              className="sorting-playicon"
                              data={itemA.label}
                              draggable="true"
                              onDragStart={self.onDragging}
                              onClick={self.onClick}>
                <span className="glyphicon glyphicon-play-circle"></span>
                <div className={feedbackA}></div>
            </div>;

            return(result );
        });

        colBRender = colBContent.map(function(itemB, index){
            var feedbackB = "";
            if(state.numMoved == answerState.length){
                if(itemB.isCorrect){
                    feedbackB = correct;
                }else{
                    feedbackB = incorrect;
                }
            }

            return( <div key={page.xid + "colB-"+itemB.label}
                         className="sorting-playicon"
                         data={itemB.label}
                         draggable="true"
                         onDragStart={self.onDragging}
                         onClick={self.onClick}>
                        <span className="glyphicon glyphicon-play-circle"></span>
                        <div className={feedbackB}></div>
                    </div>);
        });

        return (
            <div>
                <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                <div className="container">
                    <audio id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="row">
                        <h4>
                            {state.prompt}
                        </h4>
                    </div>
                    <div className="row sorting-choices-container">
                        <ul className="sorting-choices-list">{choices}</ul>
                    </div>
                    <div className="row">
                        <div className="col-md-6 sorting-columnA">
                            <div className="panel panel-default">
                                <div className="panel-heading sorting-panel-heading">{colATitle}</div>
                                <div className="panel-body">
                                    <div className="sorting-columnA-dropArea sorting-drop-area"
                                         onDragOver={self.onDraggingOver}
                                         onDrop={self.onDropping}>
                                        {colARender}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 sorting-columnB">
                            <div className="panel panel-default">
                                <div className="panel-heading sorting-panel-heading">{colBTitle}</div>
                                <div className="panel-body">
                                    <div className="sorting-columnB-dropArea sorting-drop-area"
                                         onDragOver={self.onDraggingOver}
                                         onDrop={self.onDropping}>
                                        {colBRender}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row sorting-actions">{button}</div>
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