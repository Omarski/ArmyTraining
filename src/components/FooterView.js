var React = require('react');
var CheckIcon = require('../components/widgets/CheckIcon');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');
var PageActions = require('../actions/PageActions');
var PageStore = require('../stores/PageStore');
var NotificationActions = require('../actions/NotificationActions');
var ProgressView = require('../components/ProgressView');
var LocalizationStore = require('../stores/LocalizationStore');


function getUnitState(expanded) {
    var units = UnitStore.getAll();
    var data = [];
    var totalUnits = 0;
    var totalUnitsComplete = 0;
    var currentUnitIndex = 0;
    var currentPageIndex = 0;

    var requiredUnits = [];
    var optionalUnits = [];

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

            var unitCls = '';
            var expandCollapseIconCls = 'footer-expand-collapse-btn glyphicon';
            var unitExpandedCls = ' panel-collapse collapse ';
            if (PageStore.unit() && PageStore.unit().data.xid === unit.data.xid) {
                currentUnitIndex = totalUnits;
                unitCls = 'main-footer-accordian-table-row-active';
                unitExpandedCls += ' in';
                expandCollapseIconCls += ' glyphicon-minus-sign';
            } else {
                expandCollapseIconCls += ' glyphicon-plus-sign';
            }

            // increase unit completed count
            if (unitCompleted) {
                totalUnitsComplete++;
            }

            var obj = {
                unitExpandedCls: unitExpandedCls,
                expandCollapseIconCls: expandCollapseIconCls,
                unitCls: unitCls,
                unit: unit,
                completed: unitCompleted,
                title: unit.data.title,
                percent: Math.round((completedCount / totalPages) * 100),
                rows: chapters
            };

            if(unit.state.required) {
                requiredUnits.push(obj);
            } else {
                optionalUnits.push(obj);
            }
        }
    }


    return {
        requiredUnits: requiredUnits,
        optionalUnits: optionalUnits,
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
    panelHeaderClick: function(index, idStr) {

        var btn = $('#heading' + idStr + index).find('.footer-expand-collapse-btn');
        if (btn.hasClass('glyphicon-plus-sign')) {
            btn.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
            $('#collapse' + idStr + index).collapse('show');
        } else {
            btn.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
            $('#collapse' + idStr + index).collapse('hide');
        }
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

        window.location.hash = "#" + PageStore.chapter().title + PageStore.page().title;
        this.setState(getUnitState(!this.state.expanded));
    },

    /*
     <table className="panel-title table table-condensed main-footer-accordian-table" onClick={self.panelHeaderClick.bind(self, index)}>
     <tr className={item.unitCls}>
     <td>
     <div className="main-footer-table-icon-col">
     <CheckIcon checked={item.completed} />
     </div>
     </td>
     <td>
     <div className="main-footer-table-icon-col">
     <a role="button" data-toggle="collapse" data-parent={'#accordion' + index} href={'#collapse' + index} aria-expanded="true" aria-controls={'collapse' + index}>
     <span className={item.expandCollapseIconCls} aria-hidden="true"></span>
     </a>
     </div>
     </td>
     <td>
     <h4>{item.title}</h4>
     </td>
     <td width="100%">
     <div className="dots">&nbsp;</div>
     </td>
     <td width="55">
     <h4>{item.completed ? "Complete" : ""}</h4>
     </td>
     <td>
     <div className="main-footer-table-icon-col">
     <h4>{item.percent}%</h4>
     </div>
     </td>
     </tr>
     </table>

     <ul className="list-group">
     <li className="list-group-item" >
     <span className="badge">14</span>

     </li>
     </ul>



     */

    explorerItems: function(items, idStr) {
        var self = this;
        var html = (<div></div>);
        if (items) {
            html = items.map(function(item, index) {
                return (
                    <div className="panel-group main-footer-accordian" id={'accordion' +idStr + index} role="tablist" aria-multiselectable="true" key={index}>
                        <div className="panel panel-default">
                            <div className="panel-heading" role="tab" id={'heading' + idStr + index} onClick={self.panelHeaderClick.bind(self, index, idStr)}>
                                <a role="button" data-toggle="collapse" data-parent={'#accordion' + idStr + index} href={'#collapse' + idStr + index} aria-expanded="true" aria-controls={'collapse' + idStr + index}>
                                    <span className={item.expandCollapseIconCls} aria-hidden="true"></span>
                                </a>
                                {item.title}
                            </div>
                            <div id={'collapse' + idStr + index} className={item.unitExpandedCls} role="tabpanel" aria-labelledby={'heading' + idStr + index}>
                                <div className="panel-body main-footer-panel-body">
                                    <TOCDetails data={item.rows} unit={item.unit}/>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            });
        }
        return html;

    },

    render: function() {
        var result = (<div></div>);
        var self = this;
        var explorerBtn = (<span></span>);
        var progressView = (<span></span>);
        var explorerView = (<span></span>);
        var requiredItems = [];
        var optionalItems = [];

        if (!this.state.requiredUnits) {
            return (<div></div>);
        }

        if(UnitStore.requiredExists()) {
            explorerBtn = (
                <button title={"Index"} alt={"Table of Contents"} id="lessonsIndexBtn" type="button" className="btn btn-default btn-lg btn-link btn-text-icon" aria-label="Table of contents" onClick={this.toggleTOC}>
                    <span id="lessonsIndexBtnIcon" className={this.state.expanded ? "glyphicon glyphicon-download btn-icon" : "glyphicon glyphicon-upload btn-icon"} aria-hidden="true"></span>{LocalizationStore.labelFor("footer", "lblExplorer")}
                </button>
            );
            progressView = (
                <ProgressView />
            );

            requiredItems = this.explorerItems(this.state.requiredUnits, 'required');
            optionalItems = this.explorerItems(this.state.optionalUnits, 'optional');
            explorerView = (
                <div className={this.state.expanded ? "main-footer-tab-container-expanded" : "main-footer-tab-container"}>
                    <ul className="nav nav-tabs nav-justified main-footer-tab" role="tablist">
                        <li role="presentation" className="active"><a href="#mainFooterLessonsTab" aria-controls="mainFooterLessonsTab" role="tab" data-toggle="tab">{LocalizationStore.labelFor("footer", "lblRequired")}</a></li>
                        <li role="presentation"><a href="#mainFooterCoursesTab" aria-controls="mainFooterCoursesTab" role="tab" data-toggle="tab">{LocalizationStore.labelFor("footer", "lblOptional")}</a></li>
                    </ul>
                    <div className="tab-content main-footer-tab-content">
                        <div role="tabpanel" className="tab-pane active main-footer-tab-pane" id="mainFooterLessonsTab">
                            {requiredItems}
                        </div>
                        <div role="tabpanel" className="tab-pane main-footer-tab-pane" id="mainFooterCoursesTab">
                            {optionalItems}
                        </div>
                    </div>
                </div>
            );
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
                            <button title={"Previous"} alt={"Previous Page"} type="button" onClick={this.previous} className="btn btn-default btn-lg btn-link btn-step button-left-mobile-padding" aria-label="Previous Page">
                                <span className="glyphicon glyphicon-circle-arrow-left btn-icon" aria-hidden="true"></span>
                            </button>
                        </td>
                        <td>
                            <button title={"Next"} alt={"Next Page"} type="button" onClick={this.next} className="btn btn-default btn-lg btn-link btn-step button-right-mobile-padding" aria-label="Next Page">
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

var TOCDetails = React.createClass({

    render: function() {
        var unit = this.props.unit;
        var items = this.props.data.map(function(item, index) {
            return (
            <ul key={index} className="list-group main-footer-list-group">
                <TOCChapterRow item={item} chapter={item} unit={unit}/>
                <TOCPages data={item.data.pages} chapter={item} unit={unit}/>
            </ul>
            );
        });

        return (
            <div>{items}</div>
        );

    }
});

var TOCChapterRow = React.createClass({
    loadPage: function(item, chapter, unit) {
        PageActions.jump({page:item.xid, chapter:chapter.data.xid, unit:unit.id});

    },
    render: function() {
        var cls = '';
        if (PageStore.chapter() && this.props.item.data.xid === PageStore.chapter().xid) {
            cls += ' main-footer-accordian-table-row-active';
        }
        /*
         <span>{this.props.item.completed ? "Complete" : ""}</span>
         <span>{this.props.item.percent}%</span>
         <span className="badge">
         <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>
         </span>
         <CheckIcon completed={this.props.item.completed} />
         */
        return (
        <li className="list-group-item main-footer-chapter-row" onClick={this.loadPage.bind(this, this.props.item.data.pages[0], this.props.chapter, this.props.unit)}>
            {this.props.item.title}
        </li>
        );
    }
});

var TOCPages = React.createClass({

    render: function() {
        if (!this.props.data) {
            return (<div></div>);
        }

        var chapter = this.props.chapter;
        var unit = this.props.unit;

        // TODO clean up hack
        var firstQuizPage = false;
        // TODO end clean up hack

        var items = this.props.data.map(function(item, index) {
            // hide all but the first quiz page
            if (item.state && item.state.quizpage) {
                if (firstQuizPage) {
                    return;
                } else {
                    firstQuizPage = true;
                }
            }
            return (
                <TOCPageRow item={item} key={index} chapter={chapter} unit={unit} />
            );
        });

        return (
            <div>{items}</div>
        );

    }
});

var TOCPageRow = React.createClass({
    loadPage: function(item, chapter, unit) {
        PageActions.jump({page:item.xid, chapter:chapter.data.xid, unit:unit.id});

    },
    render: function() {
        var cls = 'main-footer-page-row';
        if (PageStore.page() && this.props.item.xid === PageStore.page().xid) {
            cls += ' main-footer-page-row-active';
        } else {
            if (this.props.item.state && this.props.item.state.visited) {
                cls += ' main-footer-page-row-visited';
            }
        }

        return (
            <li className="list-group-item main-footer-page-row" onClick={this.loadPage.bind(this, this.props.item, this.props.chapter, this.props.unit)}>
                <span className="badge">
                    <span className="glyphicon glyphicon-star" aria-hidden="true"></span>
                </span>
                {this.props.item.title}
            </li>

        );
    }
});

module.exports = FooterView;