var React = require('react');
//var Slider = require('react-slick');
var NukaCarousel = require('nuka-carousel');
var PageStore = require('../../../../stores/PageStore');
var PageHeader = require('../../../widgets/PageHeader');
var SettingsStore = require('../../../../stores/SettingsStore');
var ImageCaption = require('../../../widgets/ImageCaption');
var Utils = require('../../../widgets/Utils');
var AppStateStore = require('../../../../stores/AppStateStore');
var LocalizationStore = require('../../../../stores/LocalizationStore');

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
        document.getElementById("audio").onended = (function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
    if(xidArray.length === 0){
        var audio = document.getElementById('audio');
        var source = document.getElementById('mp3Source');
        source.src = "";
        audio.load();
    }
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    //audio.pause();
    //audio.currentTime = 0;
    //source.src = "";
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
    componentDidMount: function() {
        var self = this;
        this.updateMediaAndPlay();
        this.updateSlick();
        AppStateStore.addChangeListener(this._onAppStateChange);

    },
    componentWillUnmount: function() {
        AppStateStore.removeChangeListener(this._onAppStateChange);
    },

    handleClick: function(e){
        var activeIndex = this.state.activePage;
        setTimeout(function () {
            $('.slick-slide').removeClass('slick-active');
            var selected = $('.slick-slide')[activeIndex];
            $(selected).addClass('slick-active');
        });

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

    updateSlick: function() {
        var activeIndex = this.state.activePage;
        setTimeout(function () {
            $('.multi-note-page-btn').removeClass('active');
            var selected = $('.multi-note-page-btn')[activeIndex];
            $(selected).addClass('active');
        });
    },
    componentDidUpdate: function(){
        this.updateMediaAndPlay();
        this.updateSlick();
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
                        var str = Utils.parseBullets(item.text);

                        function createNote() {
                            return {__html: str};
                        }

                        return (<li key={page.xid + String(index) + "li"}>
                                    <div key={page.xid + String(index) + "note"} dangerouslySetInnerHTML={createNote()} className="multi-note-text"></div>
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

            var image = null;

            if(imageURL.split(".")[1] === "mp4"){
                image = (
                    <video autoPlay={SettingsStore.autoPlaySound()}
                           volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}
                           id="video"
                           title={caption}
                           key={index+"video"}
                           aria-label={caption}
                           alt={caption}>
                        <source src={"data/media/"+imageURL} type="video/mp4"></source>
                    </video>
                );
            }else{ // else it should be jpg or png
                image = (
                    <ImageCaption videoType=""
                                  src={"data/media/"+imageURL}
                                  caption={caption}
                                  key={index+"image"}
                                  altText={caption}/>
                );// <img alt={title} key={self.state.xid + String(index)} src={"data/media/"+imageURL} alt={item.title}></img>;

            }

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
            var buttonImage = "";
            // title will be the individual page titles, and caption is that pages image caption
            var sty = {
                "backgroundImage": "url(data/media/"+imageURL+")"
            };

            if(imageURL.split(".")[1] === "mp4"){
                buttonImage = (<span  className="glyphicon thumbnail thumbnail-video multi-note-thumbnail"
                                     alt={title}
                                     aira-hidden="true">
                    <img src="images/icons/playrecordn.png" />
                </span>);
            }else{ // else it should be jpg or png
                buttonImage = (<div  className="thumbnail multi-note-thumbnail"
                                     alt={title}
                                     style={sty}
                                     aira-hidden="true"></div>);
            }

            var thumbnail = (
                <button className="btn btn-default multi-note-page-btn" data={index}
                        onClick={self.handleClick}
                        title={title}
                        alt={title}
                        aria-label={title}
                        key={"multinote-thumb-" + index}>
                    {buttonImage}
                </button>
            );
            return (thumbnail);
        });

        // get active page
        //set image based on active page
        //set text based on active page{pagesHTML}

        //mouse work for mouseover'ed selections


        if (AppStateStore.isMobile()) {
            var sliderSettings = { // settigns for the carousel
                dots: true,
                infinite: false,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                variableWidth: true,
                accessibility: true,
                focusOnSelect: false,
                initialSlide: 0,
                cellAlign: "center"
            };
        } else {
            var sliderSettings = { // settigns for the carousel
                dots: false,
                infinite: false,
                speed: 500,
                slidesToShow: 3,
                slidesToScroll: 1,
                centerMode: false,
                variableWidth: true,
                accessibility: true,
                focusOnSelect: false,
                initialSlide: 0,
                cellAlign: "left"
            };
        }




        var noteImage = "";
        var text = (<div className="col-md-4" key={xid + "activetext"}></div>);

        var p = pagesHTML[self.state.activePage];
        var xid = self.state.xid;
        if(p){
            sourceInfo = p.sources;
        }
        if (p && p.image) {
            var Decorators = null;
            if (pageChoices && pageChoices.length > 3) {
                Decorators = [
                    {
                        component: React.createClass({
                            render: function() {
                                return (
                                    <button
                                        className="btn btn-default multi-note-carousel-btn"
                                        onClick={this.props.previousSlide}
                                        title={LocalizationStore.labelFor("tools", "carPrev")}
                                    >
                                        <span className="glyphicon" aria-hidden="true">
                                            <img src="images/icons/prevn.png"/>
                                        </span>
                                    </button>
                                )
                            }
                        }),
                        position: 'CenterLeft',
                        style: {
                            padding: 20,
                            height: 151,
                            left: -34
                        }
                    },
                    {
                        component: React.createClass({
                            render: function() {
                                return (
                                    <button
                                        className="btn btn-default multi-note-carousel-btn"
                                        onClick={this.props.nextSlide}
                                        title={LocalizationStore.labelFor("tools", "carNext")}
                                    >

                                        <span className="glyphicon" aria-hidden="true">
                                            <img src="images/icons/nextn.png"/>
                                        </span>
                                    </button>
                                )
                            }
                        }),
                        position: 'CenterRight',
                        style: {
                            padding: 20,
                            height: 151,
                            right: -48
                        }
                    }
                ];

            }


            noteImage = (
                <div className="col-md-6 col-sm-6">
                    <div className="container-fluid">
                        <div className="row multi-note-img-row">
                            <div className="multi-note-image" key={xid +"activeimage"}>{p.image}</div>
                        </div>
                        <div className="row">
                            <div className="multi-note-slider-container">

                                <NukaCarousel
                                    decorators={Decorators}
                                    infinite={sliderSettings.infinite}
                                    speed={sliderSettings.speed}
                                    slidesToShow={sliderSettings.slidesToShow}
                                    slidesToScroll={sliderSettings.slidesToScroll}
                                    cellAlign ={sliderSettings.cellAlign}
                                >
                                    {pageChoices}
                                </NukaCarousel>
                            </div>
                        </div>
                    </div>
                </div>
            );

            text = (
                <div className="col-md-6 col-sm-6" key={xid + "activetext"}>
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



        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sourceInfo} title={title} key={page.xid + "source" + sourceInfo}/>
                    <audio id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="multi-note-container">
                        <div className="row">
                            {noteImage}
                            {text}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this.props));
        }
    },
    _onChange: function() {
        this.setState(getPageState(this.props));
    }
});

module.exports = MultiNoteView;