/**
 * Created by Alex Rubanovsky as test exercise for Yandex job application
 */

// base on jQuery.DataTables module initialization
/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnScrollBarWidth,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/
(function (window, undefined) {
    (function(factory) {
        'use strict';
        if (typeof define === 'function' && define.amd) {
            // Define as an AMD module if possible
            define('jpresent', ['jquery'], factory);
        }
        else if (typeof exports === 'object') {
            // Node/CommonJS
            module.exports = factory(require('jquery'));
        }
        else if (jQuery && !jQuery.fn.jPresent) {
            // Define using browser globals otherwise
            // Prevent multiple instantiations if the script is loaded twice
            factory( jQuery );
        }
    })(function($) {
        'use strict';

        var PLUGIN_NAME = 'jPresent';
            //document = window.document;
            //$ = window.jQuery;

        /**
         * Default presentation settings
         * @type {{controls: {prevSlide: string, nextSlide: string, play: string, pause: string, currentSlideDisplay: string, slidesCountDisplay: string, displayContainer: string}, autoPlay: boolean, autoPlayTimeout: number, slideWidth: number, slideHeight: number, slideSelector: string, slideTransitionEffect: string, slideTransitionSpeed: number, circular: boolean}}
         */
        var defaultSettings = {
            controls: {
                prevSlide: '.jp-prev-slide-btn',
                nextSlide: '.jp-next-slide-btn',
                play: '.jp-play-btn',
                pause: 'jp-pause-btn',
                currentSlideDisplay: '.jp-current-slide',
                slidesCountDisplay: '.jp-slide-total',
                displayContainer: null
            },
            autoPlay: false,
            autoPlayTimeout: 5000,
            slideWidth: 800,
            slideHeight: 600,

            slideSelector: '.jp-slide',
            slideTransitionEffect: 'switch',
            slideTransitionSpeed: 400,
            circular: false
        };

        var transitions = {
            /**
             * Instant switch between slides
             * @param container {HTMLElement} slides container
             * @param oldSlide {HTMLElement} slide to hide
             * @param newSlide {HTMLElement} slide to show
             * @param direction {string} 'forward' or 'back'
             * @param speed {number} animation speed in milliseconds (ignored b this transition)
             * @returns JQueryPromise object
             */
            'switch': function (container, oldSlide, newSlide, direction, speed) {
                $(newSlide)
                    .css({ top: '0', left: '0' })
                    .show();

                var $oldSlide = $(oldSlide);
                $oldSlide
                    .hide()
                    .css({ top: '0', left: -$oldSlide.width() + 'px' });

                return $.Deferred().resolve().promise();
            },

            'slide': function (container, oldSlide, newSlide, direction, speed) {
                var cWidth = $(container).width(),
                    $newSlide = $(newSlide),
                    $oldSlide = $(oldSlide),
                    d = $.Deferred(),
                    oldZIndex;

                if (direction == 'forward') {
                    oldZIndex = newSlide.style.zIndex;
                    newSlide.style.zIndex = oldSlide.style.zIndex + 1;
                    $newSlide
                        .show()
                        .css({ top: '0', left: cWidth + 'px' })
                        .animate({left: 0}, speed, 'swing', function () {
                            $oldSlide
                                .hide()
                                .css({ top: '0', left: -$oldSlide.width() + 'px' });

                            newSlide.style.zIndex = oldZIndex;
                            d.resolve();
                        });

                }
                else {
                    oldZIndex = oldSlide.style.zIndex;
                    oldSlide.style.zIndex = newSlide.style.zIndex + 1;
                    $newSlide
                        .css({top: '0', left: '0'})
                        .show();

                    $oldSlide
                        .animate({left: cWidth}, speed, 'swing', function () {
                            $oldSlide
                                .hide()
                                .css({top: '0', left: -$oldSlide.width() + 'px'});

                            oldSlide.style.zIndex = oldZIndex;
                            d.resolve();
                        });
                }

                return d.promise();
            },

            'fade': function (container, oldSlide, newSlide, direction, speed) {
                var d1 = $.Deferred(),
                    d2 = $.Deferred(),
                    $oldSlide = $(oldSlide);

                $(newSlide)
                    .css({ top: '0', left: '0' })
                    .fadeIn(speed, d1.resolve);

                $(oldSlide)
                    .fadeOut(speed, function () {

                        $oldSlide
                            .hide()
                            .css({top: '0', left: -$oldSlide.width() + 'px'});

                        d2.resolve();
                    });

                return $.when(d1, d2);
            }
        };

        /**
         * Create new instance of JPresent object
         * @param element {HTMLElement}
         * @param settings {{controls: {prevSlide: string, nextSlide: string, play: string, pause: string, currentSlideDisplay: string, slidesCountDisplay: string, displayContainer: string}, autoPlay: boolean, autoPlayTimeout: number, slideWidth: number, slideHeight: number, slideSelector: string, slideTransitionEffect: string, slideTransitionSpeed: number}} plugin settings
         * @constructor
         */
        function JPresent(element, settings){
            var self = this;

            self.currentSlide = 0;
            self.playIntervalHandler = null;

            settings = self.settings = $.extend(true, {}, defaultSettings, settings);

            var containerSelector = settings.controls.displayContainer;
            var $element = (containerSelector ? $(element).find(containerSelector) : $(element));
            $element.css({
                width: settings.slideWidth + 'px',
                height: settings.slideHeight + 'px',
                position: 'relative',
                overflow: 'hidden'
            });

            this.element = $element[0];

            self.$slides = $(element).find(settings.slideSelector);
            self.totalSlidesCount = self.$slides.length;

            if(self.totalSlidesCount > 0){
                // appending slides to display container
                self.$slides.appendTo($element);

                var slideCss = {
                    position: 'absolute',
                    top: 0,
                    left: (-settings.slideWidth) + 'px',
                    width: settings.slideWidth + 'px',
                    height: settings.slideHeight + 'px'
                };

                self.$slides.css(slideCss);
                $(self.$slides[0]).css('left', '0');

                $(settings.controls.nextSlide).click(function () { self.nextSlide(); });
                $(settings.controls.prevSlide).click(function () { self.prevSlide(); });

                if(settings.controls.play == settings.controls.pause) {
                    $(settings.controls.play).click(function (){
                        if(self.playIntervalHandler)
                            self.pause();
                        else
                            self.play();
                    });
                }
                else {
                    $(settings.controls.play).click(function () { self.play(); });
                    $(settings.controls.pause).click(function () { self.pause(); });
                }

                if(settings.autoPlay)
                    self.play();

                updateCurrentSlideDisplay(this);
                $(settings.controls.slidesCountDisplay).text(this.totalSlidesCount);
            }

            $.data(element, PLUGIN_NAME, this);
        }

        $.extend(JPresent.prototype, {
            /**
             * Shows next slide. If current slide is the last slide, shows the first slide
             * @returns {*}
             */
            nextSlide: function () {
                if (!this.settings.circular && (this.currentSlide + 1) >= this.totalSlidesCount) return;

                return goToSlide(this, this.currentSlide + 1);
            },
            /**
             * Shows prev slide. If current slide is the first slide, shows last slide
             * @returns {*}
             */
            prevSlide: function () {
                if(!this.settings.circular && this.currentSlide === 0) return;

                return goToSlide(this, this.currentSlide - 1);
            },

            /**
             * Starts/resumes presentation auto play
             */
            play: function() {
                var self = this;
                if(!this.playIntervalHandler)
                    this.playIntervalHandler = setInterval(function () {
                        self.nextSlide();
                    }, this.settings.autoPlayTimeout);
            },

            /**
             * Pauses presentation auto play
             */
            pause: function () {
                if(this.playIntervalHandler) {
                    clearInterval(this.playIntervalHandler);
                    this.playIntervalHandler = null;
                }
            },

            /**
             * Jumps to target slide. Slide index should be between 1 and total slide count
             * @param targetSlide {number} slide number starting from 1;
             */
            jumpTo: function(targetSlide) {
                if(targetSlide < 1 || targetSlide > this.totalSlidesCount)
                    return $.reject('Invalid slide number').promise();

                return goToSlide(this, targetSlide - 1);
            }
        });

        /**
         * Switches to designated slide
         * @param plugin {JPresent} plugin instance
         * @param slideIndex {number} Target slide index
         * @returns {*} JQuery promise object
         */
        function goToSlide(plugin, slideIndex) {
            if(!plugin.totalSlidesCount)
                return $.Deferred().reject('No slides in presentation').promise();

            if(plugin.currentSlide == slideIndex)
                return $.Deferred().reject('Slide already shown').promise();

            var transition = transitions[plugin.settings.slideTransitionEffect] || transitions['switch'],
                speed = plugin.settings.slideTransitionSpeed,
                direction = plugin.currentSlide < slideIndex ? 'forward' : 'back';

            var nextSlideIndex = slideIndex;
            if(nextSlideIndex >= plugin.totalSlidesCount)
                nextSlideIndex = 0;
            else if(nextSlideIndex < 0)
                nextSlideIndex = plugin.totalSlidesCount - 1;

            var currentSlide = plugin.$slides[plugin.currentSlide],
                nextSlide = plugin.$slides[nextSlideIndex];

            // we should restart autoPlay timeout
            if(plugin.settings.autoPlay) {
                plugin.pause();
                plugin.play();
            }

            return transition(plugin.element, currentSlide, nextSlide, direction, speed)
                .done(function () {
                    plugin.currentSlide = nextSlideIndex;
                    updateCurrentSlideDisplay(plugin);
                });
        }

        /**
         * Updates info about current slide
         * @param plugin {JPresent}
         */
        function updateCurrentSlideDisplay(plugin){
            $(plugin.settings.controls.currentSlideDisplay).text(plugin.currentSlide + 1);
        }

        /**
         *
         * @param [settingsOrAction] {string|Object}
         * @param [actionArgs]
         * @returns {$.fn}
         */
        $.fn.jPresent = function (settingsOrAction, actionArgs){

            this.each(function () {
                var instance = $.data(this, PLUGIN_NAME),
                    settings = null,
                    action;

                typeof settingsOrAction == 'string'
                    ? (action  = settingsOrAction)
                    : (settings = settingsOrAction);

                if(!instance)
                    instance = new JPresent(this, settings);

                action && instance[action] && instance[action](actionArgs);
            });

            return this;
        };

        $.jPresent = JPresent;
        $.jPresent.defaults = defaultSettings;
        $.jPresent.transitions = transitions;

        return $.fn.jPresent;
    });
})(window);