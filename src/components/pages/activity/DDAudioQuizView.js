var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');

// CONSTANTS
var DROP_ANSWER_AREA_CLS = "dd-drop-answer-area";
var WORD_BANK_TEXT_CLS = "dd-word-bank-text";
var DRAGGABLE_AREA_CLS = "dd-draggable-area";
var ANSWER_HANDLE_CLS = "answer-handle";
var ANSWER_AREA_CLS = "dd-answer-area";
var ANSWER_AREA_TEXT_CLS = "dd-answer-area-text";
var ANSWER_AREA_CORRECT_CLS = "dd-drop-answer-area-correct";
var ANSWER_AREA_WRONG_CLS = "dd-drop-answer-area-incorrect";
var ANSWER_LIST_ITEM_CLS = "dd-answer-list-item";

// TODO: if given the time, rewrite so less content is hard coded css

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
    var page = {};
    var msArray = [];
    var data = {
        page: page,
        sources: [],
        answers: [],
        lines: [],
        submitLabel: "Submit",
        resetLabel: "Try Again",
        clearLabel: "Clear All",
        feedback: {label: "", passed:false},
        matchTarget: [],
        dragSrc: null,
        childHTML: null,
        needsRender: null,
        volume: SettingsStore.voiceVolume(),
        readOnly: false,
        selection: [],
        isCorrect: [],
        perfect: false,
        prompt: "Complete the objective."
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        msArray = props.page.matchSource;
    }

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
    //get the instructions prompt from the JSON
    if(data){
        if(data && data.page){
            if(data.page.prompt){
                if(data.page.prompt.text){
                    data.prompt = data.page.prompt.text;
                }
            }

        }
    }


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

    data.answers = AGeneric().shuffle(data.answers); // randomize answers bank
    return data;
}



// Set the size of the answer areas and all the draggable items to be the same as the largest
// Also centers play/stop icons on clickables
function setDraggableSize() {
    var dropAnswerArea = $('.' + DROP_ANSWER_AREA_CLS);
    var draggableArea = $('.' + DRAGGABLE_AREA_CLS);

    var maxWidth = 0;
    var maxHeight = 0;

    // find the max width/height of answers so we can keep them consistent
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

    // position Icons correcty within their containers
    setGlyphIconPos(maxHeight, maxWidth);
}

function setGlyphIconPos(maxHeight, maxWidth){
    var glyphCorrect = $(".answer-feedback-correct");
    var glyphIncorrect = $(".answer-feedback-incorrect");
    var wordListGlyphCls = $(".wl");
    var wordBankText = $('.' + WORD_BANK_TEXT_CLS);
    var glyphicon = $(".glyphicon");
    var plainTextGlyphCls = $(".na");
    var droppedAnswerGlyphCls = $(".ad");
    var buffer = 35;
    var marginTop = 90;
    var ansHeight = 50;

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
        //_item.css('top', ( ( buffer + (buffer*index) + (maxHeight*index) )+'px'));
    });

    var texts = document.getElementsByClassName("na");
    Array.prototype.forEach.call(texts, function (item) {
        $(item).css('left', ( ($(item).parent().width()/2 - 13) + 'px') );
        $(item).css('top', ( ($(item).parent().height()/2 ) + 'px') );
    });

    glyphCorrect.css('top', '-6px');
    glyphIncorrect.css('top', '-6px');

}

// gets all the answers and questions. Checks to see if answers are in their desired locations
function checkAnswers(self){
    var state = self.state;
    var ddAnswers = document.getElementsByClassName('answer-handle');
    var numCorrect = 0;
    var numWrong = 0;
    var isMissingAnswer = false;

    Array.prototype.forEach.call(ddAnswers, function(ans){
        if($(ans).children().length == 0){
            isMissingAnswer = true;
        }
    });
    // if all answers are filled in
    if(isMissingAnswer){
        alert("Please fill in every answer.");
        return ("");
    }else {
        // then for each answer-handle
        for (var index = 0; index < ddAnswers.length; index++) {
            var _parent = $(ddAnswers[index]).parent();
            var _child = $(ddAnswers[index].childNodes[0]);
            var questionLetter = _child.attr("data-question-letter");

            // if the letter of the answer is what is expected, then it is correct
            if (questionLetter == state.matchTarget[index]) {
                _parent.addClass("dd-drop-answer-area-correct");
                var glyphCorrect = ddAnswers[index].children[0].children[1];
                $(glyphCorrect).css('display', 'block');
                self.state.isCorrect.push(true);
                numCorrect++;
            } else {
                // else it's wrong
                _parent.addClass("dd-drop-answer-area-incorrect");
                var glyphWrong = ddAnswers[index].children[0].children[0];
                $(glyphWrong).css('display', 'block');
                self.state.isCorrect.push(false);
                numWrong++;
            }
        }
        var total = numCorrect + numWrong;
        if (numCorrect > 0 && numCorrect == total) {
            self.setState({
               perfect: true
            });
            // if you got all questions correct, play reward audio
            var rewardZid = 0;
            var rewardArray = [];
            Array.prototype.forEach.call(state.page.matchSource, function (ms) {
                var uttering = ms.nut.uttering;
                var utteringInfo = uttering.info || {property: []};
                //ms.nut.uttering.info.property[0].name == "full"
                Array.prototype.forEach.call(utteringInfo.property, function (prop) {
                    if (prop.name == "full") {
                        rewardArray.push(uttering.media[0].zid);
                    }
                });

            });
            if (rewardArray.length > 0) {
                rewardAudio(rewardArray);
            }
        }
        // set state to read only mode, update feedback string
        self.setState({
            selection: getAnswerStrings(),
            readOnly: true
        });
        readOnly();

        return ({
                label:"You got " + numCorrect + " of " + total + " correct.",
                passed: (numCorrect === total)
            });
    }
}

