var React = require('react');
var CheckIcon = require('../components/widgets/CheckIcon');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');
var LocalizationStore = require('../stores/LocalizationStore');
var PageActions = require('../actions/PageActions');
var PageStore = require('../stores/PageStore');
var NotificationActions = require('../actions/NotificationActions');
var ProgressView = require('../components/ProgressView');
var ExplorerView = require('../components/ExplorerView');
var ExplorerActions = require('../actions/ExplorerActions');
var Utils = require('../components/widgets/Utils');
var InfoTagConstants = require('../constants/InfoTagConstants');
var FooterStore = require('../stores/FooterStore');

function getUnitState(expanded) {
    var units = UnitStore.getAll();
    var totalUnits = 0;
    var totalUnitsComplete = 0;
    var currentPageIndex = 0;
    var currentUnitTotalPages = 1;

    for (var key in units) {
        totalUnits++;
        var unit = units[key];
        var chapters = [];
        var unitCompleted = true;
        var completedCount = 0;
        var totalPages = 0;



        if (unit.data.chapter) {
            for (var i = 0; i < unit.data.chapter.length; i++) {
                var bHidden = false;

                var c = unit.data.chapter[i];
                
                if (PageStore.unit() && PageStore.unit().data.xid === unit.data.xid) {
                    currentUnitTotalPages += c.pages.length;
                    for( var j = 0; j < c.pages.length; j++) {
                        var page = c.pages[j];
                        if (PageStore.page() && PageStore.page().xid === page.xid) {
                            currentPageIndex = j + 1;
                        }
                    }
                }

                // look up properties
                if (c.info && c.info.property) {
                    c.info.property.map(function(item) {
                        switch (item.name) {
                            case "prologue":
                                bHidden = true;
                                break;
                            default:
                                break;
                        }
                    })
                }

                // stop if hidden
                if (bHidden)
                    break;

                // check pages to see if everything has been
                // viewed in the chapter to determine unit
                // complete state
                var chapterCompleted = false;
                var pages = c.pages;
                var pagesLen = pages.length;
                var tcpCompleted = 0;
                var tcpTotal = pages.length;

                // check if chapter has been marked complete
                // if just one is not then mark the whole unit as incomplete
                if (c.state && c.state.complete) {
                    chapterCompleted = true;
                } else {
                    unitCompleted = false
                }

                while (pagesLen--) {
                    totalPages++;
                    var page = pages[pagesLen];
                    if (!page.state || !page.state.visited) {
                        //completed = false;
                    } else {
                        completedCount++;
                        tcpCompleted++;
                    }
                }

                chapters.push({
                    completed: chapterCompleted,
                    title: c.title,
                    percent: Math.round((tcpCompleted / tcpTotal) * 100),
                    data: c
                });


            }

            // skip if marked as hidden
            if (bHidden)
                continue;

            // increase unit completed count
            if (unitCompleted) {
                totalUnitsComplete++;
            }

            var obj = {
                unit: unit,
                completed: unitCompleted,
                title: unit.data.title,
                percent: Math.round((completedCount / totalPages) * 100),
                rows: chapters
            };
        }
    }

    return {
        totalUnits: totalUnits,
        currentPageIndex: currentPageIndex,
        currentUnitTotalPages: currentUnitTotalPages,
        totalPages: totalPages,
        unitsPercent: Math.round((totalUnitsComplete / totalUnits) * 100),
        expanded: expanded,
        contentLoaded: LoaderStore.loadingComplete(),
        nextDisabled: FooterStore.isNextDisabled(),
        prevDisabled: FooterStore.isPrevDisabled()
    };
}

function showExplorerButton() {
    // get current chapter
    var currentChapter = PageStore.chapter();
    if (currentChapter !== null) {
        // hide if current chapter is marked as one of the following

        if ((Utils.findInfo(currentChapter.info, InfoTagConstants.INFO_PROP_PROLOGUE) !== null) ||
            (Utils.findInfo(currentChapter.info, InfoTagConstants.INFO_PROP_PRETEST) !== null)) {
            return false;
        }
    }

    return true;
}

