var React = require('react');
var Slider = require('react-slick');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var SettingsStore = require('../../../stores/SettingsStore');
var ImageCaption = require('../../widgets/ImageCaption');

function getPageState(props) {
    var data = {
        page: "",
        title: "",
        note: "",
        media: "",
        pageType: "",
        related: [],
        xid: "page not found",
        activePage: 0,
        volume: SettingsStore.voiceVolume()
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.xid = props.page.xid;
        if(props.page.related){
            // if there is a "related" object in the json
            data.related = props.page.related;
        }
    }

    return data;
}

function playMediaAudio(xidArray){
    //xid is of the form "000000000.mp3"
    if(xidArray.length > 0){
        $("#audio").bind('ended', function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid;
    audio.load();
    audio.play();
    audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
}

var MultiNoteView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    handleClick: function(e){
        this.setState({
            activePage: $(e.target).attr("data")
        })
    },

    updateMediaAndPlay: function() {
        //play audio recording for active info page
        var self = this;
        var related = self.state.related;
        var activePageIndex = self.state.activePage;
        var pageMediaArray = []; // make a pageMediaArray
        if (related[activePageIndex] && related[activePageIndex].note) {
            related[activePageIndex].note.map(function (itemNote, indexNote) {
                // for each "note" json object the "related" json object has
                if (itemNote.media) {
                    // if that note has a "media" json object
                    pageMediaArray.push(itemNote.media[0].xid); // add it's xid to that page's pageMediaArray
                }
            });
        }

        // play all note media in order
        playMediaAudio(pageMediaArray);
    },

    componentDidMount: function() {
        this.updateMediaAndPlay();
    },

    componentDidUpdate: function(){
        this.updateMediaAndPlay();
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sourceInfo = "";
        var infoPages = self.state.related;

        var pagesHTML = infoPages.map(function(item, index){
            var imageURL = item.media[0].xid;
            var sources = "";
            var text = ""; //item.note[0].text; // needs to be changed to all notes
            if (item.note) {
                var notes = item.note;
                if(notes && notes.length){
                    text = notes.map(function(item, index) {
                        var hasBullet = (item.text.indexOf('-') === 0);

                        var str = item.text;
                        if (hasBullet) {
                            var arr = str.split('- ');
                            var len = arr.length;
                            var result = "";
                            for ( var i = 1; i < len; i++) {
                                if(i !== 1){
                                    result += '<p><span class="info-view-bullet-item"></span>' + arr[i] + '</p>';
                                }else{
                                    result += '<p>' + arr[i] + '</p>';
                                }
                            }
                            str = result;


                        }

                        function createNote() {
                            return {__html: str};
                        }

                        return (<li key={page.xid + String(index) + "li"}>
                                    <p key={page.xid + String(index) + "note"} dangerouslySetInnerHTML={createNote()} className="multi-note-text"></p>
                        </li>);
                    });
                }
            }

            var title = item.title;
            var caption = "";

            var info = item.info;
            if (info) {
                var properties = info.property;
                if (properties) {
                    var len = properties.length;
                    while (len--) {
                        var property = properties[len];
                        switch (property.name) {
                            case "mediacaption" :
                                sources = property.value;
                                break;
                            case "mediadisplayblurb" :
                                caption = property.value;
                                break;
                        }
                    };
                }
            }



            var image = (
                <ImageCaption videoType="" src={"data/media/"+imageURL} caption={caption} key={index} altText={caption}/>
            );// <img alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL} alt={item.title}></img>;


            return({
                imageURL: imageURL,
                image: image,
                title: title,
                text: text,
                sources: sources,
                caption: caption
            })
        });

        var pageChoices = pagesHTML.map(function(item, index){
            var imageURL = item.imageURL;
            var title = item.title;
            var caption = item.caption;
            // title will be the individual page titles, and caption is that pages image caption
            var thumbnail = (
                <button className="btn btn-default" data={index}
                        onClick={self.handleClick}
                        title={title}
                        alt={title}
                        aria-label={title}
                        key={"multinote-thumb-" + index}>
                    <img  className="thumbnail multi-note-thumbnail"
                          alt={title}
                          src={"data/media/"+imageURL}
                          aira-hidden="true"></img>
                </button>
            );
            return (thumbnail);
        });

        // get active page
        //set image based on active page
        //set text based on active page{pagesHTML}

        //mouse work for mouseover'ed selections

        var noteImage = "";
        var text = (<div className="col-md-4" key={xid + "activetext"}></div>);


        var p = pagesHTML[self.state.activePage];
        var xid = self.state.xid;
        if(p){
            sourceInfo = p.sources;
        }
        if (p && p.image) {
            noteImage = (
                <div className="col-md-6">
                    <div className="multi-note-image" key={xid +"activeimage"}>{p.image}</div>
                </div>
            );

            text = (
                <div className="col-md-6" key={xid + "activetext"}>
                    {p.text}
                </div>
            );
        } else if(p && p.text) {
            text = (
                <div className="multi-note-text" key={xid + "activetext"}>
                    {p.text}
                </div>
            );
        }

        var sliderSettings = { // settigns for the carousel
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: false,
            variableWidth: true
        };

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sourceInfo} title={title} key={page.xid + "source" + sourceInfo}/>
                    <audio id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="container">
                        <div className="row">
                            {noteImage}
                            {text}
                        </div>
                        <div className="row">
                            <div className="container">

                                <Slider
                                    dots={sliderSettings.dots}
                                    infinite={sliderSettings.infinite}
                                    speed={sliderSettings.speed}
                                    slidesToShow={sliderSettings.slidesToShow}
                                    slidesToScroll={sliderSettings.slidesToScroll}
                                    centerMode={sliderSettings.centerMode}
                                    variableWidth={sliderSettings.variableWidth}
                                >
                                    {pageChoices}
                                </Slider>
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
        //this.setState(getPageState());
    }
});

module.exports = MultiNoteView;