var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var data = {
        title: "",
        pageType: ""
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
    }

    return data;
}

var OrderingView = React.createClass({
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
                <h3>{this.state.title} : {this.state.pageType}</h3>
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

module.exports = OrderingView;