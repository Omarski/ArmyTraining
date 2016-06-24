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

function getUnitState(expanded) {
    var units = UnitStore.getAll();
    var totalUnits = 0;
    var totalUnitsComplete = 0;
    var currentUnitIndex = 0;
    var currentPageIndex = 0;

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
        currentUnitIndex: currentUnitIndex,
        totalUnits: totalUnits,
        currentPageIndex: currentPageIndex,
        totalPages: totalPages,
        unitsPercent: Math.round((totalUnitsComplete / totalUnits) * 100),
        expanded: expanded,
        contentLoaded: LoaderStore.loadingComplete()
    };
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
        LoaderStore.addChangeListener(this._onLoadChange);
        PageStore.addChangeListener(this._onPageChange);
        document.addEventListener("keydown", this.keypress);
    },

    keypress: function(e){
        var event = window.event ? window.event : e;
        if(event.keyCode === 39){ // if right arrow pressed
            this.next();
        }else if(event.keyCode === 37){ // if left arrow pressed
            this.previous();
        }
    },

    componentDidMount: function() {
        $('.collapse').collapse();
    },

    componentWillUnmount: function() {
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

        if(UnitStore.requiredExists()) {
            explorerBtn = (
                <button title={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        alt={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        id="lessonsIndexBtn"
                        type="button"
                        className="btn btn-default btn-lg btn-link btn-text-icon"
                        aria-label={this.state.expanded ? LocalizationStore.labelFor("footer", "tooltipIndexCollapse") : LocalizationStore.labelFor("footer", "tooltipIndexExpand")}
                        onClick={this.toggleTOC}>
                    <span id="lessonsIndexBtnIcon" className={this.state.expanded ? "glyphicon glyphicon-download btn-icon" : "glyphicon glyphicon-upload btn-icon"} aria-hidden="true"></span>{LocalizationStore.labelFor("footer", "lblExplorer")}
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
                                    type="button" onClick={this.previous}
                                    className="btn btn-default btn-lg btn-link btn-step"
                                    aria-label={LocalizationStore.labelFor("footer", "tooltipPrevious")}>
                                <span className="glyphicon glyphicon-circle-arrow-left btn-icon" aria-hidden="true"></span>
                            </button>
                        </td>
                        <td>
                            <button title={LocalizationStore.labelFor("footer", "tooltipNext")}
                                    alt={LocalizationStore.labelFor("footer", "tooltipNext")}
                                    type="button"
                                    onClick={this.next}
                                    className="btn btn-default btn-lg btn-link btn-step"
                                    aria-label={LocalizationStore.labelFor("footer", "tooltipNext")}>
                                <span className="glyphicon glyphicon-circle-arrow-right btn-icon" aria-hidden="true"></span>
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