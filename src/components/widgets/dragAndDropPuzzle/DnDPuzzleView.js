
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

        stageStyle: PropTypes.object.isRequired,
        draggableColl:PropTypes.arrayOf.object.isRequired,
        targetsColl:PropTypes.arrayOf.object.isRequired,
        onDraggableDrag:PropTypes.func,
        onTargetDrop:PropTypes.func,
        onPuzzleReady:PropTypes.func
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
        this.renderDraggableColl();
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    renderDraggableColl: function(){

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
        this.renderDropTargetColl();
        return draggableCollRender;
    },

    renderDropTargetColl: function(){

        var self = this;
        var dropTargetsRender = self.targetsColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDropTarget
                    id = {"puzzleTarget"+index}
                    imgUrl = {itemObj.imgUrl?itemObj.imgUrl:null}
                    width = {itemObj.width}
                    height = {itemObj.height}
                    posX = {itemObj.posX}
                    posY = {itemObj.posY}
                    targetStyle = {itemObj.style}
                    targetOverStyle = {itemObj.targetOverStyle}
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

    onTargetDrop: function(itemObj){
        //bubble up to parent
        this.props.onTargetDrop(itemObj);
    },

    render: function() {

        return (
            <div style={this.props.stageStyle}>
                {this.renderDraggableColl()}
                {this.renderDropTargetColl()}
            </div>
        )
    }
});

module.exports = DragDropContext(HTML5Backend)(DnDPuzzleView);