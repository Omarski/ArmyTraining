var React = require('react');
var DragSource = require('react-dnd').DragSource;
var ItemTypes  = require('./Constants').ItemTypes;
var PropTypes  = React.PropTypes;

//draggable contract:
var puzzlePieceSource = {
    beginDrag: function (props) {
        // Return the data describing the dragged item
        console.log("Dragging....");
        props.onDraggableDrag({id: props.id});
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
        imgUrl:PropTypes.string,
        draggableStyle:PropTypes.object.isRequired,
        onDraggableDrag:PropTypes.func.isRequired
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

        var id = this.props.id;
        var connectDragSource = this.props.connectDragSource;
        var isDragging = this.props.isDragging;
        var draggableStyle = this.props.draggableStyle;
        var combinedStyle = {
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move'
        };

        if (this.props.imgUrl) combinedStyle['background'] = "url("+this.props.imgUrl+") no-repeat 100% 100%";

        //add passed style
        for (var style in draggableStyle) combinedStyle[style] = draggableStyle[style];

        return connectDragSource(

            <div id={id} style={combinedStyle}>
            </div>
        );
    }
});


module.exports = DragSource(ItemTypes.PUZZLE_PIECE, puzzlePieceSource, collect)(DnDPuzzleDraggable);