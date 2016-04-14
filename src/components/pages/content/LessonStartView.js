/**
 * Created by Alec on 4/7/2016.
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        page: "",
        sources: [],
        image: "",
        volume: SettingsStore.voiceVolume()
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

        if(props.page.media){
            data.image = props.page.media[0].xid;
        }

    }

    return data;
}

var LessonStartView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){

    },

    componentWillUnmount: function() {

    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;
        var imageXid = state.image;
        var imageHtml = "";

        if(imageXid !== ""){
            imageHtml = <img src={"data/media/"+imageXid}></img>;
        }


        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <h3>This lesson will take approximately 25 minutes to complete</h3>
                {imageHtml}
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }

    }
});

module.exports = LessonStartView;
