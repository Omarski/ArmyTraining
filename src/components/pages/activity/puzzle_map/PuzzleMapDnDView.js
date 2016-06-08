
var React = require('react');
var DnDPuzzleView = require('../../../widgets/DragAndDropPuzzle/DnDPuzzleView');
var PuzzleMapHUDView = require('./PuzzleMapHUDView');
var PropTypes = React.PropTypes;

var PuzzleMapDnDView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            pointerOffset:{x:0, y:0},
        }
    },

    propTypes: {

        imageData: PropTypes.object.isRequired,
        puzzlePiecesObj: PropTypes.object.isRequired,
        scoreObj: PropTypes.object.isRequired,
        updateHUDView: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
    },

    prepDraggableData: function(){

        var puzzlePiecesObj = this.props.puzzlePiecesObj;
        var draggableColl = [];

        var imgUrl = this.state.mediaPath + puzzlePiecesObj.correct;
        var draggableStyle = {position:'absolute', width:'768px', height:'504px',
            background: "url('"+imgUrl+"') no-repeat 100% 100%", zIndex:'20',
            left: puzzlePiecesObj.offsetX + "px", top:puzzlePiecesObj.offsetY + 30 + "px"};

        var draggableObj = {

            id:"puzzleDraggable"+puzzlePiecesObj.index,
            draggableStyle : draggableStyle,
            imgUrl:null,
            onDraggableBeginDrag: this.onDraggableBeginDrag,
            onDraggableEndDrag: this.onDraggableEndDrag,
            onDraggableWhileDrag: null,
            draggableCanDragCond: null
        };

       draggableColl.push(draggableObj);

        return draggableColl;
    },

    prepTargetData: function(){

        var targetColl = [];

            var targetStyle = {position:'absolute', width:'768px', height:'504px', zIndex:'19',
                background:'transparent', top: "0", left: "0",
                border:'1px solid #000'};

            var targetObj = {
                id:"puzzleTarget",
                imgUrl:null,
                targetStyle: targetStyle,
                targetOverStyle: null,
                onTargetDrop: this.onTargetDrop,
                onTargetHover: this.onTargetHover,
                targetCanDropCond: true
            };

            targetColl.push(targetObj);

        return targetColl;
    },

    onPuzzleReady: function(draggableColl, targetColl){
    },

    onDraggableBeginDrag: function(itemObj, monitor, component){
        var dragItem = component.getDOMNode();
        this.setState({dragOriginX:parseInt(dragItem.style.left.replace("px",""))});
        dragItem.style.width  = "112px";
        dragItem.style.height = "168px";
    },

    onDraggableEndDrag: function(itemObj, monitor, component){

        var dragItem = component.getDOMNode();

        if (monitor.getDropResult()) {
            var target = $("#"+monitor.getDropResult().id);

            if (monitor.didDrop()) {
                if (monitor.getDropResult().id !== "puzzleStageTarget"){
                    dragItem.style.top  = $(target).position().top+"px";
                    dragItem.style.left = $(target).position().left+"px";
                    $(target).attr("pieceNumber", $(dragItem).attr("id").substring(15));

                }else{
                    dragItem.style.top  = (this.state.pointerOffset.y - parseInt(dragItem.style.height) / 2)+"px";
                    dragItem.style.left = (this.state.pointerOffset.x - parseInt(dragItem.style.width) / 2)+"px";
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


    draggableCanDragCond: function(itemObj){
        //return true or false according to target
        return true;
    },

    onTargetDrop: function(targetObj, monitor, component){
    },

    onTargetHover: function(targetObj, monitor, component){
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

    render: function() {

        var self=this;
        var hudStyle = {};

        return (
            <div>
                <DnDPuzzleView
                    stageStyle           = {null}
                    draggableColl        = {this.prepDraggableData()}
                    stageTargetObj       = {null}
                    targetsColl          = {this.prepTargetData()}
                    onDraggableBeginDrag = {this.onDraggableBeginDrag}
                    onDraggableEndDrag   = {this.onDraggableEndDrag}
                    draggableCanDragCond = {null}
                    onTargetDrop         = {this.onTargetDrop}
                    onTargetHover        = {this.onTargetHover}
                    targetCanDropCond    = {null}
                    onPuzzleReady        = {this.onPuzzleReady}
                />

                <PuzzleMapHUDView
                    hudStyle = {hudStyle}
                    imageData = {self.props.imageData}
                    scoreObj = {self.props.scoreObj}
                />

                <canvas width="768" height="504" className = "puzzle-map-view-bottom-canvas">
                </canvas>
            </div>
        )
    }
});

module.exports = PuzzleMapDnDView;