/**
 * Created by Alex Rubanovsky as test exercise for Yandex job applicants
 */

(function (window, document, $, undefined){
    'use strict';

    var PLUGIN_NAME = 'jPresent';

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
        slideTransitionEffect: 'move',
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
                .css({top: '0', left: -$oldSlide.width() + 'px'});

            return $.Deferred().resolve().promise();
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

})(window, document, jQuery);
