/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var CultureQuestInputBlocksView = React.createClass({
    

    getInitialState: function() {

        return {
        };
    },

    render: function() {

        var self = this;
        var blockStyle = {'fontSize': '20px', 'width':'30px','marginRight':'5px', 'padding':'2px',
            'border':'3px solid #333333', 'textAlign':'center', textTransform:'uppercase'};

        return (
           <input className = "culture-quest-quiz-input-blocks" type = "text" style = {blockStyle} id={self.props.id}/>
        )
    }
});

module.exports = CultureQuestInputBlocksView;