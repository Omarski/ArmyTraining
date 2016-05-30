
var React = require('react');

var PropTypes = React.PropTypes;

var DnDPuzzleDraggable = require('./DnDPuzzleDraggable');
var DnDPuzzleDropTarget = require('./DnDPuzzleDropTarget');

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
        draggableColl: PropTypes.array.isRequired,
        targetsColl: PropTypes.array.isRequired,
        onDraggableDrag: PropTypes.func,
        onTargetDrop: PropTypes.func,
        onPuzzleReady: PropTypes.func
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    renderDraggableColl: function(){

        var self = this;
        var draggableCollRender = self.props.draggableColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDraggable key={index}
                    id={"puzzleDraggable"+index}
                    imgUrl={itemObj.imgUrl?itemObj.imgUrl:null}
                    draggableStyle={itemObj.draggableStyle}
                    onDraggableDrag={self.onDraggableDrag}
                    />
            )
        });

        self.state.renderedDraggableColl = draggableCollRender;
        return draggableCollRender;
    },

    renderDropTargetColl: function(){

        var self = this;
        var dropTargetsRender = self.props.targetsColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDropTarget key={index}
                    id = {"puzzleTarget"+index}
                    imgUrl = {itemObj.imgUrl?itemObj.imgUrl:null}
                    targetStyle = {itemObj.targetStyle}
                    targetOverStyle = {itemObj.targetOverStyle}
                    onTargetDrop = {self.onTargetDrop}
                />
            )
        });

        self.state.renderedDropTargetsColl = dropTargetsRender;
        self.props.onPuzzleReady(self.state.renderedDraggableColl,self.state.renderedDropTargetsColl);

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

module.exports = DnDPuzzleView;