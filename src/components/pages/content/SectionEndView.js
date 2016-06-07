var PageHeader = require('../../widgets/PageHeader');
var PageStore = require('../../../stores/PageStore');
var React = require('react');


function getPageState(props) {
    var data = {
        page: "",
        pageType: "",
        title: ""
    }

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    return data;
}


var SectionEndView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;

        return (
            <PageHeader sources={state.sources} title={title} key={state.page.xid}/>
        );
    },

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    }
})

module.exports = SectionEndView;