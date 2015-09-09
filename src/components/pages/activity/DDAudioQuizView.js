var React = require('react');
var PageStore = require('../../../stores/PageStore');


function playAudio(xid){
    console.log(xid);
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    source.src="data/media/" + xid + ".mp3";
    if(audio.paused){
        audio.load();
        audio.play();
    }else{
        audio.pause();
    }

}

function isPlaying(xid){
    var amPlay = false;

    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');

    var test = "data/media/" + xid + ".mp3";

    var short = source.src.substr(source.src.length - test.length);

    if(short == test){
        return(!audio.paused);
    }
    //console.log(amPlay);
    return amPlay;
}

function getPageState(props) {
    var data = props;
    data.answers = [];
    data.lines = [];
    data.submitLabel = "Submit";
    data.feedback = "";
    data.matchTarget = [];
    data.dragSrc = null;
    data.childHTML = null;
    data.needsRender = null;

    var line = {};
    data.page.matchSource.forEach(function(item){
        var ln = "";
        var hasLine = false;
        //if a matchSource has a line, then it will be displayed in the conversation
        item.nut.uttering.info.property.forEach(function(prop){
            if(prop.name == "line"){
                ln = prop.value;
                hasLine = true;
            }
        });
        // if matchSource has a line and a letter, it's letter is associated with
        // a correct answer
        if(hasLine){
            if(item.letter != ""){
                data.matchTarget.push(item.letter);
               // console.log("this should only be here 4 times");
            }
            // TODO: remove duplicates from matchTarget[] to allow for multiple correct answers
        }
        // if ln != to "" the matchSource has a line spot.
        if(ln != ""){
            if(!line[parseInt(ln)]) {
                line[parseInt(ln)] = [];
            }
            line[parseInt(ln)].push(item);
        }
    });
    data.lines = line;
   // console.log(data.matchTarget);
    // shuffle and add to answers[]
    // grab all answers from quiz for word bank
    var questions = data.page.matchSource;
    var len = questions.length;
    while (len--) {
        // for each matchSource
        var a = questions[len];
        if (a.letter != "") {
            // if it has a letter associated with it, it is a possible answer

            // get it's line number
            var ln = -1;
            a.nut.uttering.info.property.forEach(function(prop){
                if(prop.name == "line"){
                    ln = prop.value;
                }
            });

            // if there is no line number, return -1
            data.answers.push({
                answer: a,
                lineNumber: ln,
                letter: a.letter
            });
        }
    }

    data.answers = shuffle(data.answers); // randomize answers bank


    return {data};
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Set the size of the answer areas and all the draggable items to be the same as the largest
function setDraggableSize() {

    var dd_drop_answer_area = $('.dd-drop-answer-area');
    var dd_draggable_area = $('.dd-draggable-area');
    var maxWidth = 0;
    var maxHeight = 0;
    dd_draggable_area.each(function(index) {
        var w = $(this).width();
        var h = $(this).height();
        if (w > maxWidth) {
            maxWidth = w;
        }
        if (h > maxHeight) {
            maxHeight = h;
        }
    });
    dd_drop_answer_area.width(maxWidth).height(maxHeight);
    dd_draggable_area.width(maxWidth).height(maxHeight);
}

// gets all the answers and questions. Checks to see if answers are in their desired locations
// TODO:  multiple valid answers
function checkAnswers(state){
    var dd_answers = document.getElementsByClassName('answer-handle');
    var numCorrect = 0;
    var numWrong = 0;

    // for each answer-handle
    for(var index=0; index < dd_answers.length; index++){
      // console.log(index);
        if (dd_answers[index].childElementCount > 0) {
            var dataContainer = $(dd_answers[index].childNodes[0]);
            var qL = dataContainer.attr("data-question-letter");
          //  console.log(qL);
            console.dir(state.matchTarget);
            if ( qL == state.matchTarget[index] ) {
                // if the answer matches expected
              //  console.log("correct!");
                //console.log($($(dd_answers[dd_counter]).children()[0]).children()[1]);
                $(dd_answers[index]).parent().addClass("dd-drop-answer-area-correct");
                $($($(dd_answers[index]).children()[0]).children()[1]).css('display', 'block');
                numCorrect++;
            } else {
                // else it's wrong
              //  console.log("false");
                //console.log($($(dd_answers[dd_counter]).children()[0]).children()[0]);
                $(dd_answers[index]).parent().addClass("dd-drop-answer-area-incorrect");
                $($($(dd_answers[index]).children()[0]).children()[0]).css('display', 'block');
                numWrong++;
            }
        } else {
            // else no answer was given for this one
          //  console.log("empty answer, auto false");
            $(dd_answers[index]).addClass("dd-drop-answer-area-incorrect");
            numWrong++;
            React.render(
                <span className="glyphicon glyphicon-remove-circle answer-feedback-incorrect"></span>,
                $(dd_answers[index])[0]
            );
            $($(dd_answers[index]).children()[0]).css('display', 'block');
        }
      //  console.log("-------");
    }

    return ("You got "+ numCorrect + " of " + (numCorrect + numWrong) + " correct.");
}


var DDAudioQuizView = React.createClass({

    submit: function(event) {
      //  console.log("Submit pressed!");

        // if the page is timed return the duration the page was displayed for until the submit button was pressed.
        //if(true){
        // Date.now() returns the number of milliseconds since 1970/01/01
        //alert(Date.now()-timer);
        //}

        // if we need the Answers to be checked when the submit button is pressed
        //if(true){
        //console.log(this.state);
        // }

        this.setState({
            feedback: checkAnswers(this.state)
        });
    },

    itemMouseOver: function(event){
        // as of 8/31/15, undefined == the <p> with the npc text, dd-answer-area-text (the words between answers in
        // in the answer area, amd dd-word-bank-text ( the draggable answers)
        //console.log("over");
        //console.log($(event.target).attr("class"));
        var data = this.state;
        var xid;
        switch ($(event.target).attr("class")) {
            case "dd-word-bank-text":
                if(!$($(event.target)[0].parentElement).hasClass("audio-disabled")){
                    //console.log("draggable and is not disabled");
                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            xid = (item.nut.uttering.media[0].zid);
                        }
                    });
                    if($($(event.target).parent()[0]).children().length > 3){
                        if( isPlaying(xid) ){
                            $($($(event.target).parent()[0]).children()[3]).css('display', 'inline');
                        } else {
                            $($($(event.target).parent()[0]).children()[2]).css('display', 'inline');
                        }
                    }else {
                        if (isPlaying(xid)) {
                            $($($(event.target).parent()[0]).children()[1]).css('display', 'inline');
                        } else {
                            $($($(event.target).parent()[0]).children()[0]).css('display', 'inline');
                        }
                    }
                }
                break;

            case "dd-answer-area-text":
                data.page.matchSource.forEach(function(item){
                    // if this item is what we clicked on
                    if(item.nut.uttering.utterance.native.text == event.target.children[2].innerHTML){
                        // play audio
                        xid = item.nut.uttering.media[0].zid;
                    }
                });
                    if (isPlaying(xid)) {
                        $($(event.target).children()[1]).css('display', 'inline');
                    } else {
                        $($(event.target).children()[0]).css('display', 'inline');
                    }

                break;

            default:
                if($(event.target).parent()[0].className == "dd-answer-area-text") {
                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            xid = (item.nut.uttering.media[0].zid);
                        }
                    });
                    if( isPlaying(xid) ){
                        $($($(event.target).parent()[0]).children()[1]).css('display', 'inline');
                    } else {
                        $($($(event.target).parent()[0]).children()[0]).css('display', 'inline');
                    }
                }

                // else do nothing

                break;
        }

    },
    itemMouseOff: function(event){
        //console.log("off");
        switch ($(event.target).attr("class")) {
            case "dd-word-bank-text":
                //console.dir($(event.target).children());
                if($($(event.target).parent()[0]).children().length > 3){
                        $($($(event.target).parent()[0]).children()[2]).css('display', 'none');
                        $($($(event.target).parent()[0]).children()[3]).css('display', 'none');
                }else {
                        $($($(event.target).parent()[0]).children()[1]).css('display', 'none');
                        $($($(event.target).parent()[0]).children()[0]).css('display', 'none');
                }
                break;

            case "dd-answer-area-text":
                //$(event.target).css("background-color", "white");
                $($(event.target).children()[0]).css('display', 'none');
                $($(event.target).children()[1]).css('display', 'none');
                break;

            default:
                if($(event.target).parent()[0].className == "dd-answer-area-text"){
                    //console.log("text of plain text in question");
                    $($($(event.target).parent()[0]).children()[0]).css('display', 'none');
                    $($($(event.target).parent()[0]).children()[1]).css('display', 'none');
                }

                // else do nothing

                break;
        }
    },

    handleClick: function(event) {
        var data = this.state;
        switch($(event.target).attr("class")){
            case "dd-word-bank-text":
                if(!$($(event.target)[0].parentElement).hasClass("audio-disabled")){
                    //console.log("draggable and is not disabled");
                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            playAudio(item.nut.uttering.media[0].zid);
                        }
                    });

                }
                break;
            case "dd-answer-area-text":
                //console.log("area around text of questions");
                data.page.matchSource.forEach(function(item){
                    // if this item is what we clicked on
                    if(item.nut.uttering.utterance.native.text == event.target.children[2].innerHTML){
                        // play audio
                        playAudio(item.nut.uttering.media[0].zid);
                    }
                });

                break;
            case "dd-draggable-area":
                console.log("lineNumber " + $($(event.target)[0]).attr("data-question-id") + " : orderIndex "
                    + $($(event.target)[0]).attr("data-order-index"));
                break;
            case "img-thumbnail dd-answer-image":
                if(!$($(event.target)[0].parentElement).hasClass("audio-disabled")){
                    console.log("lineNumber " + $($(event.target)[0].parentElement).attr("data-question-id") + " : orderIndex "
                        + $($(event.target)[0].parentElement).attr("data-order-index"));
                }
                break;
            default:

                if($(event.target).parent()[0].className == "dd-answer-area-text"){
                    //console.log("text of plain text in question");
                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            playAudio(item.nut.uttering.media[0].zid);
                        }
                    });
                }
                break;
        }
    },

    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState.data;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        setDraggableSize();
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    // TODO: Cancel and remove answer
    onDragging: function(e){
        // TODO: fix d&d in firefox
        //e.dataTransfer.setData('Text', this.id);
        e.dataTransfer.setData('text/plain', 'anything');
        //event.target is the source node
      //  console.log("handleDrag target: ");
        //console.log($(e.target)[0]);
        this.state.dragSrc = e.target;
        if($(this.state.dragSrc).children().length > 3){
            this.setState({
                childHTML: $($(this.state.dragSrc).children()[4])
            });

        }else{
            this.setState({
                childHTML: $($(this.state.dragSrc).children()[2])
            });
        }
    },
    onDropping: function(e){
        e.preventDefault();
        e.stopPropagation();

        if(this.state.dragSrc != null) {
          //  console.log("handleDrop target: ");
          //  console.log(e.target);
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            var $this = this;
            var DropComponent = React.createClass({
                componentDidMount: function () {
                    setDraggableSize();
                    //-----------------------------------------------------------------------------------------------------
                },
                render: function () {
                    var cls = $($this.state.dragSrc).attr("class");
                    var data_question_id = $($this.state.dragSrc).attr("data-question-id");
                    var data_question_letter = $($this.state.dragSrc).attr("data-question-letter");
                    var inner;
                    switch ($this.state.childHTML.attr("class")) {
                        case "img-thumbnail dd-answer-image":
                            inner = <img className={$this.state.childHTML.attr("class")}
                                         draggable={false}
                                         src={$this.state.childHTML.attr("src")}></img>;
                            break;
                        default:
                            inner = <div className={$this.state.childHTML.attr("class")}>{
                                $this.state.childHTML[0].innerHTML}</div>;
                            break;
                    }
                    return (
                        <div className={cls}
                             data-question-id={data_question_id}
                             data-question-letter={data_question_letter}
                             onClick={$this.handleClick}
                             onMouseOver={$this.itemMouseOver}
                             onMouseOut={$this.itemMouseOff}
                             draggable={true}
                             onDragStart={$this.onDragging}>
                            <span className="glyphicon glyphicon-remove-circle answer-feedback-incorrect"></span>
                            <span className="glyphicon glyphicon-ok-circle answer-feedback-correct"></span>
                            <span className="glyphicon glyphicon-play-circle mouseover-play"></span>
                            <span className="glyphicon glyphicon-ban-circle mouseover-stop"></span>
                            {inner}
                        </div>
                    );
                }
            });
            if($this.state.needsRender){
                React.render(
                    <DropComponent />,
                    e.target
                );
            }

            if ($($this.state.dragSrc).parent().attr("class") == "answer-handle") {
                //console.log($(dragSrc).parent()[0]);
                console.log(e.target);
                React.unmountComponentAtNode($($this.state.dragSrc).parent()[0]);
                var movedItem = $this.state.childHTML[0].innerHTML;
                var listItems = document.getElementsByClassName("dd-answer-list-item");
                //console.log(movedItem);
                if($(e.target).attr("class") == "dd-word-bank-text") {
                    for (var i = 0; i < listItems.length; i++) {
                        //console.log(listItems[i].childNodes[0].childNodes[2].innerHTML);
                        // match movedItem to it's corresponding item in the answer list
                        if (movedItem == listItems[i].childNodes[0].childNodes[2].innerHTML) {
                            listItems[i].childNodes[0].style.opacity = '1.0';
                            listItems[i].childNodes[0].setAttribute("draggable", "true");
                            $(listItems[i].childNodes[0]).removeClass("audio-disabled");
                        }
                    }
                }

            } else {
                if($(e.target).attr("class") != "dd-word-bank-text") {
                    $this.state.dragSrc.style.opacity = '0.4';
                    $this.state.dragSrc.setAttribute("draggable", "false");
                    $($this.state.dragSrc).addClass("audio-disabled");
                }
            }
            this.setState({
                dragSrc: null
            });
            this.setState({
                childHTML: null
            });
        }
        return false;
    },
    onDraggingOver: function(e){
        this.setState({
            needsRender: null
        });

        if($(e.target).attr("class") == "answer-handle"){
            //if answer-handle empty drop spot
            e.preventDefault();
            this.setState({
                needsRender: true
            });
        }

        if( $(e.target).parent().parent().attr("class") == "dd-answer-list-item" ){
            // if answer-handle, in P
            // if dd-answer-list-item then word bank
            e.preventDefault();
            this.setState({
                needsRender: false
            });
        }

        if( $(e.target).parent().parent().attr("class") == "answer-handle" ){

        }
    },

    render: function() {
        var st = this.state;
        var self = this;
        // word bank, answers are MatchSources
        var answers = st.answers.map(function(item, index) {
            //item = {answer: "", lineNumber: -1, letter: ""}
            var component = <div className="dd-word-bank-text">{item.answer.nut.uttering.utterance.native.text}</div>;
            //console.log(item);
            //if (item.answer.type === "image") {
            //component = <img className="img-thumbnail dd-answer-image" draggable="false" src={item.answer.image}/>
            //}
            return (
                <li className="dd-answer-list-item" key={index}>

                    <div
                        className="dd-draggable-area"
                        draggable="true"
                        onDragStart={self.onDragging}
                        onDragOver={self.onDraggingOver}
                        onDrop={self.onDropping}
                        data-question-id={item.lineNumber}
                        data-question-letter={item.letter}
                        onMouseOver={self.itemMouseOver}
                        onMouseOut={self.itemMouseOff}
                        onClick={self.handleClick}
                        ><span className="glyphicon glyphicon-play-circle mouseover-play"></span>
                        <span className="glyphicon glyphicon-ban-circle mouseover-stop"></span>
                        {component}

                    </div>
                </li>
            )
        });


        // drop area
        var lines = Object.keys(st.lines).map(function(linesKey, index) {
            var line = st.lines[linesKey];
            var speaker = "";
            var parts = Object.keys(line).map(function(msKey, aIndex) {
                var ms = line[msKey];
                var result = "";
                var answerCls = "dd-drop-answer-area";
                var flag = "";
                //  if (answer.type === "image") {
                //     answerCls += " dd-drop-answer-image";
                // }

                //    if (answer.correct === true) {
                //        answerCls += " dd-drop-answer-area-correct";
                //        flag = <span className="glyphicon glyphicon-ok-circle dd-flag dd-correct-flag" aria-hidden="true"></span>
                //    }

                //   if (answer.correct === false) {
                //        answerCls += " dd-drop-answer-area-incorrect";
                //        flag = <span className="glyphicon glyphicon-remove-circle dd-flag dd-incorrect-flag" aria-hidden="true"></span>
                //    }

                ms.nut.uttering.info.property.forEach(function(prop){
                    if(prop.name == "speaker"){
                        speaker = prop.value + ":";
                    }
                });

                if (ms.letter != "") {
                    result = <div className={answerCls} onDrop={self.onDropping} onDragOver={self.onDraggingOver}>
                        &nbsp;
                        {flag}
                        <div className="answer-handle"></div>
                    </div>
                } else {
                    var needRender = true;
                    ms.nut.uttering.info.property.forEach(function(prop){
                        if(prop.name == "full") {
                            needRender = false;
                        }
                    });
                    if(needRender) {
                        result = <div className="dd-answer-area-text"
                                      data-question-id={index+1}
                                      data-question-letter={""}
                                      onMouseOver={self.itemMouseOver}
                                      onMouseOut={self.itemMouseOff}
                                      onClick={self.handleClick}>
                            <span className="glyphicon glyphicon-play-circle mouseover-play"></span>
                            <span className="glyphicon glyphicon-ban-circle mouseover-stop"></span>
                            {ms.nut.uttering.utterance.native.text}
                        </div>
                    }
                }

                return (
                    <div key={aIndex}>
                        {result}
                    </div>
                )
            });
            // userLabel is the speaker, answers will be the list of objects on that line
            // index is incremental, might be able to test against lineNumber
            return (
                <div key={index}>
                    <div className="dd-answer-area">
                        <div className="dd-answer-area-text">
                            <span className="dd-player-label">{speaker}&nbsp;</span>
                        </div>
                        {parts}
                    </div>
                </div>
            )
        });

        // questions is a list of lines that contain a list of objects
        return (
            <div className="container dd-container">
                <div className="row dd-quiz-title">
                    <h3>{this.state.page.title}</h3>
                </div>
                <div className="row dd-quiz-feedback">
                    <h4>{this.state.feedback}</h4>
                </div>
                <div className="row">
                    <div className="dd-quiz-container">
                        <div className="col-md-11">
                            {lines}
                        </div>
                        <div className="col-md-1">
                            <ul className="dd-answer-list">
                                {answers}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="row dd-quiz-feedback">
                    <button className="btn btn-default" onClick={this.submit}>{this.state.submitLabel}</button>
                    <audio id="audio">
                       /* <source id="oggSource" src="" type="audio/ogg"></source> */
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
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

module.exports = DDAudioQuizView;