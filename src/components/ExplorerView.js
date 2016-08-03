var React = require('react');
var CheckIcon = require('../components/widgets/CheckIcon');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');
var LocalizationStore = require('../stores/LocalizationStore');
var PageActions = require('../actions/PageActions');
var PageStore = require('../stores/PageStore');
var NotificationActions = require('../actions/NotificationActions');
var ProgressView = require('../components/ProgressView');
var ExplorerStore = require('../stores/ExplorerStore');
var InfoTagConstants = require('../constants/InfoTagConstants');
var PageTypeConstants = require('../constants/PageTypeConstants');

var _expanded = {};
var _expandedChapters = {};
var _fromHeaderAction = false;

function getUnitState(expanded) {
    var units = UnitStore.getAll();
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
                            case InfoTagConstants.INFO_PROP_PROLOGUE:
                            case InfoTagConstants.INFO_PROP_PRETEST:
                            case InfoTagConstants.INFO_PROP_POSTTEST:
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


                    if (PageStore.page() && page.xid === PageStore.page().xid && !_fromHeaderAction) {
                        _expandedChapters[c.xid] = true;
                    }
                }

                var expandCollapseIconCls = 'footer-expand-collapse-btn glyphicon';
                var ex = (_expandedChapters[c.xid]) ? _expandedChapters[c.xid] : false;
                if (ex) {
                    expandCollapseIconCls += ' glyphicon-minus-sign';
                } else {
                    expandCollapseIconCls += ' glyphicon-plus-sign';
                }
                chapters.push({
                    expandCollapseIconCls: expandCollapseIconCls,
                    expanded: ex,
                    completed: chapterCompleted,
                    title: c.title,
                    percent: Math.round((tcpCompleted / tcpTotal) * 100),
                    data: c,
                    id: c.xid
                });


            }

            // skip if marked as hidden
            if (bHidden)
                continue;

            var unitCls = '';
            var expandCollapseIconCls = 'footer-expand-collapse-btn glyphicon';
            var unitExpandedCls = ' panel-collapse collapse ';
            if (PageStore.unit() && PageStore.unit().data.xid === unit.data.xid && !_fromHeaderAction) {
                currentUnitIndex = totalUnits;
                unitCls = 'main-footer-accordian-table-row-active';
                unitExpandedCls += ' in';
                expandCollapseIconCls += ' glyphicon-minus-sign';
                _expanded[unit.data.xid] = true;
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

            if(expanded && unit.state.required) {
                requiredUnits.push(obj);
            } else {
                optionalUnits.push(obj);
            }
        }


    }

    _fromHeaderAction = false;

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