var FooterView = React.createClass({
    next: function() {
        PageActions.loadNext({});
    },
    previous: function() {
        PageActions.loadPrevious({});
    },
    _onLoadChange: function() {
        if (this.isMounted()) {
            this.setState(getUnitState(false));
        }
    },

    _onPageChange: function() {
        if (this.isMounted()) {
            this.setState(getUnitState(false));
        }
    },

    getInitialState: function() {
        return {data: [], expanded:false};
    },

    componentWillMount: function() {
        FooterStore.addChangeListener(this._onLoadChange);
        LoaderStore.addChangeListener(this._onLoadChange);
        PageStore.addChangeListener(this._onPageChange);
        document.addEventListener("keydown", this.keypress);
    },

    keypress: function(e){
        var event = window.event ? window.event : e;
        if(event.keyCode === 39){ // if right arrow pressed
            if (!FooterStore.isNextDisabled()) {
                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                this.next();
            }
        }else if(event.keyCode === 37){ // if left arrow pressed
            if (!FooterStore.isPrevDisabled()) {
                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                this.previous();
            }
        }
    },

    componentDidMount: function() {
        $('.collapse').collapse();

    },

    componentWillUnmount: function() {
        FooterStore.removeChangeListener(this._onLoadChange);
        LoaderStore.removeChangeListener(this._onLoadChange);
        PageStore.removeChangeListener(this._onPageChange);
    },

    toggleTOC: function(event) {
        // pause videos before opening TOC
        var video = document.getElementById("video");
        var audio = document.getElementById("audio");
        if(video){
            if(!this.state.expanded){
                video.pause();
            }else{
                if(!video.ended){
                    video.play();
                }
            }
        }
        if(audio){
            if(!this.state.expanded){
                audio.pause();
            }else{
                if(audio.ended) {
                    audio.play();
                }
            }
        }

        if (this.state.expanded) {
            ExplorerActions.hide();
        } else {
            ExplorerActions.show();
        }

        window.location.hash = "#" + PageStore.chapter().title + PageStore.page().title;
        this.setState(getUnitState(!this.state.expanded));
    },

    render: function() {
        var explorerBtn = (<span></span>);
        var progressView = (<span></span>);
        var explorerView = (<span></span>);
        var explorerIcon = this.state.expanded ? (<img src="images/icons/explorerdwnn.png"/>) : (<img src="images/icons/explorerupn.png"/>);
        
        if(showExplorerButton()) {
            explorerBtn = (
                <button title={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        alt={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        id="lessonsIndexBtn"
                        type="button"
                        className="btn btn-default btn-lg btn-link btn-text-icon btn-clk"
                        aria-label={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        onClick={this.toggleTOC}>
                    <div className="explorer-icon-text-div">
                        {explorerIcon}
                        <span className="explorer-link explorer-icon-text-span ">{LocalizationStore.labelFor("footer", "lblExplorer")}</span>
                    </div>
                </button>
            );
            progressView = (
                <ProgressView />
            );


            explorerView = (<ExplorerView expanded={this.state.expanded}/>);

        }

        var footerElements = "";
        if (this.state.contentLoaded) {
            footerElements = (
                <table className="table footer-table">
                    <tbody>
                    <tr>
                        <td>
                            {explorerBtn}
                        </td>
                        <td width="100%">
                            {progressView}
                        </td>
                        <td>
                            <button title={LocalizationStore.labelFor("footer", "tooltipPrevious")}
                                    alt={LocalizationStore.labelFor("footer", "tooltipPrevious")}
                                    disabled={this.state.prevDisabled}
                                    type="button" onClick={this.previous}
                                    className="btn btn-default btn-lg btn-link btn-step btn-nxt"
                                    aria-label={LocalizationStore.labelFor("footer", "tooltipPrevious")}>
                                <img src="images/icons/prevn.png"/>
                            </button>
                        </td>
                        <td className="footer-page-state">
                            {this.state.currentPageIndex}/{this.state.currentUnitTotalPages}
                        </td>
                        <td>
                            <button title={LocalizationStore.labelFor("footer", "tooltipNext")}
                                    alt={LocalizationStore.labelFor("footer", "tooltipNext")}
                                    disabled={this.state.nextDisabled}
                                    type="button"
                                    onClick={this.next}
                                    className="btn btn-default btn-lg btn-link btn-step btn-nxt"
                                    aria-label={LocalizationStore.labelFor("footer", "tooltipNext")}>
                                <img src="images/icons/nextn.png"/>
                            </button>

                            <button title={LocalizationStore.labelFor("footer", "tooltipClose")}
                                    alt={LocalizationStore.labelFor("footer", "tooltipClose")}
                                    type="button"
                                    onClick={this.toggleTOC}
                                    className="btn btn-default btn-lg btn-link btn-close btn-exp"
                                    aria-label={LocalizationStore.labelFor("footer", "tooltipClose")}>
                                    <img src="images/icons/explorerclosen.png"/>
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        result = (
            <footer className={this.state.expanded ? "footer main-footer expanded" : "footer main-footer"}>
                <div className="container-fluid footer-nav">
                    <div id="mainFooterPageNav" className="row main-footer-page-nav">
                        <div className={this.state.expanded ? "container-fluid main-footer-page-nav-buttons-expanded" : "container-fluid"}>
                            <div className="row main-footer-page-nav-row">
                                {footerElements}
                            </div>
                        </div>
                        {explorerView}
                    </div>
                </div>
            </footer>
        );
        return result;
    }
});

module.exports = FooterView;