var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');

// TODO: Make submit button change page to read-only
// TODO: on drop, hide element from word list
// TODO: boxes around paragraph and word list
// TODO: reward audio on 100% correct ( play the "full" tags audio media )


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
    var amPlay = false;
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    var test = "data/media/" + xid + ".mp3";
    var short = source.src.substr(source.src.length - test.length);

    if(short == test){
        return(!audio.paused);
    }
    return amPlay;
}

// Initializes the state of the page with the JSON given in props
function getPageState(props) {
    var data = {};
    data.page = props.page;
    data.answers = [];
    data.lines = [];
    data.submitLabel = "Submit";
    data.resetLabel = "Reset";
    data.feedback = "";
    data.matchTarget = [];
    data.dragSrc = null;
    data.childHTML = null;
    data.needsRender = null;
    data.volume = SettingsStore.voiceVolume();

    var line = {};
    // collect all matchSource items to be printed in the paragraph, and create the list to be used to check
    // correct answers
    data.page.matchSource.forEach(function(item){
        var _ln = "";
        var _hasLine = false;
        var _utteringInfo = item.nut.uttering.info || {property: []};
        var _infoProps = _utteringInfo.property;

        //if a matchSource has a line, then it will be displayed in the conversation
        _infoProps.forEach(function(prop){
            if(prop.name == "line"){
                _ln = prop.value;
                _hasLine = true;
            }
        });
        // if matchSource has a line and a letter, it's letter is associated with a correct answer
        if(_hasLine){
            if(item.letter != ""){
                data.matchTarget.push(item.letter);
            }
        }
        // if _ln != to "" the matchSource has a line spot.
        if(_ln != ""){
            if(!line[parseInt(_ln)]) {
                line[parseInt(_ln)] = [];
            }
            line[parseInt(_ln)].push(item);
        }
    });
    data.lines = line;

    // shuffle and add to answers[]
    // grab all answers from quiz for word bank
    var questions = data.page.matchSource || [];
    var len = questions.length;
    while (len--) {
        // for each matchSource
        var a = questions[len];
        if (a.letter != "") {
            // if it has a letter associated with it, it is a possible answer

            // get it's line number
            var ln = -1;
            var _aInfo = a.nut.uttering.info || {property: []};
            _aInfo.property.forEach(function(prop){
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
// Also centers play/stop icons on clickables
function setDraggableSize() {
    var dd_drop_answer_area = $('.dd-drop-answer-area');
    var _dd_word_bank_text = $('.dd-word-bank-text');
    var dd_draggable_area = $('.dd-draggable-area');
    var glyphicon_wl = $(".glyphicon.wl");
    var _glyphicon = $(".glyphicon");
    var _na = $(".na");
    var _ad = $(".ad");
    var maxWidth = 0;
    var maxHeight = 0;
    dd_draggable_area.each(function() {
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
    _glyphicon.css('z-index', '255');
    _dd_word_bank_text.css('position', 'relative');
    glyphicon_wl.css('position', 'absolute');
    glyphicon_wl.css( 'font-size', (26 + 'px') );
    _na.css('font-size', '26px');
    _ad.css('font-size', '26px');
    glyphicon_wl.css('font-size', '26px');

    var texts = document.getElementsByClassName("wl");
    Array.prototype.forEach.call(texts, function (item, index) {
        $(item).css('left', ( ($(item).parent().width() ) + 'px' ) );
        $(item).css('top', ( ( (maxHeight*Math.floor(index/2)+(10*Math.floor(index/2))) + maxHeight/2 - 13 )+'px'));
    });
}

// gets all the answers and questions. Checks to see if answers are in their desired locations
function checkAnswers(state){
    var dd_answers = document.getElementsByClassName('answer-handle');
    var numCorrect = 0;
    var numWrong = 0;

    // for each answer-handle
    for(var index=0; index < dd_answers.length; index++){
        var _container = $(dd_answers[index]).parent();
        if (dd_answers[index].childElementCount > 0) {
            var dataContainer = $(dd_answers[index].childNodes[0]);
            var qL = dataContainer.attr("data-question-letter");
            if ( qL == state.matchTarget[index] ) {
                // if the answer matches expected
                _container.addClass("dd-drop-answer-area-correct");
                var _glyphicon_correct = $($(dd_answers[index]).children()[0]).children();
                $(_glyphicon_correct[1]).css('display', 'block');

                numCorrect++;
            } else {
                // else it's wrong
                _container.addClass("dd-drop-answer-area-incorrect");
                var _glyphicon_incorrect = $($(dd_answers[index]).children()[0]).children();
                $(_glyphicon_incorrect[0]).css('display', 'block');

                numWrong++;
            }
        } else {
            // else no answer was given for this one
            _container.addClass("dd-drop-answer-area-incorrect");
            numWrong++;

            // Render the missing glyphicon
            React.render(
                <span className="glyphicon glyphicon-remove-circle answer-feedback-incorrect"></span>,
                $(dd_answers[index])[0]
            );
            // and display it
            var _glyphicon_missing = $($(dd_answers[index]).children()[0]);
            _glyphicon_missing.css('display', 'block');
        }
    }
    return ("You got "+ numCorrect + " of " + (numCorrect + numWrong) + " correct.");
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

        // Clear All Answer-Handles of draggables and correct/incorrect classes
        var _answer_handles = document.getElementsByClassName("answer-handle");
        Array.prototype.forEach.call(_answer_handles, function (item) {
            React.unmountComponentAtNode(item);
            $(item).removeClass("dd-drop-answer-area-incorrect");
        });

        var _dd_answer_areas = document.getElementsByClassName("dd-drop-answer-area");
        Array.prototype.forEach.call(_dd_answer_areas, function (item) {
            $(item).removeClass("dd-drop-answer-area-correct");
            $(item).removeClass("dd-drop-answer-area-incorrect");
        });

        var _draggable_areas = document.getElementsByClassName("dd-draggable-area");
        Array.prototype.forEach.call(_draggable_areas, function (item) {
            $(item).css('opacity', '1.0');
            $(item).removeClass("audio-disabled");
            $(item).attr('draggable', 'true');
        });

        /*
            TODO: undo read only status
         */

    },

    // called when the mouse is brought over various objects
    itemMouseOver: function(event){
        var xid = 0;
        var _parent = $($(event.target)[0].parentElement);
        var _target = $(event.target);

        // switch functions based on what class is moused over (this is due to inheritence issues)
        switch ($(event.target).attr("class")) {
            // dd-word-bank-text is the child element of a draggable
            case "dd-word-bank-text":
                if(!_parent.hasClass("audio-disabled")){
                    _target.css("opacity", "0.4");
                    this.state.page.matchSource.forEach(function(item){
                        // if this item we are over
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            xid = (item.nut.uttering.media[0].zid);
                        }
                    });
                        var _draggable_glyphicons = $($(event.target).parent()[0]).children();
                    /*
                        [0] = word list "play" glyphicon
                        [1] = word list "stop" glyphicon
                        [2] = answer-handle "play" glyphicon
                        [3] = answer-handle "stop" glyphicon
                     */
                        if (_draggable_glyphicons.length > 3) {
                            if (isPlaying(xid)) {
                                $(_draggable_glyphicons[3]).css('display', 'inline');
                            } else {
                                $(_draggable_glyphicons[2]).css('display', 'inline');
                            }
                        } else {
                            if (isPlaying(xid)) {
                                $(_draggable_glyphicons[1]).css('display', 'inline');
                            } else {
                                $(_draggable_glyphicons[0]).css('display', 'inline');
                            }
                        }

                }
                break;

            // dd-answer-area-text is the area around the clickable text in the paragraph
            case "dd-answer-area-text":
                this.state.page.matchSource.forEach(function(item){
                    // if this item is what we clicked on
                    $($(event.target).children()[2]).css('opacity', '0.4');
                    if(item.nut.uttering.utterance.native.text == event.target.children[2].innerHTML){
                        // play audio
                        xid = item.nut.uttering.media[0].zid;
                    }
                });
                var _area_text_glyphicons = $(event.target).children();
                /*
                    [0] = "play" glyphicon
                    [1] = "stop" glyphicon
                 */
                if (isPlaying(xid)) {
                    $(_area_text_glyphicons[1]).css('display', 'inline');
                } else {
                    $(_area_text_glyphicons[0]).css('display', 'inline');
                }
                break;

            default:
                if($(event.target).parent()[0].className == "dd-answer-area-text") {
                    $(event.target).css("opacity", "0.4");
                    this.state.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            xid = (item.nut.uttering.media[0].zid);
                        }
                    });
                    var _text_glyphicons = $($(event.target).parent()[0]).children();
                    /*
                        [0] = "play" glyphicon
                        [1] = "stop" glyphicon
                     */
                    if (isPlaying(xid)) {
                        $(_text_glyphicons[1]).css('display', 'inline');
                    } else {
                        $(_text_glyphicons[0]).css('display', 'inline');
                    }
                }
                // else do nothing
                break;
        }

    },

    // set opacity of mouseover target back to 100% and hide all glyphicons
    itemMouseOff: function(event){
        $(event.target).css("opacity", "1.0");
        switch ($(event.target).attr("class")) {
            case "dd-word-bank-text":
                var _word_bank_children = $($(event.target).parent()[0]).children();
                if(_word_bank_children.length > 3){
                        // answer-handle glyphicons
                        $(_word_bank_children[2]).css('display', 'none');
                        $(_word_bank_children[3]).css('display', 'none');
                }else {
                        // word-list glyphicons
                        $(_word_bank_children[1]).css('display', 'none');
                        $(_word_bank_children[0]).css('display', 'none');
                }
                break;

            case "dd-answer-area-text":
                var _answer_area_text_children = $(event.target).children();
                // mouseover target is not what was faded, [2] is the text that was faded, [0] and [1] are glyphicons
                $(_answer_area_text_children[2]).css('opacity', '1.0');
                $(_answer_area_text_children[0]).css('display', 'none');
                $(_answer_area_text_children[1]).css('display', 'none');
                break;

            default:
                // save as dd-answer-area-text, but need to reference parent object
                var _target_parent = $(event.target).parent()[0];
                if(_target_parent.className == "dd-answer-area-text"){
                    $(event.target).css("opacity", "1.0");
                    var _glyphicons = $(_target_parent).children();
                    $(_glyphicons[0]).css('display', 'none');
                    $(_glyphicons[1]).css('display', 'none');
                }

                // else do nothing

                break;
        }
    },

    handleClick: function(event) {
        var data = this.state;
        var zid = 0;
        switch($(event.target).attr("class")){
            // word bank is what get's the click event inside draggable areas
            case "dd-word-bank-text":
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
            case "dd-answer-area-text":
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
            case "dd-draggable-area":

                break;
            case "img-thumbnail dd-answer-image":
                if(!$($(event.target)[0].parentElement).hasClass("audio-disabled")){

                }
                break;
            default:

                // the span containing the text
                if($(event.target).parent()[0].className == "dd-answer-area-text"){

                    data.page.matchSource.forEach(function(item){
                        // if this item is what we clicked on
                        if(item.nut.uttering.utterance.native.text == event.target.innerHTML){
                            // play audio
                            zid = item.nut.uttering.media[0].zid;
                            playAudio(zid);
                        }
                    });
                    var _text_glyphicons = $($(event.target).parent()[0]).children();
                    /*
                     [0] = "play" glyphicon
                     [1] = "stop" glyphicon
                     */
                    if(isPlaying(zid)){
                        $(_text_glyphicons[0]).css('display', 'none');
                        $(_text_glyphicons[1]).css('display', 'inline');
                    }

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
        var _audioTarget = $('audio,video');
        _audioTarget.prop("volume", SettingsStore.voiceVolume());
        // if muted, then reduce volume to 0
        if(_audioTarget.prop("muted")){
            _audioTarget.prop("volume", 0);
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
                if($(e.target).attr("class") == "dd-word-bank-text") {
                    for (var i = 0; i < listItems.length; i++) {
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
                        ><span className="glyphicon glyphicon-play-circle mouseover-play wl"></span>
                        <span className="glyphicon glyphicon-stop mouseover-stop wl"></span>
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