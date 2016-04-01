var React = require('react');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var SettingsStore = require('../../../stores/SettingsStore');

function getPageState(props) {
    var data = {
        page: "",
        sources: [],
        title: "",
        note: "",
        media: "",
        pageType: "",
        related: [],
        xid: "page not found",
        activePage: 0,
        volume: SettingsStore.voiceVolume(),
        pagesMedia: []
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.xid = props.page.xid;
        console.dir(props.page);
        if(props.page.related){
            data.related = props.page.related;
            data.related.map(function(item, index){
                var pageMediaArray = [];
                item.note.map(function(itemNote, indexNote){
                    if(itemNote.media){
                        //assuming multinote will mimic info page and
                        // the audio recording of the note will be associated
                        // with said note
                        pageMediaArray.push(itemNote.media.xid);
                    }
                });
                // pageMediaArray should be a list of the media xid for the page
                data.pagesMedia.push(pageMediaArray);
                // and pagesMedia should be a list of pageMediaArrays
            });
        }
    }

    return data;
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

    componentDidUpdate: function(){
        //play audio recording for active info page
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var infoPages = self.state.related;
        var pagesHTML = infoPages.map(function(item, index){
            var imageURL = item.media[0].xid;
            var text = item.note[0].text;
            var title = item.title;
            var image = <img alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL} alt={item.title}></img>;
            var caption = "";
            var sources = [];
            var info = item.info;
            var properties = info.property;
            if (properties) {
                var len = properties.length;
                while (len--) {
                    var property = properties[len];
                    switch (property.name) {
                        case "mediadisplayblurb" :
                            sources.push(property.value);
                            break;
                        case "mediacaption" :
                            caption = property.value;
                            break;
                    }
                };
            }

            return({
                imageURL: imageURL,
                image: image,
                title: title,
                text: text,
                caption: caption
            })
        });

        var pageChoices = pagesHTML.map(function(item, index){
            var imageURL = item.imageURL;
            var title = item.title;
            var thumbnail = <li><img className="thumbnail multi-note-thumbnail" data={index} onClick={self.handleClick} alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL}></img></li>;
            return (thumbnail);
        });

        // get active page
        //set image based on active page
        //set text based on active page{pagesHTML}

        //mouse work for mouseover'ed selections

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <audio id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="multi-note-image">{pagesHTML[self.state.activePage].image}</div>
                                <div className="multi-note-caption"><h5>{pagesHTML[self.state.activePage].caption}</h5></div>
                            </div>
                            <div className="col-md-4">
                                <div className="multi-note-text"><p>{pagesHTML[self.state.activePage].text}</p></div>
                            </div>

                        </div>
                        <div className="row">
                            <ul className="multi-note-choices">{pageChoices}</ul>
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

module.exports = MultiNoteView;