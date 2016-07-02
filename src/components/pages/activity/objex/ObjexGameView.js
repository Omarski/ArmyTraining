var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');
var ObjexNavView = require('./ObjexNavView');

var PropTypes  = React.PropTypes;

var ObjexGameView = React.createClass({

    
    getInitialState: function() {

        return {imageLayersData:{},
                lastHighlightedRegion:null,
                layersCanvColl:[],
                activeObjexColl:[],
                activeRoundObjexColl:null,
                firstRound:true,
                roundHits:0,
                hitColl:[],
                showCells:false
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        levelData: PropTypes.object.isRequired,
        loadedObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        viewUpdate: PropTypes.func.isRequired,
        levelStats: PropTypes.object.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
        this.prepLayersData();
    },
    
    prepLayersData: function(){

        var self = this;

        var artifactsColl = self.getRandomObjex();
        
        self.setState({imageLayersData:{

            areaWidth: 768,
            areaHeight: 400,
            imageColl: artifactsColl,
            backgroundImage: self.props.levelData.backgroundImage.src,
            onLayersReady: self.onLayersReady,
            onRollover: self.onRegionRollover,
            onClick: self.onRegionClicked
        }});
    },

    getRandomObjex: function(){

        var artifactsColl = [];
        var loadedObjexColl = this.props.loadedObjexColl;
        var activeObjexColl = [];
        var randColl = [];

        while (randColl.length < 10){

            var rand = Math.floor(Math.random()*this.props.levelData.objects.length);
            if ($.inArray(rand, randColl) === -1) randColl.push(rand);
        }

        for (var i = 0; i < randColl.length; i++){
            var artifactObj = {};
            artifactObj["image"] = loadedObjexColl[randColl[i]].fullImgUrl;
            artifactObj["id"] = loadedObjexColl[randColl[i]].hog_id;
            artifactsColl.push(artifactObj);
            activeObjexColl.push(loadedObjexColl[randColl[i]]);
        }

        this.setState({activeObjexColl:activeObjexColl},function(){
            this.getRoundObjex();
        });
        
        return artifactsColl;
    },

    getRoundObjex: function(){

        var self = this;
        var activeRoundObjexColl = self.state.firstRound ? self.state.activeObjexColl.slice(0,5):
            self.state.activeObjexColl.slice(5,11);
        self.setState({activeRoundObjexColl:activeRoundObjexColl, showCells:true});
    },

    onLayersReady: function(canvasColl){
        for (var i = 0; i < canvasColl.length; i++) canvasColl[i].style.opacity = 1;
        this.setState({layersCanvColl:canvasColl});
    },

    onRegionClicked: function(canvasElement){

        var self = this;

        if (canvasElement && !canvasElement.hidden) {

            var hit = $.grep(self.state.activeRoundObjexColl, function(e) { return e.hog_id === canvasElement.id })[0];

            if (hit && self.state.hitColl.indexOf(hit.hog_id) === -1) {
                $("#objexViewCellImg"+canvasElement.id).css("opacity","1");
                var hitColl = self.state.hitColl;
                hitColl.push(hit.hog_id);

                self.setState({roundHits:self.state.roundHits + 1, hitColl:hitColl},
                function(){

                    if (self.state.roundHits === 5) {

                        self.setState({firstRound:false, showCells:false},function(){self.getRoundObjex()});
                        $("#objexViewTextHalfway").css("display","block");

                        setTimeout(function(){
                            $("#objexViewTextHalfway").css("display","none");
                        },2000);
                        
                    }else if (self.state.roundHits === 10){
                        console.log("Level finished ...");
                        self.viewUpdate({task:"levelDone",value:null});
                    }
                });
            }
         }
    },

    onRegionRollover: function(canvasElement, pageX, pageY) {

    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    updateGameView: function(update){

        var self = this;
    },

    render: function() {

        var self = this;

        return (<div>

                <div className="objex-view-textHalfway" id="objexViewTextHalfway">Halfway there!</div>

                {self.state.imageLayersData.imageColl ? <ImageLayersView
                    areaWidth       = {self.state.imageLayersData.areaWidth}
                    areaHeight      = {self.state.imageLayersData.areaHeight}
                    imageColl       = {self.state.imageLayersData.imageColl}
                    backgroundImage = {self.state.imageLayersData.backgroundImage}
                    onLayersReady   = {self.state.imageLayersData.onLayersReady}
                    onRollover      = {self.state.imageLayersData.onRollover}
                    onClick         = {self.state.imageLayersData.onClick}
                >
                </ImageLayersView>:null}
                {self.state.activeRoundObjexColl ? <ObjexNavView
                    gameData = {self.props.gameData}
                    showCells = {self.state.showCells}
                    mediaPath = {self.props.mediaPath}
                    activeObjexColl = {self.state.activeObjexColl}
                    updateGameView = {self.updateGameView}
                    activeRoundObjexColl = {self.state.activeRoundObjexColl}
                />:null}
               </div>
        )
    }
});

module.exports = ObjexGameView;