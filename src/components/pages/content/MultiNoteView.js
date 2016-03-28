var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var related = [];
    var xid = "page not found";
    var activePage = 0;

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
        xid = props.page.xid;
        console.dir(props.page);
        if(props.page.related){
            related = props.page.related;
        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType,
        related: related,
        xid: xid,
        activePage: activePage
    };
}

var MultiNoteView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    handleClick: function(e){
        this.setState({
            activePage: $(e.target).attr("data")
        })
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var infoPages = self.state.related;
        var pagesHTML = infoPages.map(function(item, index){
            var imageURL = item.media[0].xid;
            var text = item.note[0].text;
            var title = item.title;
            var image = <img className="MN-activeImage" alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL} alt={item.title}></img>;

            return({
                imageURL: imageURL,
                image: image,
                title: title,
                text: text
            })
        });

        var pageChoices = pagesHTML.map(function(item, index){
            var imageURL = item.imageURL;
            var title = item.title;
            var thumbnail = <img className="MN-thumbnail" data={index} onClick={self.handleClick} alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL}></img>;
            return (thumbnail);
        });

        // get active page
        //set image based on active page
        //set text based on active page{pagesHTML}

        //mouse work for mouseover'ed selections

        return (
            <div className="container">
                <div className="MN-imageContainer">{pagesHTML[self.state.activePage].image} </div>
                <div className="MN-imageText">{pagesHTML[self.state.activePage].text}</div>
                <div className="MN-pageChoices">{pageChoices}</div>
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

module.exports = MultiNoteView;