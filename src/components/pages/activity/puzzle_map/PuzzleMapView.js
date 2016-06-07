/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var PuzzleMapDnDView = require("./PuzzleMapDnDView");
var PageHeader = require('../../../widgets/PageHeader');
//var tempJson = require('./AfpakPuzzleMap.js');

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
        scoreObj:{},
        currentIndex:0,
        puzzlePiecesColl:[]
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(tempJSON);
        //data.imageData = JSON.parse(data.page.info.property[2].value);
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
       this.preparePuzzlePieces();
    },

    preloadImages: function(){

        var self = this;
        var state = self.state;
        var imageColl = [];

        self.props.imageColl.map(function(region,index){
            imageColl.push({correct:self.state.mediaPath+region.correctImageName,
                labeled:self.state.mediaPath+region.labeledImageName,
                hint:self.state.mediaPath+region.imageFileName});
        });

        self.setState({totalImages:imageColl.length * 3});

        for (var i=0 ; i < imageColl.length; i++){
            for (var key in imageColl[i]){
                state.loadedImageColl[i][key] = new Image();
                state.loadedImageColl[i][key].src = imageColl[i];
                state.loadedImageColl[i][key].onload = self.loadCounter;
            }
        }
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        if (self.state.loadCounter == self.state.totalImages){
            this.onImagesPreloaded();
        }
    },

    onImagesPreloaded: function(){
        console.log("Images loaded...");
        this.renderHUD();
    },

    preparePuzzlePieces: function(){

    },

    renderHUD: function(){

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
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        var mapUrl = self.state.mediaPath + self.state.imageData.mapImage;
        var backMapStyle = {background:'url('+mapUrl+') no-repeat 100% 100%'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="puzzleMapViewBlock">

                    <div className="puzzle-map-view-mapCont" style={backMapStyle}>
                       <PuzzleMapDnDView
                           imageData = {state.imageData}
                           puzzlePiecesObj = {state.puzzlePiecesColl[state.currentIndex]}
                           scoreObj = {state.scoreObj}
                           updateHUDView = {self.updateHUDView}
                       />
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