
var React = require('react');

var DnDPuzzleView = require('../../../widgets/DragAndDropPuzzle/DnDPuzzleView');
var PropTypes = React.propTypes;

var CultureQuestPuzzleGameView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
        };
    },

    propTypes: {

        imageData: PropTypes.arrayOf.object.isRequired
    },

    componentWillMount: function() {
        this.prepDraggableData();
        this.prepTargetData();
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    prepDraggableData: function(){

        var imageData = this.props.imageData;
        var draggableColl = [];
        var pieceHeight = 55, topStart = 140, left = 705;
        var draggableStyle = {position:'absolute', width:'55px', height:'60px',
                              background:null,left:null, top:null};

        for (var i=0; i < imageData.regions.length; i++){

            var draggableObj = {
                
                id:"puzzleDraggable"+i,
                draggableStyle : draggableStyle,
                imgUrl:null,
                onDraggableDrag: this.onDraggableDrag 
                };

            //amend style unique
            var imgUrl = this.state.mediaPath + imageData.regions[i].tile;
            draggableObj.draggableStyle.background = "url('"+imgUrl+"') no-repeat 100% 100%";
            draggableObj.draggableStyle.left = left+"px";
            draggableObj.draggableStyle.top = topStart+(pieceHeight * i)+"px";

            draggableColl.push(draggableObj);
        }
        return draggableColl;
    },

    prepTargetData: function(){

        var imageData = this.props.imageData;
        var targetColl = [];
        var targetStyle = {position:'absolute', width:'110px', height:'168px',
                              background:'#fff', left:null, top:null,
                              border:'1px solid #000'};

        var targetOverStyle = {position:'absolute', width:'110px', height:'168px',
            background:'#fff', left:null, top:null,
            border:'1px solid red'};

        var gridOrigin = {x:215, y:113}, targetWidth = 110, targetHeight = 165;
        var targetPosColl = [];

        for (var r = 0 ; r < 3; r++){
            for (var c = 0 ; c < 3 ; c++){
                targetPosColl.push({
                    x:gridOrigin.x + (targetWidth * c),
                    y:gridOrigin.y + (targetHeight * r)
                });
            }
        }

        for (var i=0; i < imageData.regions.length; i++){

            var targetObj = {

                id:"puzzleTarget"+i,
                targetStyle: targetStyle,
                targetOverStyle: targetOverStyle,
                onTargetDrop: this.onTargetDrop
                };

            //amend style unique
            targetObj.targetStyle.left = targetPosColl[i].x + "px";
            targetObj.targetStyle.top  = targetPosColl[i].y + "px";

            targetColl.push(targetObj);
        }
        return targetColl;
    },
    
    onPuzzleReady: function(){
        console.log("At game - puzzle ready!");
    },

    onDraggableDrag: function(itemObj){
        console.log("At game - dragged: " + itemObj.id);
    },

    onTargetDrop: function(targetObj){
        console.log("At game - target: " + targetObj.id);
    },

    render: function() {

        var stageStyle = {width:'768px', height:'506px', display:'block',
                          position:'absolute', zIndex:'25'};

        return (
            <div>
                <DnDPuzzleView
                    stageStyle      = {stageStyle}
                    draggableColl   = {this.prepDraggableData()}
                    targetsColl     = {this.prepTargetData()}
                    onDraggableDrag = {this.onDraggableDrag}
                    onTargetDrop    = {this.onTargetDrop}
                    onPuzzleReady   = {this.onPuzzleReady}
                />
                <div className = "CultureQuestPuzzleGameView-puzzleSlider">
                </div>
            </div>
        )
    }
});

module.exports = CultureQuestPuzzleGameView;