var AppDispatcher = require('../dispatcher/AppDispatcher');
var InfoTagConstants = require("../constants/InfoTagConstants");
var LocalizationStore = require('../stores/LocalizationStore');
var PageConstants = require('../constants/PageConstants');
var PageTypeConstants = require('../constants/PageTypeConstants');
var PageActions = require('../actions/PageActions');
var PrePostTestConstants = require('../constants/PrePostTestConstants');
var PrePostTestStore = require('../stores/PrePostTestStore');
var UnitActions = require('../actions/UnitActions');
var UnitStore = require('../stores/UnitStore');
var Utils = require('../components/widgets/Utils');


var PrePostTestActions = {

    build: function() {

        var foundPages = [];
        var pretestchapter = null;
        var posttestchapter = null;

        // reset any past values
        AppDispatcher.dispatch({
            actionType: PrePostTestConstants.PRE_POST_TEST_RESET
        });

        // get all the units
        var units = UnitStore.getAll();

        // iterate over each unit
        for (var key in units) {
            var unit = units[key];

            // check which units are marked required
            if (UnitStore.isRequired(unit.id)) {
                if (unit.data.chapter) {
                    // iterate over the units chapters
                    for (var chapterIndex = 0; chapterIndex < unit.data.chapter.length; chapterIndex++) {
                        var chapter = unit.data.chapter[chapterIndex];

                        // check for pretest chapter, save reference and skip it
                        if (Utils.findInfo(chapter.info, InfoTagConstants.INFO_PROP_PRETEST) !== null) {
                            pretestchapter = chapter;
                        }

                        // check for posttest chapter, save reference and skip it
                        if (Utils.findInfo(chapter.info, InfoTagConstants.INFO_PROP_POSTTEST) !== null) {
                            posttestchapter = chapter;
                            break;
                        }

                        if (chapter.pages) {
                            // iterate over the chapters pages
                            for (var pageIndex = 0; pageIndex < chapter.pages.length; pageIndex++) {
                                var page = chapter.pages[pageIndex];
                                // if page is a quiz page and is marked for the preposttest then save it for later
                                if (page.state && (page.state.quizpage == true) && (page.preposttest === true)) {
                                    foundPages.push({
                                        page: page,
                                        chapterId: chapter.xid,
                                        chapterTitle: chapter.title,
                                        unitId: unit.id,
                                        unitTitle: unit.data.title
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // iterate over found pages
        var preTestCount = 0;
        var postTestCount = 0;

        for (var i in foundPages) {
            var page = foundPages[i].page;
            var chapterId = foundPages[i].chapterId;
            var chapterTitle = foundPages[i].chapterTitle;
            var unitId = foundPages[i].unitId;
            var unitTitle = foundPages[i].unitTitle;

            // if found a pre test chapter then add the page to it
            if (pretestchapter) {
                // increment count
                preTestCount++;

                // use JSON to clone object
                var pageCopyPre = JSON.parse(JSON.stringify(page));

                // change title
                pageCopyPre.title = LocalizationStore.labelFor("pretest", "lblTitle", [preTestCount]);

                // update xid as a combination of chapter id and page id
                pageCopyPre.xid = chapterId + "_" + page.xid;

                // add pre post test attribute
                pageCopyPre.preposttest = true;

                // add page to either the end or right before the quiz end page if found
                var insertIndexPre = pretestchapter.pages.length;
                for (var pageIndexPre in pretestchapter.pages) {
                    var preTestPage = pretestchapter.pages[pageIndexPre];
                    if (preTestPage.type === PageTypeConstants.TEST_OUT_QUIZ_END) {
                        insertIndexPre = pageIndexPre;
                        break;
                    }
                }

                // insert it to the lesson
                pretestchapter.pages.splice(insertIndexPre, 0, pageCopyPre);
            }

            // if found a post test chapter then add the page to it
            if (posttestchapter) {
                // increment count
                postTestCount++;

                // use JSON to clone object
                var pageCopyPost = JSON.parse(JSON.stringify(page));

                // change title
                pageCopyPost.title = LocalizationStore.labelFor("pretest", "lblTitle", [postTestCount]);

                // update xid as a combination of chapter id and page id
                pageCopyPost.xid = chapterId + "_" + page.xid;

                // add pre post test attribute
                pageCopyPost.preposttest = true;

                // add page to either the end or right before the quiz end page if found
                var insertIndexPost = posttestchapter.pages.length;
                for (var pageIndexPost in posttestchapter.pages) {
                    var postTestPage = posttestchapter.pages[pageIndexPost];
                    if (postTestPage.type === PageTypeConstants.POST_TEST_QUIZ_END) {
                        insertIndexPost = pageIndexPost;
                        break;
                    }
                }

                // insert it to the lesson
                posttestchapter.pages.splice(insertIndexPost, 0, pageCopyPost);
            }


            // add to store
            AppDispatcher.dispatch({
                actionType: PrePostTestConstants.PRE_POST_TEST_ADD_PAGE,
                data: {
                    pageId: page.xid,
                    chapterId: chapterId,
                    chapterTitle: chapterTitle,
                    unitId: unitId,
                    unitTitle: unitTitle
                }
            });
        }
    },

    markTestOutUnitsComplete: function(unitIdArray) {
        var length = unitIdArray.length;
        while(length--) {

            var unitId = unitIdArray[length];

            // get unit chapters
            var chaptersArray = UnitStore.getChapterIdsInUnit(unitId);
            var chapterLength = chaptersArray.length;

            // mark chapters as passed and complete
            while(chapterLength--) {
                var chapterId = chaptersArray[chapterLength];
                UnitActions.markChapterComplete(unitId, chapterId);
                UnitActions.markChapterPassed(unitId, chapterId);
            }

            // mark unit as complete and passed
            UnitActions.markUnitComplete(unitId);
            UnitActions.markUnitPassed(unitId);
        }
    }
};

module.exports = PrePostTestActions;