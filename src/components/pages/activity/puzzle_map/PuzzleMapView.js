/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var PuzzleMapDnDView = require("./PuzzleMapDnDView");
var PuzzleMapHUDView = require('./PuzzleMapHUDView');
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showHUD: false,
        audioObj:null,
        audioController:"",
        popupObj:null,
        mediaPath:'data/media/',
        loadedImageColl:[],
        loadCounter:0,
        totalImages:0,
        scoreObj:{totalPieces:0, correct:0, currentIndex:0},
        currentIndex:0,
        puzzlePiecesColl:null,
        phase:"start",
        resetBottomCanvas: false
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(data.page.info.property[1].value);
    }

    return data;
}

var PuzzleMapView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentDidMount: function() {
        this.preloadImages();
    },

    preloadImages: function(){

        var self = this;
        var imageColl = [];
        var pieces = self.state.imageData.puzzleMapPieces;

        pieces.map(function(region,index){
             if (index > 0) {
                 imageColl.push({
                     correct: self.state.mediaPath + region.imageFileName,
                     labeled: self.state.mediaPath + region.labeledImageName,
                     hint: self.state.mediaPath + region.correctImageName
                 });
             }
        });

        self.setState({totalImages:(imageColl.length * 3) + 1});

        var loadedImageColl = [];

        for (var i=0 ; i < imageColl.length; i++){

            var loadedObj = {};
            for (var key in imageColl[i]){
                loadedObj[key] = new Image();
                loadedObj[key].src = imageColl[i][key];
                loadedObj[key].onload = self.loadCounter;
            }

            loadedImageColl.push(loadedObj);
        }

        var backgroundMap = new Image();
        backgroundMap.src = self.state.mediaPath + self.state.imageData.puzzleMapPieces[0].imageFileName;
        backgroundMap.onload = self.loadCounter;

        self.setState({loadedImageColl:loadedImageColl});
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        if (self.state.loadCounter == self.state.totalImages){
            this.onImagesPreloaded();
        }
    },

    onImagesPreloaded: function(){

        var self = this;
        this.setState({
                    scoreObj:{currentIndex:0, totalPieces:self.state.imageData.puzzleMapPieces.length - 1,
                              correct:self.state.currentIndex}});
        this.preparePuzzlePieces();
    },

    preparePuzzlePieces: function(){

        var self = this;
        var puzzlePiecesColl = [];
        var puzzlePieces = self.state.imageData.puzzleMapPieces;

        for (var i = 0; i < puzzlePieces.length ; i++){
            if (i == 0 ) continue;
            
            var correctUrl = self.state.imageData.puzzleMapPieces[i].imageFileName;
            var puzzleObj = {
                index:i,
                scaleAmount:parseFloat(puzzlePieces[i].scaleAmount),
                offsetX:parseInt(puzzlePieces[i].offsetX),
                offsetY:parseInt(puzzlePieces[i].offsetY),
                correctUrl:correctUrl,
                correct:self.state.loadedImageColl[i-1].correct,
                labeled:self.state.loadedImageColl[i-1].labeled,
                hint:self.state.loadedImageColl[i-1].hint
            };

            puzzlePiecesColl.push(puzzleObj);
        }
        this.setState({puzzlePiecesColl:puzzlePiecesColl});
    },

    replayGame: function(){

        var self = this;
        self.setState({
                       currentIndex:0,
                       scoreObj:{currentIndex:0, totalPieces:self.state.imageData.puzzleMapPieces.length - 1, correct:0},
                       phase:"play"
                       //resetBottomCanvas:true
        },
            function(){
                //self.updatePhase("play");
                self.updateHUDView(true);
                setTimeout(function(){
                    self.setState({resetBottomCanvas:true});
                },500);
            }
        );

    },

    showStartHud: function(){
        return(
            <div className = "puzzle-map-view-HUD-cont" id="puzzle-map-view-HUD-start">
                <div className="puzzle-map-view-HUD-text">Click and drag the country pieces to their correct locations on the map.</div>
                <div className="puzzle-map-view-HUD-buttonCont">
                    <button className = "btn btn-primary" onClick={
                    this.updateHudDisplay
                    }>Start</button>
                </div>

            </div>
        );
    },

    showFinishHud: function(){

        var self = this;
        return(
            <div className = "puzzle-map-view-HUD-cont" id="puzzle-map-view-HUD-finish">
                <div className="puzzle-map-view-HUD-text">Map complete!<br/>
                    {self.state.scoreObj.currentIndex + 1}/{self.state.scoreObj.totalPieces}&nbsp; correct</div>
                <div className="puzzle-map-view-HUD-buttonCont">
                    <button className = "btn btn-primary" onClick={
                    this.replayGame
                    }>Try Again</button>
                </div>

            </div>
        );
    },

    renderHUD: function(){

        var self = this;
        self.setState({
            showHUD:true,
            scoreObj:{currentIndex: self.state.currentIndex += 1, totalPieces:self.state.imageData.puzzleMapPieces.length - 1,
                      correct:self.state.currentIndex
        }});
    },

    updateHudDisplay: function(){

        var self = this;
        switch(self.state.phase){
            case "start":
                self.setState({phase:"play", showHUD:true});
                break;
        }
    },

    updateHUDView: function(mode){
        this.setState({showHUD:mode});
    },

    updatePhase: function(mode){
        this.setState({phase:mode});
    },

    onClosePopup: function(){
        this.setState(({popupObj:null,audioObj:null}));
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
        var page  = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        var mapUrl = self.state.mediaPath + self.state.imageData.puzzleMapPieces[0].imageFileName;
        var backMapStyle = {background:'url('+mapUrl+') no-repeat 100% 100%'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="puzzleMapViewBlock">

                    <div className="puzzle-map-view-mapCont" style={backMapStyle}>
                        {state.phase === "play" ? <PuzzleMapDnDView
                            puzzlePiecesObj = {self.state.puzzlePiecesColl[self.state.currentIndex]}
                            scoreObj = {self.state.scoreObj}
                            renderHUD = {self.renderHUD}
                            updateHUDView = {self.updateHUDView}
                            updatePhase = {self.updatePhase}
                            resetBottomCanvas = {self.state.resetBottomCanvas}
                        />:null}

                        {state.showHUD ? <PuzzleMapHUDView
                            hudStyle = {null}
                            scoreObj = {self.state.scoreObj}
                        />:null}

                        {state.phase === "start" ? self.showStartHud(): null}

                        {state.phase === "finished" ? self.showFinishHud(): null}

                        <canvas width="768" height="504" id="puzzleMapViewBottomCanvas" className = "puzzle-map-view-bottom-canvas">
                        </canvas>
                    </div>
                </div>
            </div>
        );
    },
    
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = PuzzleMapView;