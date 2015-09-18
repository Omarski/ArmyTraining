var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');

var DROP_ANSWER_AREA_CLS = "dd-drop-answer-area";
var WORD_BANK_TEXT_CLS = "dd-word-bank-text";
var DRAGGABLE_AREA_CLS = "dd-draggable-area";
var ANSWER_HANDLE_CLS = "answer-handle";
var ANSWER_AREA_CLS = "dd-answer-area";
var ANSWER_AREA_TEXT_CLS = "dd-answer-area-text";
var ANSWER_AREA_CORRECT_CLS = "dd-drop-answer-area-correct";
var ANSWER_AREA_WRONG_CLS = "dd-drop-answer-area-incorrect";
var ANSWER_LIST_ITEM_CLS = "dd-answer-list-item";

// TODO: Make submit button change page to read-only
// TODO: on drop, hide element from word list
// TODO: boxes around paragraph and word list
/*
    TODO: switch from jquery to updating the state for react to use.
 */

// Plays Audio filed named with the xid(zid?) given
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

// Returns True if the audio component is currently playing something, false otherwise.
function isPlaying(xid){
    var isBeingPlayed = false;
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    var test = "data/media/" + xid + ".mp3";
    var short = source.src.substr(source.src.length - test.length);

    if(short == test){
        return(!audio.paused);
    }
    return isBeingPlayed;
}

