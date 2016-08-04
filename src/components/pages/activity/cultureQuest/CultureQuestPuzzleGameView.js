
var React = require('react');
var ReactDom = require('react-dom');
var DnDPuzzleView = require('../../../widgets/dragAndDropPuzzle/DnDPuzzleView');
var VideoPlayer = require('../../../widgets/VideoPlayer');
var PropTypes = React.PropTypes;

var CultureQuestPuzzleGameView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            stageIsTarget:false,
            pointerOffset:{x:0, y:0},
            dragOriginX:0,
            showVideo:false
        }
    },

    propTypes: {

        imageData: PropTypes.object.isRequired
    },

    componentWillMount: function() {
        this.displayPuzzlePopup();
        this.prepDraggableData();
        this.prepTargetData();
        this.prepStageTargetObj();
    },

    componentDidMount: function(){
        //special gift piece
        $("#puzzleTarget0").attr("pieceNumber","0");
    },

    displayPuzzlePopup: function(){

        var self = this;
        var debriefText = {width:'400px',marginLeft:'33px',marginTop:'-7px'};

        var popupObj = {
            id:"PuzzleBackground",
            popupStyle: {height:'400px', width:'460px', top:'10%', left:'10%', background:'#fff', zIndex:'25'},

            content: function(){

                return(
                    <div className="popup-view-content">
                        <div className="popup-view-bodyText" style={debriefText}>
                            {self.props.imageData.debriefText}
                        </div> 
                    </div>
                )
            }
        };

        this.props.displayPopup(popupObj);
    },

    prepDraggableData: function(){

        var imageData = this.props.imageData;
        var draggableColl = [];
        var pieceHeight = 55, topStart = 90, left = 680;

        for (var i=0; i < imageData.regions.length; i++){

            var imgUrl = this.state.mediaPath + imageData.regions[i].tile;
            var draggableStyle = {position:'absolute', width:'40px', height:'50px',
                background: "url('"+imgUrl+"') no-repeat", backgroundSize:"40px 50px", zIndex:'30',
                left: left+"px", top:topStart+(pieceHeight * i)+"px"};

            if (i === 0) {
                draggableStyle.top = "113px";
                draggableStyle.left = "140px";
                draggableStyle.width = "112px";
                draggableStyle.height = "168px";
                draggableStyle.backgroundSize = "100%";
            }

            var draggableObj = {
                
                id:"puzzleDraggable"+i,
                draggableStyle : draggableStyle,
                imgUrl:null,
                onDraggableBeginDrag: this.onDraggableBeginDrag,
                onDraggableEndDrag: this.onDraggableEndDrag,
                onDraggableWhileDrag: this.onDraggableWhileDrag,
                draggableCanDragCond: null
                };

            draggableColl.push(draggableObj);
        }

        return draggableColl;
    },

    prepTargetData: function(){

        var imageData = this.props.imageData;
        var targetColl = [];
        var gridOrigin = {x:140, y:113}, targetWidth = 110, targetHeight = 165;
        var targetPosColl = [];

        for (var r = 0 ; r < 3; r++){
            for (var c = 0 ; c < 3 ; c++){
                var x = parseInt(gridOrigin.x + (targetWidth * c));
                var y = parseInt(gridOrigin.y + (targetHeight * r));
                targetPosColl.push({
                    x:x,
                    y:y
                });
            }
        }

        for (var i=0; i < imageData.regions.length; i++){

            var targetStyle = {position:'absolute', width:'110px', height:'165px', zIndex:'50px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid #000'};

            var targetOverStyle = {position:'absolute', width:'110px', height:'165px', zIndex:'50px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid red'};

            var targetObj = {
                id:"puzzleTarget"+i,
                imgUrl:null,
                targetStyle: targetStyle,
                targetOverStyle: targetOverStyle,
                onTargetDrop: this.onTargetDrop,
                onTargetHover: this.onTargetHover,
                targetCanDropCond: true
                };

            targetColl.push(targetObj);
        }

        return targetColl;
    },

    prepStageTargetObj: function(){

        var stageStyle = {position:'absolute', width:'765px', height:'502px',
            top:0, left:0, zIndex:'10'};

        return {
            id:"puzzleStageTarget",
            imgUrl:null,
            targetStyle: stageStyle,
            targetOverStyle: null,
            onTargetDrop: this.onTargetDrop,
            onTargetHover: this.onTargetHover,
            targetCanDropCond: this.state.stageIsTarget
        };
    },
    
    onPuzzleReady: function(draggableColl, targetColl){
    },

    onDraggableBeginDrag: function(itemObj, monitor, component){
        var dragItem = ReactDom.findDOMNode(component);
        this.setState({dragOriginX:parseInt(dragItem.style.left.replace("px",""))});
        dragItem.style.width  = "112px";
        dragItem.style.height = "168px";
        dragItem.style.backgroundSize  = "100%";
    },

    onDraggableEndDrag: function(itemObj, monitor, component){

        var dragItem = ReactDom.findDOMNode(component);

        if (monitor.getDropResult()) {
            var target = $("#"+monitor.getDropResult().id);

            if (monitor.didDrop()) {
                if (monitor.getDropResult().id !== "puzzleStageTarget"){
                    dragItem.style.top  = $(target).position().top+"px";
                    dragItem.style.left = $(target).position().left+"px";
                    $(target).attr("pieceNumber", $(dragItem).attr("id").substring(15));
                    // this.viewUpdate({task:"tileAudio", value:null});
                    this.checkCompletion();
                }else{
                    dragItem.style.top  = (this.state.pointerOffset.y - parseInt(dragItem.style.height) / 2)+"px";
                    dragItem.style.left = (this.state.pointerOffset.x - parseInt(dragItem.style.width) / 2) -50 + "px";
                    if (this.state.pointerOffset.x > 700) dragItem.style.left = "650px";
                }
            }
        }else{
            //dragged shrunk only if dragged from slider
            if (this.state.dragOriginX > 700){
                dragItem.style.width  = "40px";
                dragItem.style.height = "50px";
            }

        }
    },

    checkCompletion: function(){
        var self = this;
        var correctColl = "";
        var placedPuzzles = "";
        $("[id^='puzzleTarget']").each(function(){
            if ($(this).attr('pieceNumber')) {placedPuzzles += ($(this).attr('pieceNumber')); self.viewUpdate({task:"tileAudio", value:null});}
            correctColl += $(this).attr('id').substring(12);
        });
        
        //completed
        if (placedPuzzles === correctColl) {
            self.setState({showVideo:true});
            $("#DnDStage").css("pointer-events","none");
        }
    },

    draggableCanDragCond: function(itemObj){
        //return true or false according to target
        return true;
    },

    onTargetDrop: function(targetObj, monitor, component){
    },
    
    onTargetHover: function(targetObj, monitor, component){
        this.setState({stageIsTarget: targetObj.id === "puzzleStageTarget"});
        var offset = monitor.getSourceClientOffset();
        if (offset) this.setState({pointerOffset:{x:offset.x, y:offset.y}})
    },

    targetCanDropCond: function(targetObj){
        //return true or false according to target
    },

    onClosePopup: function(){
        //bubble up
        this.props.onClosePopup();
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update);
    },

    onVidEnded: function(){
        this.viewUpdate({task:"gameEnded",value:null})
    },


    render: function() {
        var self=this;
        var videoUrl = this.state.mediaPath + this.props.imageData.videoReward;
        var stageStyle = {width:'768px', height:'506px', display:'block',
                          top: '34px', left:0, position:'absolute', zIndex:'25'};

        return (
            <div>
                <DnDPuzzleView
                    stageStyle           = {stageStyle}
                    draggableColl        = {this.prepDraggableData()}
                    stageTargetObj       = {this.prepStageTargetObj()}
                    targetsColl          = {this.prepTargetData()}
                    onDraggableBeginDrag = {this.onDraggableBeginDrag}
                    onDraggableEndDrag   = {this.onDraggableEndDrag}
                    draggableCanDragCond = {null}
                    onTargetDrop         = {this.onTargetDrop}
                    onTargetHover        = {this.onTargetHover}
                    targetCanDropCond    = {null}
                    onPuzzleReady        = {this.onPuzzleReady}
                />
                <div className = "culture-quest-puzzle-game-view-puzzleSlider">
                    <div className = "culture-quest-puzzle-game-slider-title">Collection</div>
                </div>

                {self.state.showVideo ?
                    <VideoPlayer
                        id="puzzleAwardVideo"
                        style={{zIndex:'50',position:'absolute',top:'141px',left:'82px', width:'450px', height:'338px'}}
                        sources={[{format:"mp4",url:videoUrl}]}
                        autoPlay={true}
                        width="450"
                        height="338"
                        onVidEnded={self.onVidEnded}
                    />:null}
            </div>
        )
    }
});

module.exports = CultureQuestPuzzleGameView;