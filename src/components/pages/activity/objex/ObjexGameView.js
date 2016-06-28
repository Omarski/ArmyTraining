var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');
var PropTypes  = React.PropTypes;

var ObjexGameView = React.createClass({

    
    getInitialState: function() {

        return {imageLayersData:{},
                lastHighlightedRegion:null,
                layersCanvColl:[]
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        loadedObjexColl: PropTypes.object.isRequired,
        levelObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        viewUpdate: PropTypes.func.isRequired
    },

    componentWillMount: function() {
        
        this.prepLayersData();
    },

    componentDidMount: function(){
    },
    
    prepLayersData: function(){

        //prep CultureQuestMap data from original JSON
        var self = this;
        var artifactsColl = [];

        //produce 10 random artifacts
        var loadedObjexColl = self.props.loadedObjexColl;
        var randArtifactColl = [];

        while (randArtifactColl.length < 10){

            var randObjexObj = loadedObjexColl[Math.floor(Math.random()*loadedObjexColl.length)];

            for (var r = 0; r < randArtifactColl.length; r++){

                var matchObj = randArtifactColl.filter(function(obj){
                   return randObjexObj.hog_id === obj.hog_id;
                });

                if (!matchObj) randArtifactColl.push(randObjexObj);
            }
        }

        for (var i = 0; i < randArtifactColl.length; i++){
            var artifactObj = {};
            artifactObj["image"] = randArtifactColl[i].fullImgSrc;
            artifactsColl.push(artifactObj);
        }
        
        self.setState({imageLayersData:{

            areaWidth: 768,
            areaHeight: 504,
            imageColl: artifactsColl,
            backgroundImage: self.props.gameData.backgroundImage.src,
            onLayersReady: self.onLayersReady,
            onRollover: self.onRegionRollover,
            onClick: self.onRegionClicked
        }});
    },

    onLayersReady: function(canvasColl){
        this.setState({layersCanvColl:canvasColl});
    },

    onRegionClicked: function(canvasElement){

        if (canvasElement && !canvasElement.hidden) {
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
        }
    },

    render: function() {

        var self = this;

        return (<div>
                <ImageLayersView
                    areaWidth       = {self.state.imageLayersData.areaWidth}
                    areaHeight      = {self.state.imageLayersData.areaHeight}
                    imageColl       = {self.state.imageLayersData.imageColl}
                    backgroundImage = {self.state.imageLayersData.backgroundImage}
                    onLayersReady   = {self.state.imageLayersData.onLayersReady}
                    onRollover      = {self.state.imageLayersData.onRollover}
                    onClick         = {self.state.imageLayersData.onClick}
                >
                </ImageLayersView>
               </div>
        )
    }
});

module.exports = ObjexGameView;