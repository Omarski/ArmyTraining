/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var CultureQuestInputBlocksView = React.createClass({

    //props: selectedJSON, question, answers

    getInitialState: function() {

        return {
            mediaPath:'data/media/'
        };
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
        this.renderBlocks();
    },

    componentWillUnmount: function() {
    },

    renderBlocks: function(){
        var self = this;
        var question = self.props.question;
        var answers = self.props.answers;
        var selectedJSON = self.props.selectedJSON;

        var answer = selectedJSON["answer"+answers.onQuestion];
        console.log("answer is :" + answer);
    },

    render: function() {

        var self = this;

        return (
           <div></div>
        )
    }
});

module.exports = CultureQuestInputBlocksView;