var ExplorerView = React.createClass({
    panelHeaderClick: function(item, index, idStr) {
        _fromHeaderAction = true;
        var btn = $('#heading' + idStr + index).find('.footer-expand-collapse-btn');
        if (btn.hasClass('glyphicon-plus-sign')) {
            btn.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
            $('#collapse' + idStr + index).collapse('show');
            _expanded[item.unit.data.xid] = true;
        } else {
            btn.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
            $('#collapse' + idStr + index).collapse('hide');
            _expanded[item.unit.data.xid] = false;
        }

        this.setState(getUnitState(true));
    },

    chapterHeaderClick: function(item, index, idStr) {
        _fromHeaderAction = true;
        item.expanded = true;
        if (_expandedChapters[item.id]) {
            _expandedChapters[item.id] = !_expandedChapters[item.id];
        } else {
            _expandedChapters[item.id] = true;
        }

        this.setState(getUnitState(true));
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

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getUnitState(ExplorerStore.isVisible()));
        }
    },

    getInitialState: function() {
        return {data: [], expanded:false};
    },

    componentWillMount: function() {

        document.addEventListener("keydown", this.keypress);
    },

    componentDidMount: function() {
        LoaderStore.addChangeListener(this._onLoadChange);
        PageStore.addChangeListener(this._onPageChange);
        ExplorerStore.addChangeListener(this._onChange);
        $('.collapse').collapse();
    },

    componentWillUnmount: function() {
        LoaderStore.removeChangeListener(this._onLoadChange);
        PageStore.removeChangeListener(this._onPageChange);
        ExplorerStore.removeChangeListener(this._onChange);
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

    explorerItems: function(items, idStr) {
        var self = this;
        var html = (<div></div>);

        if (items) {
            html = items.map(function(item, index) {
                var icon = "";
                var sitems = "";


                if (item.unit.state.complete) {
                    icon = (<span className="glyphicon glyphicon-ok pass" aria-hidden="true"></span>);
                }
                if (_expanded[item.unit.data.xid]) {

                    sitems = item.rows.map(function(sitem, index) {
                        var pages = "";

                        if (_expandedChapters[sitem.id]) {
                            pages = (<TOCPages data={sitem.data.pages} chapter={sitem} unit={item.unit} idstr={idStr}/>);
                        }
                        return (
                            <div key={'explorer-chapter-rows-' + index}>
                                <TOCChapterRow item={sitem} chapter={sitem} unit={item.unit} idstr={idStr} expandHandler={self.chapterHeaderClick}/>
                                {pages}
                            </div>
                        );
                    });
                }

                var cls = '';
                if (index !== 0 && index !== items.length -1 ) {
                    cls = ' footer-view-middle-items';
                } else if (index === 0) {
                    cls = ' footer-view-first-item';
                } else {
                    cls = ' footer-view-last-item';
                }
                return (
                    <div id={'accordion' +idStr + index} role="tablist" aria-multiselectable="true" key={index}>
                        <li id={'heading' + idStr + index} className={"list-group-item main-footer-section main-footer-row btn-clk" + cls} onClick={self.panelHeaderClick.bind(self, item, index, idStr)}>
                            <a role="button" data-toggle="collapse" data-parent={'#accordion' + idStr + index} href={'#collapse' + idStr + index} aria-expanded="true" aria-controls={'collapse' + idStr + index}>
                                <span className={item.expandCollapseIconCls} aria-hidden="true"></span>
                            </a>
                            <span className="explorer-section-title">{item.title}</span>
                            <span className="badge">
                                {icon}
                             </span>
                        </li>
                        {sitems}
                    </div>
                )
            });
        }
        return html;

    },

    render: function() {
        var result = (<div></div>);
        var requiredItems = [];
        var optionalItems = [];

        if (!this.state.requiredUnits) {
            return (<div></div>);
        }

        if(UnitStore.requiredExists()) {
            requiredItems = this.explorerItems(this.state.requiredUnits, 'required');
            optionalItems = this.explorerItems(this.state.optionalUnits, 'optional');
            result = (
                <div className={this.state.expanded ? "main-footer-tab-container-expanded" : "main-footer-tab-container"}>
                    <ul className="nav nav-tabs nav-justified main-footer-tab" role="tablist">
                        <li role="presentation" className="active"><a href="#mainFooterLessonsTab" aria-controls="mainFooterLessonsTab" role="tab" data-toggle="tab">{LocalizationStore.labelFor("footer", "lblRequired")}</a></li>
                        <li role="presentation"><a href="#mainFooterCoursesTab" aria-controls="mainFooterCoursesTab" role="tab" data-toggle="tab">{LocalizationStore.labelFor("footer", "lblOptional")}</a></li>
                    </ul>
                    <div className="tab-content main-footer-tab-content">
                        <div role="tabpanel" className="tab-pane active main-footer-tab-pane" id="mainFooterLessonsTab">
                            <ul className="list-group">
                            {requiredItems}
                            </ul>
                        </div>
                        <div role="tabpanel" className="tab-pane main-footer-tab-pane" id="mainFooterCoursesTab">
                            <ul className="list-group">
                            {optionalItems}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
        return result;
    }
});

var TOCChapterRow = React.createClass({
    chapterHeaderClick: function(item, index, idStr) {
        this.props.expandHandler(item, index, idStr);
    },

    render: function() {
        var idStr = this.props.idstr;
        var index = this.props.index;
        var self = this;
        var icon = '';
        
        if (this.props.item.data.state && this.props.item.data.state.complete) {
            icon = (<span className="glyphicon glyphicon-ok pass" aria-hidden="true"></span>);
        }

        return (
            <li className="list-group-item main-footer-chapter-row main-footer-row btn-clk" onClick={self.chapterHeaderClick.bind(this, this.props.item, index, idStr)}>
                <a role="button" data-toggle="collapse" data-parent={'#accordion' + idStr + index} href={'#collapse' + idStr + index} aria-expanded="true" aria-controls={'collapse' + idStr + index}>
                    <span className={this.props.item.expandCollapseIconCls} aria-hidden="true"></span>
                </a>
                <span className="explorer-section-title">{this.props.item.title}</span>
                <span className="badge">
                    {icon}
                 </span>
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

            // hide certain page types
            if (item.type === PageTypeConstants.SECTION_END) {
                return;
            }

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
        var cls = '';
        var icon = '';
        var itemState = this.props.item.state || null;
        if (PageStore.page() && this.props.item.xid === PageStore.page().xid) {
            cls += ' current';
            icon = (<img src="images/icons/currentpage.png"/>);
        } else if (itemState && itemState.visited) {
            icon = (<img src="images/icons/inprogress.png"/>);
            cls += ' visited';
        } else if (itemState && itemState.complete) {
            icon = (<img src="images/icons/completeexplorer.png"/>);
        } else {
            cls += ' not-seen';
            icon = (<img src="images/icons/notseen.png"/>);
        }

        return (
            <li className={"list-group-item main-footer-page-row main-footer-row" + cls} onClick={this.loadPage.bind(this, this.props.item, this.props.chapter, this.props.unit)}>
                <span className="badge">
                    {icon}
                </span>
                <a href="#">
                    <span className="explorer-section-title">{this.props.item.title}</span>
                </a>
            </li>

        );
    }
});

module.exports = ExplorerView;