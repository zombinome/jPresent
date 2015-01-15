# jPresent

Simple Jquery plugin to do presentations.
Written as test excersice for Yandex job application.

TODO: Cool & beauty examples page

## Usage
In simplest case just write:
```javascript
$(selector).jPresent();
```
where `selector` - is jquery selector used to obtain reference to element you want to use to show presentation.

Configuration object can be passed to jPresent. For example:
```javascript
var config = {
  controls: {
    play: '#play-pause-btn',
    pause: '#play-pause-btn'
  },
  slideTransitionEffect: 'fade',
  autoplay: true
}
```
`.jPresent` function returns jQuery object, so you can chain it. To get plugin instance you can write:
```javascript
var plugin = $(selector).data('jPresent');
```

## Configuration
```javascript
{
  controls: {
    // "Go to previous slide" button selector
    prevSlide: '.jp-prev-slide-btn',
    
    // "Go to next slide" button selector.
    nextSlide: '.jp-next-slide-btn',
    
    // "Play" button selector. Used to start/resume presentation autoplay
    play: '.jp-play-btn',
    
    // "Pause" button selector. Used to pause presentation autoplay.
    // If the same as "Play" button selector, then target html element acts 
    // as "Play/Pause" button
    pause: 'jp-pause-btn',
    
    // Html element to display current slide number
    currentSlideDisplay: '.jp-current-slide',
    
    // Html element to display total slides count
    slidesCountDisplay: '.jp-slide-total',
    
    // Container used to host slides during presentation. 
    // Used in cases when slides shold be displayed inside html element 
    // different from presentation container
    displayContainer: null
  },
  
  // Should autoplay be enabled from the start
  autoPlay: false,
  
  // Time in milliseconds between slide switches in case of enabled 
  // presentation auto play
  autoPlayTimeout: 5000,
  
  // Slide width in pixels
  slideWidth: 800,
  
  // Slide height in pixels
  slideHeight: 600,

  // Selector used to distinguish html elements containing slides
  slideSelector: '.jp-slide',
  
  // Slide transition effect
  slideTransitionEffect: 'switch',
  
  // Slide transition speed. Used to determine transition animation speed
  // during slide transition
  slideTransitionSpeed: 400,
  
  // If true then: 
  // * when last slide shown, click to next slide button switches to first slide
  // * when first slide shown, click to prev slide button switches to last slide
  circular: false
}
```
## Plugin API
Plugin has following properties and methods to programmatically control presentation:

#### prevSlide()
Switches presentation to previous slide.

#### nextSlide()
Switches presentation to next slide.

#### switchTo(slideIndex)
Jumps to target slide. Slide index should be between 1 and total slide count.

#### play()
Starts/resumes slide auto play.

#### pause()
Pauses slide autoplay

## Licence
This library is under MIT Licence.