function rewardAudio(idArray){
    if(idArray.length > 0){
        $("#audio").bind('ended', function(){
            idArray.shift();
            rewardAudio(idArray);
        });
        playAudio(idArray[0]);
    }
}

function readOnly(){
    // fade remaining answers and make them non-interactable
    var draggableArea = document.getElementsByClassName(DRAGGABLE_AREA_CLS);
    Array.prototype.forEach.call(draggableArea, function (item) {
        $(item).css('opacity', '0.4');
        $(item).removeClass("audio-disabled");
    });

    //hide the boxes the answers are contained in
    $(".dd-drop-answer-area-incorrect").css('visibility', 'hidden');
    $(".dd-drop-answer-area-correct").css('visibility', 'hidden');
}

// returns an array consisting of the strings for all the answers
// this may or may not work with images, may need to changes the stored value from native text to something else
function getAnswerStrings(){
    var tempArr = [];
    var answerHandles = document.getElementsByClassName(ANSWER_HANDLE_CLS);
    Array.prototype.forEach.call(answerHandles, function(item){
        var text = $($(item).children()[0]).children()[2].innerHTML;
        tempArr.push(text);

    });
    return tempArr;
}

var DDAudioQuizView = React.createClass({
    // when the submit button is pressed
    submit: function() {
        this.setState({
            feedback: checkAnswers(this)
        });
    },

    // when the reset button is pressed
    reset: function(){
        // clear the feedback text
        this.setState({
            feedback: {label: "", passed:false},
            readOnly: false,
            isCorrect: [],
            selection: []
        });
        $(".dd-answer-area-text").css('visibility', 'visible');
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

        this.setState({
            answers: AGeneric().shuffle(this.state.answers) // randomize answers bank
        });
    },

    // when the Clear All button is pressed
    clearAll: function(){
        // clear the feedback text
        this.setState({
            feedback: {label:"", passed:false},
            readOnly: false,
            isCorrect: [],
            selection: []
        });
        $(".dd-answer-area-text").css('visibility', 'visible');
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
    },

    // called when the mouse is brought over various objects
    itemMouseOver: function(event){
        var zid = 0;
        var _parent = $($(event.target)[0].parentElement);
        var _target = $(event.target);
        if(!this.state.readOnly) {
            // switch functions based on what class is moused over (this is due to inheritence issues)
            switch (_target.attr("class")) {
                // dd-word-bank-text is the child element of a draggable
                case WORD_BANK_TEXT_CLS:
                    if (!_parent.hasClass("audio-disabled")) {
                        _target.css("opacity", "0.4");
                        this.state.page.matchSource.forEach(function (item) {
                            var uttering = item.nut.uttering;
                            // if this item we are over
                            if (uttering.utterance.native.text == event.target.innerHTML) {
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

                    this.state.page.matchSource.forEach(function (item) {
                        var uttering = item.nut.uttering;
                        var fadeTarget = $($(event.target).children()[2]);
                        fadeTarget.css('opacity', '0.4');

                        // if this item is what we clicked on
                        if (uttering.utterance.native.text == event.target.children[2].innerHTML) {
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
                var parentElement = $($(event.target)[0].parentElement);
                if(!parentElement.hasClass("audio-disabled")){
                    zid = $(event.target.parentElement).attr("data-question-zid");
                    playAudio(zid);
                    var glyphiconArray = $($(event.target).parent()[0]).children();
                    if(glyphiconArray.length > 3){
                        var playAH = $(glyphiconArray[2]);
                        var stopAH = $(glyphiconArray[3]);
                        if(isPlaying(zid)) {
                            playAH.css('display', 'none');
                            stopAH.css('display', 'inline');
                        }
                    }else {
                        var playWL = $(glyphiconArray[0]);
                        var stopWL = $(glyphiconArray[1]);
                        if(isPlaying(zid)) {
                            playWL.css('display', 'none');
                            stopWL.css('display', 'inline');
                        }
                    }
                }
                break;

            // the div containing the span
            case ANSWER_AREA_TEXT_CLS:
                // if the answer area text is not the speaker name
                if(event.target.children.length > 1){
                    // play audio
                    zid = $(event.target).attr("data-question-zid");
                    playAudio(zid);
                }
                var answerAreaTextGlyphicons = $(event.target).children();
                var play = $(answerAreaTextGlyphicons[0]);
                var stop = $(answerAreaTextGlyphicons[1]);
                if(isPlaying(zid)) {
                    play.css('display', 'none');
                    stop.css('display', 'inline');
                }
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
        PageStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        if(this.state.readOnly){
            $(".dd-answer-area-text").css('width', 'auto');
        }

        setDraggableSize();
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

    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    onDragging: function(e){
        e.dataTransfer.setData('text/plain', 'anything');
        this.state.dragSrc = e.target;
        // collect the innerHTML of the item being dragged
        this.setState({
            childHTML: $(this.state.dragSrc.children[2])
        });
    },

    onDropping: function(e){
        // preventDefault stops the default drop code from running so we can write our own function using React
        e.preventDefault();
        // stopPropagation stops some browsers from attempting to forward to the dropped item as a URL
        e.stopPropagation();

        if(this.state.dragSrc != null) {
            var self = this;
            var tgtClass = $(e.target).attr("class");
            // Construct the component to be dropped in the answer-handle
            var DropComponent = React.createClass({
                componentDidMount: function () {
                    setDraggableSize();
                },
                render: function () {
                    var cls = $(self.state.dragSrc).attr("class");
                    var dataQuestionId = $(self.state.dragSrc).attr("data-question-id");
                    var dataQuestionLetter = $(self.state.dragSrc).attr("data-question-letter");
                    var zid = $(self.state.dragSrc).attr("data-question-zid");
                    var inner = <div key={self.state.page.xid + "blank inner"}></div>;
                    switch (self.state.childHTML.attr("class")) {
                        case "img-thumbnail dd-answer-image":
                            inner = <img className={self.state.childHTML.attr("class")}
                                         key={self.state.page.xid + "inner img"}
                                         draggable={false}
                                         src={self.state.childHTML.attr("src")}></img>;
                            break;
                        default:
                            inner = <div key={self.state.page.xid + "inner div"} className={self.state.childHTML.attr("class")}>{
                                self.state.childHTML[0].innerHTML}</div>;
                            break;
                    }

                    return (
                        <div className={cls}
                             key={self.state.page.xid + "dropComponent div"}
                             data-question-id={dataQuestionId}
                             data-question-letter={dataQuestionLetter}
                             data-question-zid={zid}
                             onClick={self.handleClick}
                             onMouseOver={self.itemMouseOver}
                             onMouseOut={self.itemMouseOff}
                             draggable={true}
                             onDragStart={self.onDragging}>
                            <span className="glyphicon glyphicon-play-circle mouseover-play ad"></span>
                            <span className="glyphicon glyphicon-stop mouseover-stop ad"></span>
                            {inner}
                        </div>
                    );
                }
            });

            // if we are moving the item to an answer-handle
            if(self.state.needsRender){
                React.render(
                    <DropComponent />,
                    e.target
                );
            }
            // if we are moving an item from an answer-handle
            if ($(self.state.dragSrc).parent().attr("class") == "answer-handle") {
                // un-mount the answer from that answer-handle
                React.unmountComponentAtNode($(self.state.dragSrc).parent()[0]);
                // movedItem == the stored childHTML of the dragged item
                var movedItem = self.state.childHTML[0].innerHTML;
                if(tgtClass == "dd-word-bank-text" || tgtClass == "word-list" ) {
                    var listItems = document.getElementsByClassName("dd-answer-list-item");
                    for (var i = 0; i < listItems.length; i++) {
                        var childRef = listItems[i].childNodes[0];
                        // match movedItem to it's corresponding item in the answer list
                        if (movedItem == childRef.childNodes[2].innerHTML) {
                            childRef.style.opacity = '1.0';
                            childRef.setAttribute("draggable", "true");
                            $(childRef).removeClass("audio-disabled");
                            $(childRef).css('display', 'inherit');
                        }
                    }
                }
            } else {
                if(tgtClass != "dd-word-bank-text" && tgtClass != "word-list") {
                    var dragSource = self.state.dragSrc;
                    dragSource.style.opacity = '0.4';
                    dragSource.setAttribute("draggable", "false");
                    $(dragSource).addClass("audio-disabled");
                    $(dragSource).css('display', 'none');
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
        var target = $(e.target).attr("class");
        this.setState({
            needsRender: null
        });
        if(target == "answer-handle"){
            //if answer-handle empty drop spot
            e.preventDefault();
            this.setState({
                needsRender: true
            });
        }
        // This one is when you are over a word in the word-list. This is needed to prevent you from dropping it on
        // an answer that is in an answer handle, due to them sharing a class.
        if( $(e.target).parent().parent().attr("class") == "dd-answer-list-item" ){
            // if dd-answer-list-item then word bank item
            e.preventDefault();
            this.setState({
                needsRender: false
            });
        }
        if( target == "word-list" ){
            // if over the word list box
            e.preventDefault();
            this.setState({
                needsRender: false
            });
        }
    },

    render: function() {
        var needReset = true;
        var self = this;
        var st = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        console.log(title + " asdf");
        // word bank, answers are MatchSources
        var answers = st.answers.map(function(item, index) {
            var component = <div key={page.xid + "component" + String(index)} className="dd-word-bank-text">{item.answer.nut.uttering.utterance.native.text}</div>;
            if(self.state.readOnly){
                var answerItem = <li>
                        <div className="dd-answer-list-item" key={page.xid + "readOnly" + String(index)}>
                            <div
                                className="dd-draggable-area"
                                data-question-id={item.lineNumber}
                                data-question-letter={item.letter}
                                >
                                {component}
                            </div>
                        </div>
                    </li>
            }else{
                var answerItem = <li>
                                <div className="dd-answer-list-item" key={page.xid + "!readOnly" + String(index)}>
                                    <div
                                        className="dd-draggable-area"
                                        draggable="true"
                                        onDragStart={self.onDragging}
                                        onDragOver={self.onDraggingOver}
                                        onDrop={self.onDropping}
                                        data-question-id={item.lineNumber}
                                        data-question-letter={item.letter}
                                        data-question-zid={item.answer.nut.uttering.media[0].zid}
                                        onMouseOver={self.itemMouseOver}
                                        onMouseOut={self.itemMouseOff}
                                        onClick={self.handleClick}
                                        ><span className="glyphicon glyphicon-play-circle mouseover-play wl"></span>
                                        <span className="glyphicon glyphicon-stop mouseover-stop wl"></span>
                                        {component}
                                    </div>
                                </div>
                        </li>
            }
            return (
                answerItem
            )
        });

        var counter = -1;
        // drop area
        var lines = Object.keys(st.lines).map(function(linesKey, index) {
            var line = st.lines[linesKey];
            var speaker = "";
            var parts = Object.keys(line).map(function(msKey, aIndex) {
                var ms = line[msKey];
                var result = "";
                var answerCls = "dd-drop-answer-area";
                var flag = "";

                ms.nut.uttering.info.property.forEach(function(prop){
                    if(prop.name == "speaker"){
                        speaker = prop.value + ":";
                    }
                });

                if(self.state.readOnly){
                    var need2Render = true;
                    var clsName = "dd-answer-area-text";
                    ms.nut.uttering.info.property.forEach(function (prop) {
                        if (prop.name == "full") {
                            need2Render = false;
                        }
                    });
                    if (need2Render) {
                        if (ms.letter != "") {
                            counter++;
                            if(self.state.isCorrect[counter]){
                                clsName += " dd-drop-answer-area-correct";
                                result = <div className={clsName}
                                              key={page.xid + String(aIndex) + "isCorrect"}
                                              data-question-id={index+1}
                                              data-question-letter={""}>
                                    <span className="glyphicon glyphicon-ok-circle answer-feedback-correct"></span>
                                    {" " + self.state.selection[counter] + " "}&nbsp;
                                </div>
                            }else{
                                clsName += " dd-drop-answer-area-incorrect";
                                result = <div className={clsName}
                                              key={page.xid + String(aIndex) + "!isCorrect"}
                                              data-question-id={index+1}
                                              data-question-letter={""}>
                                    <span className="glyphicon glyphicon-remove-circle answer-feedback-incorrect"></span>
                                    {" " + self.state.selection[counter] + " "}&nbsp;
                                </div>
                            }
                        }else{
                            result = <div className={clsName}
                                          key={page.xid + String(aIndex) + "letterIsBlank"}
                                          data-question-id={index+1}
                                          data-question-letter={""}>
                                {" " + ms.nut.uttering.utterance.native.text + " "}&nbsp;
                            </div>
                        }
                    }
                }else {
                    if (ms.letter != "") {
                        counter++;
                            result =
                                <div key={page.xid + String(aIndex)+"!letterIsBlank"} className={answerCls} onDrop={self.onDropping} onDragOver={self.onDraggingOver}>
                                    &nbsp;
                                    {flag}
                                    <div className="answer-handle"></div>
                                </div>
                    } else {
                        var needRender = true;
                        ms.nut.uttering.info.property.forEach(function (prop) {
                            if (prop.name == "full") {
                                needRender = false;
                            }
                        });
                        if (needRender) {
                            if (!self.state.readOnly) {
                                var zid = ms.nut.uttering.media ? ms.nut.uttering.media[0].zid : 0;
                                result = <div className="dd-answer-area-text"
                                              key={page.xid + String(aIndex) + "needRender!readOnly"}
                                              data-question-id={index+1}
                                              data-question-letter={""}
                                              data-question-zid={zid}
                                              onMouseOver={self.itemMouseOver}
                                              onMouseOut={self.itemMouseOff}
                                              onClick={self.handleClick}>
                                    <span className="glyphicon glyphicon-play-circle mouseover-play na"></span>
                                    <span className="glyphicon glyphicon-stop mouseover-stop na"></span>
                                    {ms.nut.uttering.utterance.native.text}
                                </div>
                            } else {
                                result = <div className="dd-answer-area-text"
                                              key={page.xid + String(aIndex) + "needRenderreadOnly"}
                                              data-question-id={index+1}
                                              data-question-letter={""}>
                                    {ms.nut.uttering.utterance.native.text}
                                </div>
                            }
                        }
                    }
                }
                return (
                    <div key={page.xid + String(aIndex)}>
                        {result}
                    </div>
                )
            });
            // currently only 1 speaker allowed per line
            return (
                <li key={page.xid + String(index)}>
                    <div className="dd-answer-area">
                        <div className="dd-answer-area-text">
                            <span className="dd-player-label">{speaker}&nbsp;</span>
                        </div>
                        {parts}
                    </div>
                </li>
            )
        });

        var _buttons;
        if(!self.state.readOnly){
            _buttons = [<button key={page.xid + "submitbtn"} className="btn btn-default btn-success" onClick={this.submit}>{this.state.submitLabel}</button>,
                        <button key={page.xid + "clearAllbtn"} className="btn btn-default btn-warning clearAll-btn" onClick={this.clearAll}>{this.state.clearLabel}</button>];
        }else{
            if(self.state.perfect){
                _buttons = <span key={page.xid + "blankSpan"}></span>;
            }else {
                _buttons = <button key={page.xid + "resetbtn"} className="btn btn-default btn-info reset-btn" onClick={this.reset}>{this.state.resetLabel}</button>;
            }
        }

        /**
         * <div className="row">
         <div className="dd-quiz-container">

         <div className="paragraph">
         {lines}
         </div>


         <div className="dd-answer-list" >
         <div className="word-list" onDrop={self.onDropping} onDragOver={self.onDraggingOver}>
         <ul className="dd-answer-list">
         {answers}
         </ul>
         </div>
         </div>

         </div>
         </div>
         */
        // questions is a list of lines that contain a list of objects
        var feedbackShow = "alert alert-warning hide";
        if (this.state.feedback.label !== "") {
            if (this.state.feedback.passed) {
                feedbackShow = "alert alert-success show";
            } else {
                feedbackShow = "alert alert-danger show";
            }

        }
        return (
            <div>
                <PageHeader sources={sources} title={title} key={page.xid}/>
                <div className="container dd-container">
                    <div className="row dd-quiz-title">
                        <h4>{this.state.page.prompt}</h4>
                    </div>
                    <div className="row dd-quiz-feedback">
                        <div className={feedbackShow} role="alert">
                            <strong>{this.state.feedback.label}</strong>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-10">
                            <ul className="dd-lines-list">
                                {lines}
                            </ul>
                            <div className="dd-actions">
                                {_buttons}
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="word-list well well-lg" onDrop={self.onDropping} onDragOver={self.onDraggingOver}>
                                <ul className="dd-answer-list">
                                    {answers}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="row dd-quiz-feedback">

                        <audio id="audio" volume={this.state.volume}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
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

module.exports = DDAudioQuizView;