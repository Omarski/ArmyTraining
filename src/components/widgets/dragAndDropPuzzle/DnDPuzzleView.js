
var React = require('react');
//using HTML5 backend
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

var DnDPuzzleDraggable = require('./DnDPuzzleDraggable');
var DnDPuzzleDropTarget = require('./DnDPuzzleDropTarget');
var PropTypes = React.propTypes;

var DnDPuzzleView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            renderedDraggableColl:[],
            renderedDropTargetsColl:[]
        };
    },

    propTypes: {

        stageWidth: PropTypes.number.isRequired,
        stageHeight: PropTypes.number.isRequired,
        stageStyle: PropTypes.object.isRequired,

        draggableColl:PropTypes.arrayOf.object.isRequired,
        targetsColl:PropTypes.arrayOf.object.isRequired,
        onItemDrag:PropTypes.func,
        onTargetDrop:PropTypes.func,
        onPuzzleReady:PropTypes.func

    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
        this.renderDraggables();
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    renderDraggables: function(){

        var self = this;
        var draggableCollRender = self.draggableColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDraggable
                    id={"puzzleDraggable"+index}
                    imgUrl={itemObj.imgUrl?itemObj.imgUrl:null}
                    width={itemObj.width}
                    height={itemObj.height}
                    posX={itemObj.posX}
                    posY={itemObj.posY}
                    draggableStyle={itemObj.style}
                    onDraggableDrag=self.onDraggableDrag
                    />
            )
        });

        self.state.renderedDraggableColl = draggableCollRender;
        this.renderDropTargets();
        return draggableCollRender;
    },

    renderDropTargets: function(){

        var self = this;
        var dropTargetsRender = self.targetsColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDraggable
                    id = {"puzzleTarget"+index}
                    imgUrl = {itemObj.imgUrl?itemObj.imgUrl:null}
                    width = {itemObj.width}
                    height = {itemObj.height}
                    posX = {itemObj.posX}
                    posY = {itemObj.posY}
                    targetStyle = {itemObj.style}
                    onTargetDrop = self.onTargetDrop
                />
            )
        });

        self.state.renderedDropTargetsColl = dropTargetsRender;
        self.props.onPuzzleReady(self.state.renderedDraggableColl,
                                 self.state.renderedDropTargetsColl);

        return dropTargetsRender;
    },

    onDraggableDrag: function(itemObj){
        //bubble up to parent
        this.props.onDraggableDrag(itemObj);
    },

    render: function() {

        return (
            <div></div>
        )
    }
});

module.exports = DragDropContext(HTML5Backend)(DnDPuzzleView);