
var React = require('react');
//using HTML5 backend
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

var DnDPuzzleDraggable = require('./DnDPuzzleDraggable');
var DnDPuzzleDropTarget = require('./DnDPuzzleDropTarget');

var DnDPuzzleView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/'
        };
    },

    propTypes: {
        // id:PropTypes.string.isRequired,
        // imgUrl:PropTypes.string.isRequired,
        // draggableStyle:PropTypes.object.isRequired
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

        return (
            <div></div>
        )
    }
});

module.exports = DragDropContext(HTML5Backend)(DnDPuzzleView);