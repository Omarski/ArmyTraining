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
                activeRoundObjexColl:[],
                firstRound:true
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

        console.log("randColl: " + randColl.toString());
        for (var i = 0; i < randColl.length; i++){
            var artifactObj = {};
            artifactObj["image"] = loadedObjexColl[randColl[i]].fullImgUrl;
            artifactObj["id"] = loadedObjexColl[randColl[i]].hog_id;
            artifactsColl.push(artifactObj);
            activeObjexColl.push(loadedObjexColl[randColl[i]]);
        }

        this.setState({activeObjexColl:activeObjexColl});

        return artifactsColl;
    },

    onLayersReady: function(canvasColl){
        for (var i = 0; i < canvasColl.length; i++) canvasColl[i].style.opacity = 1;
        this.setState({layersCanvColl:canvasColl});
    },

    onRegionClicked: function(canvasElement){

        var self = this;
        if (canvasElement && !canvasElement.hidden) {
            console.log("Clicked on: " + canvasElement.id);
            var hit = $.grep(self.props.activeRoundObjexColl, function(e) { return e.hog_id === canvasElement.id });
            if (hit) {
                $("#"+canvasElement.id).css("opacity","1");
                self.setState({roundHits:self.state.roundHits + 1},
                function(){
                    if (self.state.roundHits === 5) {
                        self.setState({firstRound:false});
                    }else if (self.state.roundHits === 10){
                        console.log("Round finished ...");
                        self.viewUpdate({task:"showLevelPop",value:null});
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
        switch (update.task){
            case "activeRoundObjexColl":
                self.setState({activeRoundObjexColl:update.value});
                break;
        }
    },

    render: function() {

        var self = this;

        return (<div>
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
                <ObjexNavView
                    gameData = {self.props.gameData}
                    mediaPath = {self.props.mediaPath}
                    activeObjexColl = {self.state.activeObjexColl}
                    updateGameView = {self.updateGameView}
                    firstRound = {self.state.firstRound}
                />
               </div>
        )
    }
});

module.exports = ObjexGameView;