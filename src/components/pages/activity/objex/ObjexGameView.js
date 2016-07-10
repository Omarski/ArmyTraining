var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');
var ObjexNavView = require('./ObjexNavView');
var ObjexInfoPopView = require('./ObjexInfoPopView');

var PropTypes  = React.PropTypes;

var ObjexGameView = React.createClass({

    
    getInitialState: function() {

        return {imageLayersData:{},
                lastHighlightedRegion:null,
                layersCanvColl:[],
                activeObjexColl:[],
                activeRoundObjexColl:null,
                activeObjex:null,
                firstRound:true,
                roundHits:0,
                hitColl:[],
                showCells:false,
                hintMode:false,
                hintedId:null
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        levelData: PropTypes.object.isRequired,
        loadedObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        viewUpdate: PropTypes.func.isRequired,
        levelStats: PropTypes.object.isRequired,
        advancedLevel: PropTypes.bool.isRequired
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
            activeObjexColl.push(loadedObjexColl[randColl[i]]);
        }

        this.props.levelData.objects.map(function(objex,index){
            var artifactObj = {};
            artifactObj["image"] = loadedObjexColl[index].fullImgUrl;
            artifactObj["id"] = loadedObjexColl[index].hog_id;
            artifactsColl.push(artifactObj);
        });
           
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

            if ((hit && self.state.hitColl.indexOf(hit.hog_id) === -1) ||
                (hit && self.state.hintMode && hit.hog_id === self.state.hintedId)) {

                $("#objexViewCellImg"+canvasElement.id).css("opacity","1");
                var hitColl = self.state.hitColl;
                hitColl.push(hit.hog_id);

                self.setState({roundHits:self.state.roundHits + 1,
                               hitColl:hitColl,
                               activeObjex: hit,
                               hintMode:false
                });

                $("#"+hit.hog_id).remove();

                self.viewUpdate({task:"successAudio", value:null});
            }
         }
    },

    onRegionRollover: function(canvasElement, pageX, pageY) {

    },

    showHint: function(){

        var self = this;
        self.viewUpdate({task:"coinAudio", value:null});

        if (!self.state.hintMode) {
            for (var i=0; i <  self.state.activeRoundObjexColl.length; i++){
                if (self.state.hitColl.indexOf(self.state.activeRoundObjexColl[i].hog_id) === -1){
                    var hog_id = self.state.activeRoundObjexColl[i].hog_id;

                    //find hint layer
                    for (var l = 0; l < self.state.layersCanvColl.length; l++){
                        var layerId = self.state.layersCanvColl[l].id;
                        if (layerId.indexOf(hog_id) !== -1) {
                            self.setState({hintMode:true, hintedId:hog_id});
                            self.hintEffect($("#"+hog_id));
                        }
                    }
                    break;
                }
            }
        }
    },

    hintEffect: function(hintLayer){

        var self = this;
        if ($(hintLayer).length > 0) {
            $(hintLayer).animate({
                opacity:1,
                webkitFilter: "brightness(3)",
                filter: "brightness(3)"
            }, 500, function(){
                $(hintLayer).css({"opacity":"0", webkitFilter:"brightness(100%)", filter:"brightness(100%)"});
                if (self.state.hintMode) self.hintEffect(hintLayer);
            });
        }else return false;
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    updateGameView: function(update){

        var self = this;
        switch (update.task){
            case "delInfoPop":
                self.setState({activeObjex:null});

                if (self.state.roundHits === 5) {

                    self.setState({firstRound:false, showCells:false},function(){self.getRoundObjex()});
                    $("#objexViewTextHalfway").css("display","block");

                    setTimeout(function(){
                        $("#objexViewTextHalfway").css("display","none");
                    },2000);

                }else if (self.state.roundHits === 10){

                    setTimeout(function(){
                        self.viewUpdate({task:"levelDone",value:null});
                    },1000);
                }
                break;
        }
    },

    render: function() {

        var self = this;

        return (<div>

                {self.state.activeObjex ? <ObjexInfoPopView
                    activeObjex = {self.state.activeObjex}
                    mediaPath = {self.props.mediaPath}
                    updateGameView = {self.updateGameView}
                />:null}

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
                    viewUpdate = {self.viewUpdate}
                    activeRoundObjexColl = {self.state.activeRoundObjexColl}
                    showHint = {self.showHint}
                    advancedLevel = {self.props.advancedLevel}
                />:null}
               </div>
        )
    }
});

module.exports = ObjexGameView;