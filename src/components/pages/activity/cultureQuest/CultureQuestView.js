/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var CultureQuestMapView = require('./CultureQuestMapView');
var CultureQuestQuizView = require('./CultureQuestQuizView');
var CultureQuestPuzzleAwardView = require('./CultureQuestPuzzleAwardView');
var CultureQuestPuzzleGameView = require('./CultureQuestPuzzleGameView');
var PageHeader = require('../../../widgets/PageHeader');
var AppStateStore = require('../../../../stores/AppStateStore');
var UnsupportedScreenSizeView = require('../../../../components/UnsupportedScreenSizeView');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showQuiz: false,
        showPopup: false,
        showPuzzle: false,
        showPuzzleGame: true,
        layersColl:[],
        lastSelected: null,
        answersColl:[],
        audioObj:null,
        audioBgObj:null,
        audioController:"",
        audioBgController:null,
        popupObj:null,
        answeredOrder:[],
        mediaPath:'data/media/'
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
        for (var i = 0; i < layersColl.length; i++){
            layersColl[i].style.opacity = "0.7";
        }
        this.setState({layersColl:layersColl}, function(){
            self.prepAnswersColl();
            //self.prepIntroPopup();
            self.markHomeRegion();
        });
    },

    componentDidMount: function() {
        AppStateStore.addChangeListener(this._onAppStateChange);
        //dim speech and pause
        $("#audioControlIcon , #audioControlButton").css({"opacity":".5", "pointer-events":"none"});
    },

    componentWillUnmount: function() {
        AppStateStore.removeChangeListener(this._onAppStateChange);
    },

    prepIntroPopup: function(){

        var self = this;
        var txtBxStyle = {height:'100%'};
        var popupObj = {
            id:"Intro",
            onClickOutside: null,
            popupStyle: {height:'315px', width:'455px', top:'20%', left:'20%', background:'#fff', border:'2px solid #fff'},

            content: function(){
                
                return(
                    <div className="popup-view-content">
                        <div className="culture-quest-view-popHeaderCont">
                            <div className="culture-quest-view-popHeaderText">{"Welcome to ..."}</div>
                        </div>
                        <div className="popup-view-bodyText" style={txtBxStyle}>
                            <div>{self.state.imageData.briefText}</div>
                        </div>
                        <div className="popup-view-buttonContCent" style={{background:'#cccccc'}}>
                            <div className="popup-view-buttonCont">
                                <button type="button" className="btn btn-default" style={{paddingLeft:'30px', paddingRight:'30px'}}
                                    onClick={self.onStartGame}>Start
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
        
        var debriefAudio = self.state.mediaPath + self.state.imageData.briefAudio;
        self.playAudio({id:"debrief", autoPlay:true, sources:[{format:"mp3", url:debriefAudio}]});
    },

    prepReplayPopup: function(){

        var self = this;
        var txtBxStyle = {height:'100%'};
        var popupObj = {
            id:"Replay",
            onClickOutside: null,
            popupStyle: {height:'315px', width:'455px', top:'20%', left:'20%', background:'#fff', border:'2px solid #fff'},

            content: function(){

                return(
                    <div className="popup-view-content">
                        <div className="culture-quest-view-popHeaderCont">
                            <div className="culture-quest-view-popHeaderText">{"Congratulations!"}</div>
                        </div>
                        <div className="popup-view-bodyText" style={txtBxStyle}>
                            <div>{self.state.imageData.gameEnd.replace("here",'"Restart"')}</div>
                        </div>
                        <div className="popup-view-buttonContCent" style={{background:'#cccccc'}}>
                            <div className="popup-view-buttonCont">
                                <button type="button" className="btn btn-default" style={{paddingLeft:'30px', paddingRight:'30px'}}
                                        onClick={self.onReplay}>Restart
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);

    },

    onStartGame: function(){
        this.onClosePopup();
        this.bgAudio();
    },

    onReplay: function(){

        this.onClosePopup();
        this.bgAudio();
        this.prepAnswersColl();

        for (var i=0; i < this.state.layersColl.length; i++){
            this.state.layersColl[i].style.opacity = "0.7";
            this.state.layersColl[i].style.pointerEvents = "auto";
            this.updateLayersColl( this.state.layersColl[i],'attributeRemove', [{'name':'lastClicked'},{'name':'hidden'},{'name':'state'}]);
        }

        this.markHomeRegion();
        this.setState({answeredOrder:[]});
    },
    
    prepGoBackPopup: function(){

        var self = this;
        //var iconStyle = {background:'url('+self.state.mediaPath+'alertIcon.png) no-repeat 100% 100%'};

        self.state.audioBgController("pause");

        // for future title use
        // <div className="culture-quest-goBackHeader">
        //     <span className="culture-quest-goBackHeaderAlert" style={iconStyle}/>
        //     <span className="culture-quest-goBackHeaderTitle">Message Box</span>
        // </div>

        var popupObj = {
            id:"GoBack",
            onClickOutside: self.onReturnClosePopup,
            popupStyle: {height:'148px', width:'460px', top:'40%', left:'20%', background:'#fff'},

            content: function(){
                
                return(
                    <div className="popup-view-content">
                        <div className="popup-view-bodyText" style={{marginLeft:'20px', marginTop:'30px'}}>
                            {self.state.imageData.keepTryingText}
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);

    },

    onClosePopup: function(){
        this.setState(({popupObj:null,audioObj:null}));
    },

    onReturnClosePopup: function(){
        this.setState(({popupObj:null, audioObj:null}));
        this.state.audioBgController("play");
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

        var self = this;
        var keepTryingAudio = this.state.mediaPath + this.state.imageData.keepTryingAudio;

        if (canvasElement.getAttribute('state') !== "homeState"){
            this.updateLayersColl(canvasElement,'attributeAdd', [{'name':'lastClicked','value':true}]);
            this.setState({'lastSelected': canvasElement});
            this.viewUpdate({task:"countrySelect", value:null});
            this.showQuizUpdate("show");
        }else{
            //regions done
            if (this.getCompletedRegions() >= this.state.imageData.regions.length - 1){
                this.setState({showPuzzleGame:true});
                var debriefAudio = self.state.mediaPath + self.state.imageData.debriefAudio;
                this.playAudio({id:"debrief", autoPlay:true, sources:[{format:"mp3", url:debriefAudio}]});
            }else{
                this.prepGoBackPopup();
                this.playAudio({id:"wrongAnswer", autoPlay:true, sources:[{format:"mp3", url:keepTryingAudio}]});
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
                            if (!self.classListWrapper(state.layersColl[l],"contains",changesColl[c].name))
                                self.classListWrapper(state.layersColl[l],"add",changesColl[c].name);
                            break;
                        case 'classRemove': case 'classRemoveAll':
                            self.classListWrapper(state.layersColl[l],"remove",changesColl[c].name);
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
                                self.classListWrapper(state.layersColl[l],"add",changesColl[c].name);
                                break;
                            case 'classRemoveExcept':
                                self.classListWrapper(state.layersColl[l],"remove",changesColl[c].name);
                            break;
                        }
                    }
                }
            }
        }
    },

    classListWrapper: function(obj,task,className){

        switch(task){
            case "add":
                obj.className += " "+className;
                break;
            case "remove":
                if (obj.className.indexOf(className) !== -1) obj.className.replace(className," ");
                break;
            case "contains":
                return (obj.className.indexOf(className) !== -1);
                break;
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

    playBgAudio: function(audioObj){
        var self = this;

        this.setState({audioBgObj:audioObj}, function(){
            if (!audioObj.loop) {
                $("#"+audioObj.id).on("ended", function(){
                    self.setState({audioBgObj:null});
                });
            }
        });
    },

    bgAudio: function(){
        var bgAudio = this.state.mediaPath + "afpak_CQ_music_loop-28dB.mp3";
        this.playBgAudio({id:"bgMusic", autoPlay:true, loop:true, sources:[{format:"mp3", url:bgAudio}]});
    },

    audioBgContr: function(controllerFunc){
        this.setState({audioBgController:controllerFunc});
    },

    displayPopup: function(popupObj){
        this.setState({popupObj:popupObj});
    },

    viewUpdate: function(update){

        var self = this;
        switch (update.task){

            case "countrySelect":
                var countryAudio = self.state.mediaPath + "country_select.mp3";
                self.playAudio({id:"countrySelect", autoPlay:true, sources:[{format:"mp3", url:countryAudio}]});
                break;

            case "tileAudio":
                var tileAudio = self.state.mediaPath + "add_tile.mp3";
                self.playAudio({id:"tile", autoPlay:true, sources:[{format:"mp3", url:tileAudio}]});
                break;
            
            case "gameEnded":
                self.setState({"showPuzzleGame":false});
                self.prepReplayPopup();
                break;

            case "addAnswerOrder":
                var currentOrder = self.state.answeredOrder;
                currentOrder.push(update.value);
                self.setState({"answeredOrder":currentOrder});
                console.log("order: " + currentOrder.toString());
                break;
        }
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        if (AppStateStore.isMobile()) {
            return (<UnsupportedScreenSizeView/>);
        }

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="CultureQuestViewBlock">

                    {self.state.audioObj ?
                    <AudioPlayer
                        id = {self.state.audioObj.id}
                        sources    = {self.state.audioObj.sources}
                        autoPlay   = {self.state.audioObj.autoPlay}
                    /> : null}

                    {self.state.audioBgObj ?
                        <AudioPlayer
                            id = {self.state.audioBgObj.id}
                            sources    = {self.state.audioBgObj.sources}
                            autoPlay   = {self.state.audioBgObj.autoPlay}
                            loop       = {self.state.audioBgObj.loop}
                            controller = {self.audioBgContr}
                        /> : null}

                    {self.state.popupObj ?
                    <PopupView
                        id = {self.state.popupObj.id}
                        popupStyle = {self.state.popupObj.popupStyle}
                        onClickOutside = {self.state.popupObj.onClickOutside}
                    >
                    {self.state.popupObj.content()}
                    </PopupView>:null}

                    <CultureQuestMapView
                        imageData = {state.imageData}
                        layersColl = {state.layersColl}
                        onLayersReady = {self.onLayersReady}
                        onRegionClicked = {self.onRegionClicked}
                        answersColl = {state.answersColl}
                        lastSelected = {state.lastSelected}
                        updateLayersColl = {self.updateLayersColl}
                        viewUpdate = {self.viewUpdate}
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
                        viewUpdate = {self.viewUpdate}
                        />:null}

                    {self.state.showPuzzle? <CultureQuestPuzzleAwardView
                        imageData = {state.imageData}
                        lastSelected = {state.lastSelected}
                        answersColl = {state.answersColl}
                        showQuizUpdate = {self.showQuizUpdate}
                        showPuzzleUpdate = {self.showPuzzleUpdate}
                        viewUpdate = {self.viewUpdate}
                    />:null}

                    {self.state.showPuzzleGame? <CultureQuestPuzzleGameView
                    imageData={state.imageData}
                    displayPopup={this.displayPopup}
                    onClosePopup={this.onClosePopup}
                    viewUpdate = {self.viewUpdate}
                    />:null}

                </div>
            </div>


        );
    },
    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this.props));
        }
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState(this.props));
    }
});

module.exports = CultureQuestView;