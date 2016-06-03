/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var CultureQuestPopupView = require('./CultureQuestPopupView');
var CultureQuestMapView = require('./CultureQuestMapView');
var CultureQuestQuizView = require('./CultureQuestQuizView');
var CultureQuestPuzzleAwardView = require('./CultureQuestPuzzleAwardView');
var CultureQuestPuzzleGameView = require('./CultureQuestPuzzleGameView');
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showQuiz: false,
        showPopup: false,
        showPuzzle: false,
        showPuzzleGame: false,
        layersColl:[],
        lastSelected: null,
        answersColl:[],
        audioObj:null,
        audioController:"",
        popupObj:null
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(data.page.info.property[2].value);
    }

    return data;
}

var CultureQuestView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    onLayersReady:function(layersColl){
        var self = this;
        
        this.setState({layersColl:layersColl}, function(){
            self.prepAnswersColl();
            self.prepIntroPopup();
            self.markHomeRegion();
        });
    },

    prepIntroPopup: function(){

        var self = this;

        var popupObj = {
            id:"Intro",
            onClickOutside: self.onClosePopup,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1},

            content: function(){
                
                return(
                    <div className="culture-quest-popup-view-content">
                        <div className="culture-quest-popup-view-bodyText">
                            {self.state.imageData.briefText}
                        </div>
                        <div className="culture-quest-popup-view-buttonCont">
                            <button type="button" className="btn btn-default"
                                    onClick={self.onClosePopup}>Start</button>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);

    },
    
    prepGoBackPopup: function(){

        var self = this;

        var popupObj = {
            id:"GoBack",
            onClickOutside: self.onClosePopup,
            popupStyle: {height:'20%', width:'60%', top:'40%', left:'20%', background:'#fff', opacity:1},

            content: function(){
                
                return(
                    <div className="culture-quest-popup-view-content">
                        <div className="culture-quest-popup-view-bodyText">
                            {self.state.imageData.keepTryingText}
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);

    },

    onClosePopup: function(){
        this.setState(({popupObj:null}));
    },

    markHomeRegion: function(){
        for (var i = 0; i < this.state.imageData.regions.length; i++){
            if (this.state.imageData.regions[i].home === true) {
                this.state.layersColl[i].setAttribute("state","homeState");
                return false;
            }
        }
    },

    prepAnswersColl: function() {
         //populate from previous data if any - otherwise init here:
        var objColl = [];
        for (var l = 0; l < this.state.layersColl.length; l++){
            var obj = {'layerNumber': l, 'completed': false, onQuestion:1,
                'question1':{'answered':false, attempts:0},
                'question2':{'answered':false, attempts:0}};
            objColl.push(obj);
        }
        this.setState({answersColl:objColl});
    },

    showQuizUpdate: function(mode){

        var self = this;

        if (mode === "show") {
            self.setState({showQuiz: true});
                $("#imageLayerView-back-image").children().addClass("culture-quest-quiz-view-killInteraction");

        } else {
                self.setState({showQuiz: false});
                $("#imageLayerView-back-image").children().removeClass("culture-quest-quiz-view-killInteraction");
        }
    },

    showPuzzleUpdate: function(mode){

        var self = this;
        if (mode === "show") self.setState({showPuzzle:true});
        else self.setState({showPuzzle:false});
    },

    onRegionClicked: function(canvasElement){
        
        if (canvasElement.getAttribute('state') !== "homeState"){
            this.updateLayersColl(canvasElement,'attributeAdd', [{'name':'lastClicked','value':true}]);
            this.setState({'lastSelected': canvasElement});
            this.showQuizUpdate("show");
        }else{
            //regions done
            if (this.getCompletedRegions() >= this.state.imageData.regions.length - 1){
                this.setState({showPuzzleGame:true});
            }else{
                this.prepGoBackPopup();
            } 
        }
        
    },

    updateLayersColl:function(layer, changeMode, changesColl){

        var self = this;
        var state = self.state;
        var layerId = layer.getAttribute('id');
        var applyToAll  = changeMode.indexOf("All") !== -1;
        var applyExcept = changeMode.indexOf("Except") !== -1;

        for (var l = 0; l < state.layersColl.length; l++){

            if ((state.layersColl[l].getAttribute('id') === layerId && !applyExcept) || applyToAll){
                for (var c = 0; c < changesColl.length; c++){

                    switch(changeMode){
                        case 'attributeAdd': case 'attributeAddAll':
                            state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                            break;
                        case 'attributeRemove': case 'attributeRemoveAll':
                            state.layersColl[l].removeAttribute(changesColl[c].name);
                            break;
                        case 'classAdd': case 'classAddAll':
                            if (!state.layersColl[l].classList.contains(changesColl[c].name))
                                 state.layersColl[l].classList.add(changesColl[c].name);
                            break;
                        case 'classRemove': case 'classRemoveAll':
                            state.layersColl[l].classList.remove(changesColl[c].name);
                            break;
                    }
                }

            }else if (applyExcept) {

                if (state.layersColl[l].getAttribute('id') !== layerId){
                    for (var c = 0; c < changesColl.length; c++){

                        switch(changeMode){
                            case 'attributeAddExcept':
                                state.layersColl[l].setAttribute(changesColl[c].name, changesColl[c].value);
                                break;
                            case 'attributeRemoveExcept':
                                state.layersColl[l].removeAttribute(changesColl[c].name);
                                break;
                            case 'classAddExcept':
                                state.layersColl[l].classList.add(changesColl[c].name);
                                break;
                            case 'classRemoveExcept':
                                state.layersColl[l].classList.remove(changesColl[c].name);
                            break;
                        }
                    }
                }
            }
        }
    },

    saveAnswersColl: function(answersColl){
        this.state.answersColl = answersColl;
    },

    getCompletedRegions: function(){

        var completed = 0;
        for (var i = 0 ; i < this.state.answersColl.length; i++){
            if (this.state.answersColl[i].completed) completed++;
        }
        return completed;
    },

    playAudio: function(audioObj){
        var self = this;

        this.setState({audioObj:audioObj}, function(){
            if (!audioObj.loop) {
                $("#"+audioObj.id).on("ended", function(){
                    self.setState({audioObj:null});
                });
            }
        });
    },

    displayPopup: function(popupObj){

        this.setState({popupObj:popupObj});
    },

    setAudioControl: function(mode){
        this.setState({audioController:mode});
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};
        
        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="CultureQuestViewBlock">

                    {self.state.audioObj ?
                    <AudioPlayer
                        id = {self.state.audioObj.id}
                        sources    = {self.state.audioObj.sources}
                        autoPlay   = {self.state.audioObj.autoPlay}
                        controller = {self.state.audioController}
                    /> : null}

                    {self.state.popupObj ?
                    <CultureQuestPopupView
                        id = {self.state.popupObj.id}
                        popupStyle = {self.state.popupObj.popupStyle}
                        onClickOutside = {self.state.popupObj.onClickOutside}
                    >
                    {self.state.popupObj.content()}
                    </CultureQuestPopupView>:null}

                    {self.state.showPopup ? <CultureQuestPopupView />:null}

                    <CultureQuestMapView
                        imageData = {state.imageData}
                        layersColl = {state.layersColl}
                        onLayersReady = {self.onLayersReady}
                        onRegionClicked = {self.onRegionClicked}
                        answersColl = {state.answersColl}
                        lastSelected = {state.lastSelected}
                        updateLayersColl = {self.updateLayersColl}
                    >

                    </CultureQuestMapView>

                        {self.state.showQuiz? <CultureQuestQuizView
                        imageData={state.imageData}
                        layersColl={state.layersColl}
                        lastSelected={state.lastSelected}
                        showQuiz = {state.showQuiz}
                        showQuizUpdate = {self.showQuizUpdate}
                        showPuzzleUpdate = {self.showPuzzleUpdate}
                        answersColl = {state.answersColl}
                        saveAnswersColl = {self.saveAnswersColl}
                        playAudio = {self.playAudio}
                        setAudioControl = {self.setAudioControl}
                        />:null}

                    {self.state.showPuzzle? <CultureQuestPuzzleAwardView
                        imageData = {state.imageData}
                        lastSelected = {state.lastSelected}
                        answersColl = {state.answersColl}
                        showQuizUpdate = {self.showQuizUpdate}
                        showPuzzleUpdate = {self.showPuzzleUpdate}
                    />:null}

                    {self.state.showPuzzleGame? <CultureQuestPuzzleGameView
                    imageData={state.imageData}
                    />:null}

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

module.exports = CultureQuestView;