// Initializes the state of the page with the JSON given in props
function getPageState(props) {
    var data = {
        page: props.page,
        answers: [],
        lines: [],
        submitLabel: "Submit",
        resetLabel: "Reset",
        feedback: "",
        matchTarget: [],
        dragSrc: null,
        childHTML: null,
        needsRender: null,
        volume: SettingsStore.voiceVolume()
    };
    var msArray = data.page.matchSource;
    var line = {};
    // collect all matchSource items to be printed in the paragraph, and create the list to be used to check
    // correct answers
    msArray.forEach(function(item){
        var ln = "";
        var utteringInfo = item.nut.uttering.info || {property: []};
        var infoProps = utteringInfo.property;

        //if a matchSource has a line, then it will be displayed in the conversation
        // scan properties for line, and save the value
        infoProps.forEach(function(prop){
            if(prop.name == "line"){
                ln = prop.value;
            }
        });

        // if ln != to "" the matchSource has a line spot.
        if(ln != ""){
            // if it also has a letter, it is associated with a correct answer
            if(item.letter != ""){
                data.matchTarget.push(item.letter);
            }

            if(!line[parseInt(ln)]) {
                line[parseInt(ln)] = [];
            }
            line[parseInt(ln)].push(item);
        }
    });
    data.lines = line;

    // shuffle and add to answers[]
    // grab all answers from quiz for word bank
    var questions = msArray || [];
    var len = questions.length;
    while (len--) {
        // for each matchSource
        var a = questions[len];
        if (a.letter != "") {
            // if it has a letter associated with it, it is a possible answer

            // get it's line number
            var ln = -1;
            var aInfo = a.nut.uttering.info || {property: []};
            aInfo.property.forEach(function(prop){
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
    return data;
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
// Also centers play/stop icons on clickables
function setDraggableSize() {
    var dropAnswerArea = $('.' + DROP_ANSWER_AREA_CLS);
    var wordBankText = $('.' + WORD_BANK_TEXT_CLS);
    var draggableArea = $('.' + DRAGGABLE_AREA_CLS);
    var wordListGlyphCls = $(".wl");
    var glyphicon = $(".glyphicon");
    var plainTextGlyphCls = $(".na");
    var droppedAnswerGlyphCls = $(".ad");
    var maxWidth = 0;
    var maxHeight = 0;
    var buffer = 35;
    var marginTop = 90;
    var ansHeight = 50;

    draggableArea.each(function() {
        var w = $(this).width();
        var h = $(this).height();
        if (w > maxWidth) {
            maxWidth = w;
        }
        if (h > maxHeight) {
            maxHeight = h;
        }
    });

    dropAnswerArea.width(maxWidth).height(maxHeight);
    draggableArea.width(maxWidth).height(maxHeight);
    glyphicon.css('z-index', '255');
    wordBankText.css('position', 'relative');
    wordListGlyphCls.css('position', 'relative');
    wordListGlyphCls.css( 'font-size', (26 + 'px') );
    plainTextGlyphCls.css('font-size', '26px');
    droppedAnswerGlyphCls.css('font-size', '26px');
    wordListGlyphCls.css('font-size', '26px');

    var icons = document.getElementsByClassName("wl");
    Array.prototype.forEach.call(icons, function (item, index) {
        var _item = $(item);
        _item.css('left', ( (maxWidth/2 - 13 ) + 'px' ) );
        _item.css('top', (  ( 'calc(50% - 13px)' ) ));
        _item.css('float', 'left');
    });

    var answerItems = document.getElementsByClassName(ANSWER_LIST_ITEM_CLS);
    Array.prototype.forEach.call(answerItems, function(item, index){
        var _item = $(item);
        _item.css('top', ( ( buffer + (buffer*index) + (maxHeight*index) )+'px'));
    });

    var answerArea = document.getElementsByClassName(ANSWER_AREA_CLS);
    Array.prototype.forEach.call(answerArea, function(item, index){
        var _item = $(item);
        _item.css('top', ( ( (ansHeight*index) +marginTop)+'px'));
        if(index%2 == 0){
            _item.css('background', '#d7d7d7');
        }else{
            _item.css('background', '#c4c4c4');
        }
    });
}

// gets all the answers and questions. Checks to see if answers are in their desired locations
function checkAnswers(state){
    var ddAnswers = document.getElementsByClassName('answer-handle');
    var numCorrect = 0;
    var numWrong = 0;
    var isMissingAnswer = false;

    Array.forEach(ddAnswers, function(ans){
        if($(ans).children().length == 0){
            isMissingAnswer = true;
        }
    });
    if(isMissingAnswer){
        alert("Please fill in every answer.");
        return ("");
    }else {
        // for each answer-handle
        for (var index = 0; index < ddAnswers.length; index++) {
            var _parent = $(ddAnswers[index]).parent();
            var _child = $(ddAnswers[index].childNodes[0]);
            var questionLetter = _child.attr("data-question-letter");

            // if the letter of the answer is what is expected, then it is correct
            if (questionLetter == state.matchTarget[index]) {
                _parent.addClass("dd-drop-answer-area-correct");
                var glyphCorrect = $($($(ddAnswers[index]).children()[0]).children()[1]);
                glyphCorrect.css('display', 'block');
                numCorrect++;
            } else {
                // else it's wrong
                _parent.addClass("dd-drop-answer-area-incorrect");
                var glyphWrong = $($($(ddAnswers[index]).children()[0]).children()[0]);
                glyphWrong.css('display', 'block');
                numWrong++;
            }
        }
        var total = numCorrect + numWrong;
        if (numCorrect > 0 && numCorrect == total) {
            // if you got all questions correct, play reward audio
            var rewardZid = 0;
            Array.forEach(state.page.matchSource, function (ms) {
                var uttering = ms.nut.uttering;
                var utteringInfo = uttering.info || {property: []};
                //ms.nut.uttering.info.property[0].name == "full"
                Array.forEach(utteringInfo.property, function (prop) {
                    if (prop.name == "full") {
                        rewardZid = uttering.media[0].zid;
                    }
                });
            });
            if (rewardZid != 0) {
                playAudio(rewardZid);
            }
        }
        return ("You got " + numCorrect + " of " + total + " correct.");
    }
}


var DDAudioQuizView = React.createClass({
    // when the submit button is pressed
    submit: function() {
        this.setState({
            feedback: checkAnswers(this.state)
        });

        /*
            TODO: make paragraph read-only
            - no mouseover
            - no click for audio
            - no dragging
            - mouse doesn't change to hand
         */
    },

    // when the reset button is pressed
    reset: function(){
        // clear the feedback text
        this.setState({
            feedback: ""
        });

        //dismount all the react components on the answer handles
        var answerHandles = document.getElementsByClassName(ANSWER_HANDLE_CLS);
        Array.prototype.forEach.call(answerHandles, function(item){
            React.unmountComponentAtNode(item);
        });

        // Clear All Answer-Handles of draggables and correct/incorrect classes
        var answerArea = document.getElementsByClassName(DROP_ANSWER_AREA_CLS);
        Array.prototype.forEach.call(answerArea, function (item) {
            $(item).removeClass(ANSWER_AREA_CORRECT_CLS);
            $(item).removeClass(ANSWER_AREA_WRONG_CLS);
        });

        var draggableArea = document.getElementsByClassName(DRAGGABLE_AREA_CLS);
        Array.prototype.forEach.call(draggableArea, function (item) {
            $(item).css('opacity', '1.0');
            $(item).removeClass("audio-disabled");
            $(item).css('display', 'inherit' );
            $(item).attr('draggable', 'true');
        });

        /*
            TODO: undo read only status
         */

    },

    // called when the mouse is brought over various objects
    itemMouseOver: function(event){
        var zid = 0;
        var _parent = $($(event.target)[0].parentElement);
        var _target = $(event.target);

        // switch functions based on what class is moused over (this is due to inheritence issues)
        switch (_target.attr("class")) {
            // dd-word-bank-text is the child element of a draggable
            case WORD_BANK_TEXT_CLS:
                if(!_parent.hasClass("audio-disabled")){
                    _target.css("opacity", "0.4");
                    this.state.page.matchSource.forEach(function(item){
                        var uttering = item.nut.uttering;
                        // if this item we are over
                        if(uttering.utterance.native.text == event.target.innerHTML){
                            zid = (uttering.media[0].zid);
                        }
                    });
                        var targetGlyphs = _parent.children();
                        if (targetGlyphs.length > 3) {
                            var glyphPlayAH = $(targetGlyphs[2]);
                            var glyphStopAH = $(targetGlyphs[3]);
                            if (isPlaying(zid)) {
                                glyphStopAH.css('display', 'inline');
                            } else {
                                glyphPlayAH.css('display', 'inline');
                            }
                        } else {
                            var glyphPlayWL = $(targetGlyphs[0]);
                            var glyphStopWL = $(targetGlyphs[1]);
                            if (isPlaying(zid)) {
                                glyphStopWL.css('display', 'inline');
                            } else {
                                glyphPlayWL.css('display', 'inline');
                            }
                        }
                }
                break;

            // dd-answer-area-text is the area around the clickable text in the paragraph
            case ANSWER_AREA_TEXT_CLS:
                var textAreaGlyphs = $(event.target).children();
                var glyphPlay = $(textAreaGlyphs[0]);
                var glyphStop = $(textAreaGlyphs[1]);

                this.state.page.matchSource.forEach(function(item){
                    var uttering = item.nut.uttering;
                    var fadeTarget = $($(event.target).children()[2]);
                    fadeTarget.css('opacity', '0.4');

                    // if this item is what we clicked on
                    if(uttering.utterance.native.text == event.target.children[2].innerHTML){
                        // play audio
                        zid = uttering.media[0].zid;
                    }
                });

                if (isPlaying(zid)) {
                    glyphStop.css('display', 'inline');
                } else {
                    glyphPlay.css('display', 'inline');
                }
                break;

            default:

                // else do nothing
                break;
        }

    },

    // set opacity of mouse-over target back to 100% and hide all glyphicons
    itemMouseOff: function(event){
        var _target = $(event.target);
        _target.css("opacity", "1.0");
        switch (_target.attr("class")) {
            case WORD_BANK_TEXT_CLS:
                var draggableChildren = $(_target.parent()[0]).children();

                if(draggableChildren.length > 3){
                    var glyphPlayAH = $(draggableChildren[2]);
                    var glyphStopAH = $(draggableChildren[3]);
                        // answer-handle glyphicons
                    glyphPlayAH.css('display', 'none');
                    glyphStopAH.css('display', 'none');
                }else {
                    var glyphPlayWL = $(draggableChildren[0]);
                    var glyphStopWL = $(draggableChildren[1]);
                        // word-list glyphicons
                    glyphPlayWL.css('display', 'none');
                    glyphStopWL.css('display', 'none');
                }
                break;

            case ANSWER_AREA_TEXT_CLS:
                var targetChildren = _target.children();
                var fadeTarget =  $(targetChildren[2]);
                var glyphPlayTXT = $(targetChildren[0]);
                var glyphStopTXT = $(targetChildren[1]);
                // mouse-over target is not what was faded, [2] is the text that was faded, [0] and [1] are glyphicons
                fadeTarget.css('opacity', '1.0');
                glyphPlayTXT.css('display', 'none');
                glyphStopTXT.css('display', 'none');
                break;

            default:

                // else do nothing

                break;
        }
    },

    handleClick: function(event) {
        var data = this.state;
        var zid = 0;
        switch($(event.target).attr("class")){
            // word bank is what get's the click event inside draggable areas
            case WORD_BANK_TEXT_CLS:
                var _parent_element = $($(event.target)[0].parentElement);
                if(!_parent_element.hasClass("audio-disabled")){
                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            zid = item.nut.uttering.media[0].zid;
                            playAudio(zid);
                        }
                    });
                    var _glyphicon_array = $($(event.target).parent()[0]).children();
                    /*
                     [0] = word list "play" glyphicon
                     [1] = word list "stop" glyphicon
                     [2] = answer-handle "play" glyphicon
                     [3] = answer-handle "stop" glyphicon
                     */
                    if(_glyphicon_array.length > 3){
                        if(isPlaying(zid)) {
                            $(_glyphicon_array[2]).css('display', 'none');
                            $(_glyphicon_array[3]).css('display', 'inline');
                        }
                    }else {
                        if(isPlaying(zid)) {
                            $(_glyphicon_array[0]).css('display', 'none');
                            $(_glyphicon_array[1]).css('display', 'inline');
                        }
                    }

                }
                break;

            // the div containing the span
            case ANSWER_AREA_TEXT_CLS:
                // child [0] is play, child[1] is stop
                data.page.matchSource.forEach(function(item){
                    // if this item is what we clicked on
                    if(item.nut.uttering.utterance.native.text == event.target.children[2].innerHTML){
                        // play audio
                        zid = item.nut.uttering.media[0].zid;
                        playAudio(zid);
                    }
                });
                var _answer_area_text_glyphicons = $(event.target).children();
                /*
                 [0] = "play" glyphicon
                 [1] = "stop" glyphicon
                 */
                if(isPlaying(zid)) {
                    $(_answer_area_text_glyphicons[0]).css('display', 'none');
                    $(_answer_area_text_glyphicons[1]).css('display', 'inline');
                }

                break;
            case "img-thumbnail dd-answer-image":
                // placeholder for image answers
                break;
            default:
                // do nothing
                break;
        }
    },

    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        setDraggableSize();
        var audioTarget = $('audio,video');
        audioTarget.prop("volume", SettingsStore.voiceVolume());
        // if muted, then reduce volume to 0
        if(audioTarget.prop("muted")){
            audioTarget.prop("volume", 0);
        }

        var texts = document.getElementsByClassName("na");
        Array.prototype.forEach.call(texts, function (item) {
            $(item).css('left', ( ($(item).parent().width()/2 - 13) + 'px') );
            $(item).css('top', ( ($(item).parent().height()/2 ) + 'px') );
        });
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    onDragging: function(e){
        e.dataTransfer.setData('text/plain', 'anything');
        this.state.dragSrc = e.target;
        // if dragging a proper element, we record the html of the child element that holds text, stored in dragSrc.
        // other children are glyphicons that always remain the same
        if($(this.state.dragSrc).children().length > 3){
            this.setState({
                // answer-handle draggables have 4 glyphicons (0-3)
                childHTML: $($(this.state.dragSrc).children()[4])
            });

        }else{
            this.setState({
                // word list draggables have 2 glyphicons (0-1)
                childHTML: $($(this.state.dragSrc).children()[2])
            });
        }
    },
    onDropping: function(e){
        // preventDefault stops the default drop code from running so we can write our own function using React
        e.preventDefault();
        // stopPropagation stops some browsers from attempting to forward to the dropped item as a URL
        e.stopPropagation();

        if(this.state.dragSrc != null) {
            var $this = this;
            // Construct the component to be dropped in the answer-handle
            var DropComponent = React.createClass({
                componentDidMount: function () {
                    setDraggableSize();
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
                            <span className="glyphicon glyphicon-play-circle mouseover-play ad"></span>
                            <span className="glyphicon glyphicon-stop mouseover-stop ad"></span>
                            {inner}
                        </div>
                    );
                }
            });

            // if we are moving the item to an answer-handle
            if($this.state.needsRender){
                React.render(
                    <DropComponent />,
                    e.target
                );
            }

            if ($($this.state.dragSrc).parent().attr("class") == "answer-handle") {
                React.unmountComponentAtNode($($this.state.dragSrc).parent()[0]);
                var movedItem = $this.state.childHTML[0].innerHTML;
                var listItems = document.getElementsByClassName("dd-answer-list-item");
                console.log($(e.target).attr("class"));
                if($(e.target).attr("class") == "dd-word-bank-text" ||$(e.target).attr("class") == "word-list" ) {
                    for (var i = 0; i < listItems.length; i++) {
                        // match movedItem to it's corresponding item in the answer list
                        if (movedItem == listItems[i].childNodes[0].childNodes[2].innerHTML) {
                            listItems[i].childNodes[0].style.opacity = '1.0';
                            listItems[i].childNodes[0].setAttribute("draggable", "true");
                            $(listItems[i].childNodes[0]).removeClass("audio-disabled");
                            $(listItems[i].childNodes[0]).css('display', 'inherit');
                        }
                    }
                }

            } else {
                if($(e.target).attr("class") != "dd-word-bank-text") {
                    $this.state.dragSrc.style.opacity = '0.4';
                    $this.state.dragSrc.setAttribute("draggable", "false");
                    $($this.state.dragSrc).addClass("audio-disabled");
                    $($this.state.dragSrc).css('display', 'none');
                }
            }
            this.setState({
                dragSrc: null
            });
            this.setState({
                childHTML: null
            });

            var texts = document.getElementsByClassName("ad");
            Array.prototype.forEach.call(texts, function (item) {
                $(item).css('left', ( ($(item).parent().width()/2 - 13) + 'px') );
                $(item).css('top', ( ($(item).parent().height()/2 - 13) + 'px') );
            });
        }
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

        if( $(e.target).attr("class") == "word-list" ){
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
        var needReset = true;
        var st = this.state;
        var self = this;
        // word bank, answers are MatchSources
        var answers = st.answers.map(function(item, index) {
            var component = <div className="dd-word-bank-text">{item.answer.nut.uttering.utterance.native.text}</div>;
            return (
                <div className="dd-answer-list-item" key={index}>
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
                        ><span className="glyphicon glyphicon-play-circle mouseover-play wl"></span>
                        <span className="glyphicon glyphicon-stop mouseover-stop wl"></span>
                        {component}
                    </div>
                </div>
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
                // code for later adding images as potential answers
                /*  if (answer.type === "image") {
                     answerCls += " dd-drop-answer-image";
                 }

                    if (answer.correct === true) {
                        answerCls += " dd-drop-answer-area-correct";
                        flag = <span className="glyphicon glyphicon-ok-circle dd-flag dd-correct-flag" aria-hidden="true"></span>
                    }

                   if (answer.correct === false) {
                        answerCls += " dd-drop-answer-area-incorrect";
                        flag = <span className="glyphicon glyphicon-remove-circle dd-flag dd-incorrect-flag" aria-hidden="true"></span>
                    }
                */

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
                            <span className="glyphicon glyphicon-play-circle mouseover-play na"></span>
                            <span className="glyphicon glyphicon-stop mouseover-stop na"></span>
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
            // currently only 1 speaker allowed per line
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

        var _buttons;
        if(needReset){
            _buttons = [<button className="btn btn-default" onClick={this.submit}>{this.state.submitLabel}</button>,
                        <button className="btn btn-default" onClick={this.reset}>{this.state.resetLabel}</button>];
        }else{
            _buttons = <button className="btn btn-default" onClick={this.submit}>{this.state.submitLabel}</button>;
        }

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

                            <div className="paragraph">
                                {lines}
                            </div>


                            <div className="dd-answer-list" >
                                <div className="word-list" onDrop={self.onDropping} onDragOver={self.onDraggingOver}>
                                    {answers}
                                </div>
                            </div>

                    </div>
                </div>
                <div className="row dd-quiz-feedback">
                    {_buttons}
                    <audio id="audio" volume={this.state.volume}>
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