
var React = require('react');
var DnDPuzzleView = require('../../../widgets/DragAndDropPuzzle/DnDPuzzleView');
var PropTypes = React.PropTypes;

var CultureQuestPuzzleGameView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/'
        };
    },

    propTypes: {

        imageData: PropTypes.object.isRequired
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
        var pieceHeight = 55, topStart = 110, left = 710;

        for (var i=0; i < imageData.regions.length; i++){

            var imgUrl = this.state.mediaPath + imageData.regions[i].tile;
            var draggableStyle = {position:'absolute', width:'40px', height:'50px',
                background: "url('"+imgUrl+"') no-repeat 100% 100%",
                left: left+"px", top:topStart+(pieceHeight * i)+"px"};

            var draggableObj = {
                
                id:"puzzleDraggable"+i,
                draggableStyle : draggableStyle,
                imgUrl:null,
                onDraggableDrag: this.onDraggableDrag 
                };

            draggableColl.push(draggableObj);
        }
        //remove
        // for (var item in draggableColl[0]) console.log(item + " : " + draggableColl[0][item]);
        return draggableColl;
    },

    prepTargetData: function(){

        var imageData = this.props.imageData;
        var targetColl = [];
        var gridOrigin = {x:215, y:113}, padding= '5px', targetWidth = 110, targetHeight = 165;
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

            var targetStyle = {position:'absolute', width:'110px', height:'165px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid #000'};

            var targetOverStyle = {position:'absolute', width:'110px', height:'165px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid red'};

            var targetObj = {

                id:"puzzleTarget"+i,
                imgUrl:null,
                targetStyle: targetStyle,
                targetOverStyle: targetOverStyle,
                onTargetDrop: this.onTargetDrop
                };

            targetColl.push(targetObj);
        }
        //console.log("targetObj 0 x: " + targetColl[0].targetOverStyle.left + "targetObj 1 x: " + targetColl[1].targetOverStyle.left);
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
                          top: '34px', left:'0', position:'absolute', zIndex:'25'};

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