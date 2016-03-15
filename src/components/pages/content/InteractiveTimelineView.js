var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var json = "";
    var dateList = [];

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
        // TODO: Change 'TimelineData' to whatever the real name will be
        if(props.page.timelineData){
            json = props.page.timelineData;

            json.nodes.map(function(item, index){
                dateList.push(item.title);
            });
        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType,
        timelineJSON: json,
        selectedDate: dateList[0],
        dateList: dateList
    };
}

var InteractiveTimelineView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    handleClick: function(e){
        console.dir(e.target.id);
        this.setState({selectedDate: e.target.id});
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var image = "";
        var description = "";

        //image in center
        image = getImage(self.state.selectedDate, self.state.timelineJSON.nodes);
        description = getDescription(self.state.selectedDate, self.state.timelineJSON.nodes);
        // dates along the bottom are selectable
        var dates = this.state.timelineJSON.nodes.map(function(item, index){
            return (<div id={item.title} className="timelineDate" key={page.xid + String(index)} onClick={self.handleClick}>
                {item.year}</div>);
        });


        return (
            <div className="container">
                <div className="timelineImageContainer">
                    {image}
                    {description}
                </div>
                <div className="timelineContainer">
                    {dates}
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

function getImage(selectedDateString, nodeList){
    for(var i=0;i<nodeList.length;i++){
        if(selectedDateString == nodeList[i].title){
            return(<img src={'data/media/'+ nodeList[i].file + '.jpg'} alt={nodeList[i].attribution}></img>);
        }
    }
}

function getDescription(selectedDateString, nodeList){
    for(var i=0;i<nodeList.length;i++){
        if(selectedDateString == nodeList[i].title){
            return(<div className="timelineImageDescription"><b>{nodeList[i].year + ": "}</b>{nodeList[i].desc}</div>);
        }
    }
}

module.exports = InteractiveTimelineView;