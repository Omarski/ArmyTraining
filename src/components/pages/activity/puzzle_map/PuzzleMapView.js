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
        showHUD: true,
        audioObj:null,
        audioController:"",
        popupObj:null,
        mediaPath:'data/media/',
        loadedImageColl:[],
        loadCounter:0,
        totalImages:0,
        scoreObj:{},
        currentIndex:0,
        puzzlePiecesColl:null
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

    componentWillMount: function(){
    },

    componentDidMount: function() {

       this.state.scoreObj["totalPieces"] = this.state.imageData.puzzleMapPieces.length - 1;
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
        this.preparePuzzlePieces();
        this.renderHUD();
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

    renderHUD: function(){
        this.setState({showHUD:true});
    },

    updateHUDView: function(mode){
        this.setState({showHUD:mode});
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
                        {self.state.puzzlePiecesColl ? <PuzzleMapDnDView
                            imageData = {self.state.imageData}
                            puzzlePiecesObj = {self.state.puzzlePiecesColl[self.state.currentIndex]}
                            scoreObj = {self.state.scoreObj}
                            updateHUDView = {self.updateHUDView}
                        />:null}

                        {state.showHUD ? <PuzzleMapHUDView
                            hudStyle = {null}
                            scoreObj = {self.state.scoreObj}
                        />:null}

                        <canvas width="768" height="504" className = "puzzle-map-view-bottom-canvas">
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