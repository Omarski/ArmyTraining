
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
        var draggableStyle = {};
        var draggablePositions = [{x:0, y:0}];

        for (var i=0; i < imageData.regions.length; i++){

            var draggableObj = {
                draggableStyle : draggableStyle,
                width: 55, height: 60,
                posX: 0, posY:0

                                };
            draggableColl.push(draggableObj);
        }
        return draggableColl;
    },

    render: function() {

        var stageStyle = {};

        return (
            <DnDPuzzleView
                stageWidth    = {768}
                stageHeight   = {504}
                stageStyle    = {stageStyle}
                draggableColl = {this.prepDraggableData()}
                targetsColl   = {this.prepTargetData()}
                onItemDrag    = {this.onItemDrag}
                onTargetDrop  = {this.onTargetDrop}
                onPuzzleReady = {this.onPuzzleReady}
            />
        )
    }
});

module.exports = CultureQuestPuzzleGameView;