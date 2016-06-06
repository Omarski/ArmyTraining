/**
 * Created by Alec on 6/2/2016.
 */
var React = require('react');


function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        interlocutor: {
            name: "",
            zid: 0,
            nom: ""
        },
        media: [],
        prompt: "",
        question: {},
        answer: []
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.type
    }

    return data;
}

var MiniCoachedConversationView = React.createClass({
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
        // left half is image
        // right half is question prompt, and start(play) button
        // after listening multiple choice appears
        var image = "";

        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <div className="minicon-image-container">
                        {image}
                    </div>
                    <div className="minicon-question-container"></div>
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

module.exports = MiniCoachedConversationView;