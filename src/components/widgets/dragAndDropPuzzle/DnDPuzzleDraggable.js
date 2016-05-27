var React = require('react');
var DragSource = require('react-dnd').DragSource;
var ItemTypes = require('./Constants').ItemTypes;
var PropTypes = React.PropTypes;

//draggable contract:
var puzzlePieceSource = {
    beginDrag: function (props) {
        // Return the data describing the dragged item
        console.log("Dragging....");
        return {id: props.id};
    }
};

//props needed - monitor updates, connect designations
function collect(connect, monitor) {
    return {
        //designate as draggable
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

var DnDPuzzleDraggable = React.createClass({
    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        id:PropTypes.string.isRequired,
        imgUrl:PropTypes.string.isRequired,
        draggableStyle:PropTypes.object.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    render: function() {

        var connectDragSource = this.props.connectDragSource;
        var isDragging = this.props.isDragging;
        var draggableStyle = this.props.draggableStyle;
        var combinedStyle = {
            opacity: isDragging ? 0.5 : 1,
            background: "url("+this.props.imgUrl+") no-repeat 100% 100%",
            cursor: 'move'
        };

        //add passed style
        for (var style in draggableStyle) combinedStyle[style] = draggableStyle[style];

        return connectDragSource(

            <div style={combinedStyle}>
            </div>
        );
    }
});


module.exports = DragSource(ItemTypes.PUZZLE_PIECE, puzzlePieceSource, collect)(DnDPuzzleDraggable);