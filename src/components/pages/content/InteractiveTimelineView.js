var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var json = "";
    var dateList = [];
    var page = null;

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
        page = props.page;
        // TODO: Change 'TimelineData' to whatever the real name will be
        if(props.page.timelineData){
            json = props.page.timelineData;

            json.nodes.map(function(item, index){
                dateList.push(item.title);
            });
        }
        if(props.page.info){
            if(props.page.info.property){
                props.page.info.property.map(function(item) {
                    if(item.name === "builtTimeline"){
                        json = JSON.parse(item.value);
                        json.nodes.map(function(item, index){
                            dateList.push(item.title);
                        });
                    }
                });
            }
        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType,
        timelineJSON: json,
        selectedDate: dateList[0],
        dateList: dateList,
        page: page,
        sources: []
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
        this.setState({selectedDate: e.target.id});
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = page.title;
        var sources = self.state.sources;
        var image = "";
        var description = "";

        //image in center
        image = getImage(self.state.selectedDate, self.state.timelineJSON.nodes);
        description = getDescription(self.state.selectedDate, self.state.timelineJSON.nodes);

        var row1 = [];
        var row2 = [];
        var nodes = this.state.timelineJSON.nodes;
        var len = nodes.length;
        for (var i = 0; i < len; i++) {
            var node = nodes[i];
            if (i % 2) {
                row2.push(node);
            } else {
                row1.push(node);
            }
        }

        // dates along the bottom are selectable
        var datesRow1 = row1.map(function(item, index){
            var selected = (item.title === self.state.selectedDate) ? "selected" : "";
            var cls = "timeline-date top-row " + selected;
            return (
                    <div id={item.title} className={cls} key={page.xid + String(index)} onClick={self.handleClick}>
                    {item.year}
                    </div>
                );
        });
        var datesRow2 = row2.map(function(item, index){
            var selected = (item.title === self.state.selectedDate) ? "selected" : "";
            var cls = "timeline-date bottom-row " + selected;
            return (<div id={item.title} className={cls} key={page.xid + String(index)} onClick={self.handleClick}>
                {item.year}</div>);
        });


        return (
            <div className="absolute-full">
                <div className="absolute-full" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="absolute-full">

                            <div className="timeline-image-container thumbnail">
                                {image}
                                <div className="alert timeline-img-text">
                                    {description}
                                </div>
                            </div>


                            <div className="timeline-container well">
                                <div className="container">
                                    <div className="row timeline-date-row first">
                                        {datesRow1}
                                    </div>
                                    <div className="row timeline-date-row last">
                                        <div className="timeline-date bottom-row spacer" >&nbsp;</div>
                                        {datesRow2}
                                    </div>
                                </div>

                            </div>

                    </div>
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
            return(<span><b>{nodeList[i].year + ": "}</b>{nodeList[i].desc}</span>);
        }
    }
}

module.exports = InteractiveTimelineView;