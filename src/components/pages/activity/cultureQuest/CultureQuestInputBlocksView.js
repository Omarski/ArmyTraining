/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var CultureQuestInputBlocksView = React.createClass({
    

    getInitialState: function() {

        return {
        };
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    render: function() {

        var self = this;
        var blockStyle = {'fontSize': '25px', 'width':'40px','marginRight':'15px', 'padding':'5px',
            'border':'5px solid #333333', 'textAlign':'center'};

        return (
           <input type = "text" style = {blockStyle} id={self.props.id} />
        )
    }
});

module.exports = CultureQuestInputBlocksView;