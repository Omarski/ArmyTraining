var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var title = "";

    var matchSource = "";

    console.dir(props);

    if (props && props.page) {
        title = props.page.title;

        if (props.page.matchSource) {
            var source = props.page.matchSource;

            matchSource = source.map(function(item, index) {
                return (
                    <p key={index}>{item.nut.uttering.utterance.native.text}</p>
                );
            });
        }
    }

    return {
        title: title,
        items: matchSource
    };
}

var DDAudioQuizView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        return (
            <div className="container">
                <h3>{this.state.title}</h3>
                <div>
                    {this.state.items}
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = DDAudioQuizView;