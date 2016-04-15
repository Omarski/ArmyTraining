var React = require('react');
var CheckIcon = require('../components/widgets/CheckIcon');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');
var PageActions = require('../actions/PageActions');
var PageStore = require('../stores/PageStore');
var NotificationActions = require('../actions/NotificationActions');
var ProgressView = require('../components/ProgressView');


function getUnitState(expanded) {
    var units = UnitStore.getAll();
    var data = [];
    var totalUnits = 0;
    var totalUnitsComplete = 0;
    var currentUnitIndex = 0;
    var currentPageIndex = 0;

    for (var key in units) {
        totalUnits++;
        var unit = units[key];
        var chapters = [];
        var completed = true;
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

                var pages = c.pages;
                var pagesLen = pages.length;
                var tcpCompleted = 0;
                var tcpTotal = pages.length;
                while (pagesLen--) {
                    totalPages++;
                    var page = pages[pagesLen];
                    if (!page.state || !page.state.visited) {
                        completed = false;
                    } else {
                        completedCount++;
                        tcpCompleted++;
                    }
                }

                chapters.push({
                    completed: false,
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
            if (completed) {
                totalUnitsComplete++;
            }
            data.push(
                {
                    unitExpandedCls: unitExpandedCls,
                    expandCollapseIconCls: expandCollapseIconCls,
                    unitCls: unitCls,
                    unit: unit,
                    completed: completed,
                    title: unit.data.title,
                    percent: Math.round((completedCount / totalPages) * 100),
                    rows: chapters
                }
            );
        }
    }

    return {
        data: data,
        currentUnitIndex: currentUnitIndex,
        totalUnits: totalUnits,
        currentPageIndex: currentPageIndex,
        totalPages: totalPages,
        unitsPercent: Math.round((totalUnitsComplete / totalUnits) * 100),
        expanded: expanded
    };
}

var FooterView = React.createClass({
    next: function() {
        PageActions.loadNext({});
    },
    previous: function() {
        PageActions.loadPrevious({});
    },
    panelHeaderClick: function(index) {

        var btn = $('#heading' + index).find('.footer-expand-collapse-btn');
        if (btn.hasClass('glyphicon-plus-sign')) {
            btn.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
            $('#collapse' + index).collapse('show');
        } else {
            btn.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
            $('#collapse' + index).collapse('hide');
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
        LoaderStore.addChangeListener(this._onLoadChange);
        PageStore.addChangeListener(this._onPageChange);
        $('.collapse').collapse();
    },


    componentWillUnmount: function() {
        LoaderStore.removeChangeListener(this._onLoadChange);
        PageStore.removeChangeListener(this._onPageChange);
    },

    toggleTOC: function(event) {
        window.location.hash = "#" + PageStore.chapter().title + PageStore.page().title;
        this.setState(getUnitState(!this.state.expanded));
    },
    render: function() {
        var self = this;
        var items = this.state.data.map(function(item, index) {
            return (
                <div className="panel-group main-footer-accordian" id={'accordion' + index} role="tablist" aria-multiselectable="true" key={index}>
                    <div className="panel panel-default">
                        <div className="panel-heading" role="tab" id={'heading' + index} >
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
                        </div>
                        <div id={'collapse' + index} className={item.unitExpandedCls} role="tabpanel" aria-labelledby={'heading' + index}>
                            <div className="panel-body main-footer-panel-body">
                                <TOCDetails data={item.rows} unit={item.unit}/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
        return (
            <footer className={this.state.expanded ? "footer main-footer expanded" : "footer main-footer"}>
                <div className="container-fluid footer-nav">
                    <ProgressView />
                    <div id="mainFooterPageNav" className="row main-footer-page-nav">
                        <div className={this.state.expanded ? "container-fluid main-footer-page-nav-buttons-expanded" : "container-fluid"}>
                            <div className="row main-footer-page-nav-row">
                                <div className="col-md-3">
                                    <button id="lessonsIndexBtn" type="button" className="btn btn-default btn-lg btn-link btn-text-icon" aria-label="Left Align" onClick={this.toggleTOC}>
                                        <span id="lessonsIndexBtnIcon" className={this.state.expanded ? "glyphicon glyphicon-download btn-icon" : "glyphicon glyphicon-upload btn-icon"} aria-hidden="true"></span>
                                        Lessons | Index
                                    </button>
                                </div>
                                <div className="col-md-7"></div>
                                <div className="col-md-1">
                                    <button type="button" onClick={this.previous} className="btn btn-default btn-lg btn-link" aria-label="Left Align">
                                        <span className="glyphicon glyphicon-circle-arrow-left btn-icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                                <div className="col-md-1">
                                    <button type="button" onClick={this.next} className="btn btn-default btn-lg btn-link" aria-label="Left Align">
                                        <span className="glyphicon glyphicon-circle-arrow-right btn-icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.expanded ? "main-footer-tab-container-expanded" : "main-footer-tab-container"}>
                            <ul className="nav nav-tabs nav-justified main-footer-tab" role="tablist">
                                {/*    <li role="presentation" className="active"><a href="#mainFooterLessonsTab" aria-controls="mainFooterLessonsTab" role="tab" data-toggle="tab">Home</a></li>
                                <li role="presentation"><a href="#mainFooterCoursesTab" aria-controls="mainFooterCoursesTab" role="tab" data-toggle="tab">Profile</a></li>
                           */} </ul>
                            <div className="tab-content main-footer-tab-content">
                                <div role="tabpanel" className="tab-pane active main-footer-tab-pane" id="mainFooterLessonsTab">
                                    {items}
                                </div>
                                <div role="tabpanel" className="tab-pane main-footer-tab-pane" id="mainFooterCoursesTab">...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
});

var TOCDetails = React.createClass({

    render: function() {
        var unit = this.props.unit;
        var items = this.props.data.map(function(item, index) {
            return (
                <div key={index}>
                <TOCChapterRow item={item} />
                <TOCPages data={item.data.pages} chapter={item} unit={unit}/>
                    </div>
            );
        });

        return (
            <div>{items}</div>
        );

    }
});

var TOCChapterRow = React.createClass({
    render: function() {
        var cls = '';
        if (PageStore.chapter() && this.props.item.data.xid === PageStore.chapter().xid) {
            cls += ' main-footer-accordian-table-row-active';
        }
        return (
            <table className="panel-title table table-condensed main-footer-accordian-table">
                <tr className={cls}>
                    <td>
                        <div className="main-footer-table-icon-col">
                            <CheckIcon completed={this.props.item.completed} />
                        </div>
                    </td>
                    <td>
                        <h4>{this.props.item.title}</h4>
                    </td>
                    <td width="100%">
                        <div className="dots">&nbsp;</div>
                    </td>
                    <td width="55">
                        <h4>{this.props.item.completed ? "Complete" : ""}</h4>
                    </td>
                    <td>
                        <div className="main-footer-table-icon-col">
                            <h4>{this.props.item.percent}%</h4>
                        </div>
                    </td>
                </tr>
            </table>
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

        var items = this.props.data.map(function(item, index) {
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
        var cls = 'main-footer-accordian-table-row';
        if (PageStore.page() && this.props.item.xid === PageStore.page().xid) {
            cls += ' main-footer-accordian-table-row-active';
        } else {
            if (this.props.item.state && this.props.item.state.visited) {
                cls += ' main-footer-accordian-table-row-visited';
            }
        }

        return (
            <div>
                <table
                    onClick={this.loadPage.bind(this, this.props.item, this.props.chapter, this.props.unit)}
                    className="panel-title table table-condensed table-hover main-footer-accordian-table main-footer-accordian-table-pages">
                    <tr className={cls}>
                        <td>
                            <div className="main-footer-table-icon-col">
                                <CheckIcon completed={true} />
                            </div>
                        </td>
                        <td>
                            <div id={this.props.chapter.title + this.props.item.title}></div>
                            <h4>{this.props.item.title}</h4>
                        </td>
                        <td width="100%">
                            <div className="dots">&nbsp;</div>
                        </td>
                        <td width="55">
                            <h4></h4>
                        </td>
                        <td>
                            <div className="main-footer-table-icon-col">
                                <h4>&nbsp;</h4>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
});

module.exports = FooterView;