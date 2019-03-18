// ONSCROLL JS
// AUTHOR: CHIRAG SINGH RAJPUT

// IMPLEMENT OBJECT.ENTRIES FOR OLDER ENVIRONMENTS

if (!Object.entries) {
    Object.entries = function (object) {
        let ret = [];
        for (const x of Object.keys(object)) {
            ret.push([x, object[x]]);
        }
        return ret;
    }
}

// GLOBAL CONSTANTS

_WINDOW_SCROLL_POSITION_ = 0;
const __INDICATOR_TYPES__ = Object.freeze({
    "__TRIGGERELEM__": 0,
    "__TRIGGERHOOK__": 1,
    "__TRIGGEREND__": 2
});

const __EVENT_STATES__ = Object.freeze({
    "__INITIAL__": 0,               //EVENT HAS NOT BEEN START YET
    "__RUNNING__": 1,               //EVENT IN IN PROGRESS
    "__FINISHED__": 2,              //EVENT IS COMPLETED
    "__CANCEL__": 4,                //EVENT IS CANCELED
    "__RUNNING_FORWARD__": 5,       //TIMELINE IS RUNNING FORWARD
    "__RUNNING_REVERSE__": 6        //TIMELINE IS RUNNING REVERSE
});

const __PIN_TYPES__ = Object.freeze({
    "__FIXED_LENGTH__": 1,
    "__FULL_LENGTH__" : 2
});

// UNTIL NOW IT SUPPORTS ONLY SINGLE EVENT PER ELEMENT

// SIMPLE UNCONTROLLED TRANSITION AND DETRANSITION              [X]
// TRANSITION BASED ON SCROLL AMOUNT                            [X]
// TIMELINED BASED UNCONTROLLED TRANISITION AND DETRANSITION    [X]
// SCROLL BASED TIMELINE                                        [X]
// PINNING                                                      [X]
// PARALLAX                                                     [X]

// TO BE IMPLEMENTED

// JS EXCEUTION AND DEXECUTIION                                 [ ]
// CSS CLASSING AND DECLASSING                                  [ ]




class OnScroll {

    
    constructor() {
        this._events = [];
        this._setupListeners();
    }

    
    //RETURNS ELEMENT OFFSET WITH RESPECT TO DOCUMENT
    static _getYOffsetDocument(elem) {
        return elem.getBoundingClientRect().top + (window.scrollY || document.documentElement.scrollTop);
    }
    
    
    //RETURNS ELEMENT OFFSET WITH RESPECT TO VIEWPORT
    static _getYOffsetViewport(elem) {
        return elem.getBoundingClientRect().top; //+ _WINDOW_SCROLL_POSITION_;
    }

    
    //SETUP WINDOW SCROLL EVENT LISTENERS AND CHECKS FOR EVENTS
    _setupListeners() {
        addEventListener("scroll", () => {
            _WINDOW_SCROLL_POSITION_  = window.pageYOffset;
            for (const e of this._events) {
                // EACH EVENT HAS REFRENCE TO IT'S OWN EVENT CHECKER
                e._eventChecker(e);     //CHECKS STATES AND EXECUTES EVENTS
            }
        });
    }

    
    static _setTransitionProperties(e) {
        var x = e;
        e._targetElem.style["transition-duration"] = e._duration + "s";
        e._targetElem.style["transition-timing-function"] = e._transitionEase;
        setTimeout(function() {
            x._targetElem.style.removeProperty("transition-duration");
            x._targetElem.style.removeProperty("transition-timing-function");
        }, e._duration * 1000);
    }

    
    // FOR SIMPLE GO PAST AND EXECUTE EVENTS WITH NO MIDDLE STATE
    static _eventChecker(e) {
        let offset = e._triggerPosition - OnScroll._getYOffsetViewport(e._triggerElem);
        if (offset > 0 && e._eventState == __EVENT_STATES__.__INITIAL__) {
            e._targetElem.setAttribute("style", e._transformation);
            OnScroll._setTransitionProperties(e);
            e._eventState = __EVENT_STATES__.__FINISHED__;
        } else if (offset < 0 && e._eventState == __EVENT_STATES__.__FINISHED__) {
            e._targetElem.setAttribute("style", e._initialStyle);
            OnScroll._setTransitionProperties(e);
            e._eventState = __EVENT_STATES__.__INITIAL__;
        }
    }

    
    // FOR EVENTS THAT HAPPEN DEPENDING ON AMOUNT OF SCROLL
    static _eventCheckerDuration(e) {
        let offset = e._triggerPosition - OnScroll._getYOffsetViewport(e._triggerElem);
        if (offset < 0 && e._eventState !== __EVENT_STATES__.__INITIAL__) {
            e._targetElem.setAttribute("style", e._initialStyle);    
            e._eventState = __EVENT_STATES__.__INITIAL__; 
        } else if (offset > 0 && offset < e._duration) {
            OnScroll._playTransitionAt(e, offset / e._duration);
        } else if (offset > e._duration && e._eventState !== __EVENT_STATES__.__FINISHED__) {
            e._targetElem.setAttribute("style", e._transformation);
            e._eventState = __EVENT_STATES__.__FINISHED__;
        }
    }
    
    
    // SETS THE STYLE OF THE ELEMENT IN BETWEEN THE TRANSITION
    // DELAY LIES BETWEEN  0 AND 1
    // 0 FOR INITIAL STATE
    // 1 FOR FINISED TRANSITION
    static _playTransitionAt(e, delay) {
        e._targetElem.setAttribute("style", e._initialStyle);
        for(const x of Object.keys(e._initialStyleObject))
           e._targetElem.style[x] = getComputedStyle(e._targetElem).getPropertyValue(x);
        
        e._targetElem.setAttribute("style", e._transformation);
        e._targetElem.style["transition-duration"] = "1s";
        e._targetElem.style["transition-timing-function"] = e._transitionEase;
        e._targetElem.style["transition-delay"] = `${-delay}s`;

        for(const x of Object.keys(e._transformationObject))
            e._targetElem.style[x] = getComputedStyle(e._targetElem).getPropertyValue(x);
        e._eventState = __EVENT_STATES__.__RUNNING__;
    }


    
    // FOR TIMELINE BASED EVENTS
    static _eventCheckerTimeline(e) {
        let offset = e._triggerPosition - OnScroll._getYOffsetViewport(e._triggerElem);
        if (offset > 0 && e._eventState == __EVENT_STATES__.__INITIAL__) {
            // RUN IT
            OnScroll._executeTimeline(e);
            e._eventState = __EVENT_STATES__.__RUNNING_FORWARD__;
        } else if (offset < 0 && e._eventState == __EVENT_STATES__.__FINISHED__) {
            // UNDO IT
            OnScroll._dexecuteTimeline(e);
            e._eventState = __EVENT_STATES__.__RUNNING_REVERSE__;
        } else if (offset < 0 && e._eventState == __EVENT_STATES__.__RUNNING_FORWARD__) {
            // CANCEL IT
            OnScroll._cancelTimeline(e);
            e._eventState = __EVENT_STATES__.__CANCEL__;
        } else if (offset > 0 && (e._eventState == __EVENT_STATES__.__CANCEL__ || e._eventState == __EVENT_STATES__.__RUNNING_REVERSE__)) {
            // RERUN IT
            OnScroll._restartTimeline(e);
            e._eventState = __EVENT_STATES__.__RUNNING_FORWARD__;
        }
    }

    
    // PERFORMS SINGLE EVENT TRANSFORMATION
    static _executeTransformation(e) {
        e._targetElem.setAttribute("style", e._transformation[e._timelineIndex]);
        e._targetElem.style["transition-duration"] = e._transformationObject[e._timelineIndex].duration + "s";
        e._targetElem.style["transition-timing-function"] = e._transformationObject[e._timelineIndex].ease
    }

    
    // RESTORES PREVIOUS STYLES
    static _dexecuteTransformation(e) {
        e._targetElem.setAttribute("style", e._savedStyles[e._timelineIndex]);
        e._targetElem.style["transition-duration"] = e._transformationObject[e._timelineIndex].duration + "s";
        e._targetElem.style["transition-timing-function"] = e._transformationObject[e._timelineIndex].ease;
    }

    
    // SEQUENCIALLY EXECUTES TIMELINE
    static _executeTimeline(e) {
        if (e._timelineIndex < e._transformation.length) {
            OnScroll._executeTransformation(e);
            e._savedStyles[e._timelineIndex + 1] = (e._targetElem.getAttribute("style"));
            e._timeoutHandler = setTimeout(OnScroll._executeTimeline, e._transformationObject[e._timelineIndex].duration * 1000, e);
            e._timelineIndex++;
        } else {
            // MARK THE EVENT AS FINISED
            e._timelineIndex--;
            e._eventState = __EVENT_STATES__.__FINISHED__;
        }
    }

     
    // SEQUENCIALLY DEXECUTES TIMELINE
    static _dexecuteTimeline(e) {
        if (e._timelineIndex >= 0) {
            OnScroll._dexecuteTransformation(e);
            e._timeoutHandler = setTimeout(OnScroll._dexecuteTimeline, e._transformationObject[e._timelineIndex].duration * 1000, e);
            e._timelineIndex--;
        } else {
            // MARK THE EVENT AS INITIAL
            e._timelineIndex = 0;
            e._targetElem.setAttribute("style", e._initialStyle);
            e._eventState = __EVENT_STATES__.__INITIAL__;
        }
    }

    
    // CANCEL TIMELINE IN BETWEEN
    static _cancelTimeline(e) {
        e._timelineIndex--;
        e._targetElem.style["transition-duration"] = "0s";
        clearTimeout(e._timeoutHandler);
        OnScroll._dexecuteTimeline(e);
    }

    
    static _restartTimeline(e) {
        if(e._timelineIndex < 0) e._timelineIndex = 0; else e._timelineIndex++;
        e._targetElem.style["transition-duration"] = "0s";
        clearTimeout(e._timeoutHandler);
        OnScroll._executeTimeline(e);
    }

    
    // FOR DURATION BASED TIMELINE EVENTS
    static _eventCheckerDurationTimeline(e) {
        let offset = e._triggerPosition - OnScroll._getYOffsetViewport(e._triggerElem);
        if (offset < 0 && e._eventState !== __EVENT_STATES__.__INITIAL__) {
            e._targetElem.setAttribute("style", e._initialStyle);    
            e._eventState = __EVENT_STATES__.__INITIAL__;
            
        } else if (offset > 0 && offset < e._duration) {
            for(let i = 0 ; i < e._timelineTiming.length ; i++) {
                if(offset < e._timelineTiming[i]) {
                    OnScroll._playTransitionAtTimeline(e, (offset - e._timelineTiming[i-1]) / e._timelineDuration[i], i)
                    break;
                }
            }
        } else if (offset > e._duration && e._eventState !== __EVENT_STATES__.__FINISHED__) {
            e._targetElem.setAttribute("style", e._transformation[e._transformation.length - 1]);
            e._eventState = __EVENT_STATES__.__FINISHED__;
        }
    }

    
    // PLAYS CURRENT TRANSITION IN THE TIMELINE AT SPECIFIC INDEX
    static _playTransitionAtTimeline(e, delay, index) {
        e._targetElem.setAttribute("style", e._transformation[index - 1]);
        for(const x of Object.keys(e._transformationObject[index].transformation))
            e._targetElem.style[x] = getComputedStyle(e._targetElem).getPropertyValue(x);
        
        e._targetElem.setAttribute("style", e._transformation[index]);
        e._targetElem.style["transition-duration"] = "1s";
        e._targetElem.style["transition-timing-function"] = e._transformationObject[index].ease;
        e._targetElem.style["transition-delay"] = `${-delay}s`;

        for(const x of Object.keys(e._transformationObject[index].transformation))
            e._targetElem.style[x] = getComputedStyle(e._targetElem).getPropertyValue(x);

        e._eventState = __EVENT_STATES__.__RUNNING__;
    }

    // CONTROLS FULL LENGTH PINNING
    static _fixPinFull(e) {
        let offset =_WINDOW_SCROLL_POSITION_ + e._triggerPosition - e._initialTargetTop;
        if (offset > 0 && e._eventState == __EVENT_STATES__.__INITIAL__) {
            e._targetElem.style["top"] = e._triggerPosition + "px";
            e._targetElem.style["position"] = "fixed";
            e._eventState = __EVENT_STATES__.__RUNNING__;
        } else if (offset < 0 && e._eventState !=  __EVENT_STATES__.__INITIAL__) {
            e._targetElem.style["position"] = "absolute";
            e._targetElem.style["top"] = "0";
            e._eventState = __EVENT_STATES__.__INITIAL__; 
        }
    }

    // CONTROLS FIXED LENGTH PINNING 
    static _fixPinFix(e) {
        let offset =_WINDOW_SCROLL_POSITION_ + e._triggerPosition - e._initialTargetTop;
        if (offset < 0 && e._eventState !== __EVENT_STATES__.__INITIAL__) {
            e._targetElem.style["position"] = "absolute";
            e._targetElem.style["top"] = "0";
            e._targetElem.style["bottom"] = "auto";
            e._eventState = __EVENT_STATES__.__INITIAL__; 
        } else if (offset > 0 && offset < e._duration) {
            e._targetElem.style["top"] = e._triggerPosition + "px";
            e._targetElem.style["position"] = "fixed";
            e._eventState = __EVENT_STATES__.__RUNNING__;
        } else if (offset > e._duration && e._eventState !== __EVENT_STATES__.__FINISHED__) {
            e._targetElem.style["position"] = "absolute";
            e._targetElem.style["bottom"] = -e._targetElem.clientHeight + "px";
            e._targetElem.style["top"] = "auto";
            e._eventState = __EVENT_STATES__.__FINISHED__;
        }
    }

    
    // CREATES AN INDICATOR OF SPECIFIC TYPE
    // X IS THE POISTION OF THE INDICATOR IN PIXELS
    static _createIndicator(type, x) {

        let indicator = document.createElement("div");

        let color = "blue";

        switch (type) {
            case __INDICATOR_TYPES__.__TRIGGERELEM__:
                indicator.style["position"] = "absolute";
                indicator.style["margin-left"] = "60px";
                indicator.innerText = "start";
                color = "green";
                break;

            case __INDICATOR_TYPES__.__TRIGGEREND__:
                indicator.style["position"] = "absolute";
                indicator.style["margin-left"] = "60px";
                indicator.innerText = "end";
                color = "red";
                break;

            case __INDICATOR_TYPES__.__TRIGGERHOOK__:
                indicator.style["position"] = "fixed";
                indicator.innerText = "trigger";
                break;

        }

        indicator.style["width"] = "60px";
        indicator.style["top"] = `${x}px`;
        indicator.style["text-align"] = "center";
        indicator.style["fontSize"] = "12px";
        indicator.style["z-index"] = 99999;
        indicator.style["height"] = "auto";
        indicator.style["color"] = color;
        indicator.style["border-top"] = `1px solid ${color}`;
        document.body.appendChild(indicator);
        return indicator;
    }

    
    // CONVERTS TRANSITION OBJECT TO INILINE CSS STRING
    static _objectToInlineCSS(obj) {
        let str = "";
        for(const [x,y] of Object.entries(obj)) {
            str += x + ": " + y + "; ";
        }
        return str;
    }

    static _initialize(e) {
        // PARSE DURATION PASSED
        e._initialStyleObject = {};
        const initialStyles = getComputedStyle(e._targetElem);
        e._duration = OnScroll._parseUnit(e._duration, e._targetElem);
        if(!e._timeLine) {
            for(const x of Object.keys(e._transformationObject)) {
                e._initialStyleObject[x] = initialStyles.getPropertyValue(x);
            }
        }
    }

    
    static _initializeSimple(e) {
        e._eventChecker = OnScroll._eventChecker;
    }

    
    static _initializeDuration(e) {
        e._eventChecker = OnScroll._eventCheckerDuration;
    }

    
    static _initializeTimeline(e) {
        e._eventChecker = OnScroll._eventCheckerTimeline;
        e._transformation = [];
        // SAVES STYLES AFTER EACH EVENT IN TIMELINE FOR ROLLBACK
        e._savedStyles    = [];
        // COMPUTED TRANSFORMATIONS AFTER EVERY EVENT IN TIMELINE
        e._transformation = [];
        // HOLDS CURRENT TRANSITION INDEX IN TIMELINE
        e._timelineIndex  = 0;
        // SAVES REFERENCE TO SETTIMOUT
        e._timeoutHandler = null;
        for(let i = 0 ; i < e._transformationObject.length ; i++) {
            e._transformation[i] = (i > 0?  e._transformation[i-1] : e._initialStyle)   + "; " + OnScroll._objectToInlineCSS(e._transformationObject[i].transformation);
        }
        e._savedStyles.push(`${e._initialStyle}; transition-duration: ${e._transformationObject[0].duration}s; transition-timing-function: ${e._transformationObject[0].ease};`);

    }

    
    static _initializeDurationTimeline(e) {

        e._eventChecker = OnScroll._eventCheckerDurationTimeline;
        // HOLD SUM OF DURATIONS/OFFSET OF ALL EVENTS IN TIMELINE
        e._timelineDivision = 0;
        // HOLDS THE END OF EVENT IN PIXELS RELATIVE TO START OF TIMELINE
        e._timelineTiming = [];
        // NUMBER OF PIXELS EACH TRANSITION PLAYS
        e._timelineDuration = [];
        for(let i = 0 ; i < e._transformationObject.length ; i++) {
            e._timelineDivision += e._transformationObject[i].duration;
            e._timelineTiming[i] = e._timelineDivision;
            e._timelineDuration[i] = e._transformationObject[i].duration;
        }
        var temp = e._timelineDivision = e._duration / e._timelineDivision;
        e._timelineTiming = e._timelineTiming.map(x => x * temp);
        e._timelineDuration = e._timelineDuration.map(x => x * temp);
        // TO PREVENT UNDEFINED
        e._timelineTiming[-1] = 0;
        e._transformation[-1] = e._initialStyle;
    }

    static _computedToInlineCSS(source, dest, arr) {
        let targetStyles = getComputedStyle(source);
        for(let i = 0 ; i < arr.length ; i++) {
            dest.style[arr[i]] = targetStyles.getPropertyValue(arr[i]);
        }
    }

    
    static _initializePin(e) {
        // CREATE WRAPPER
        // HOLD INITIAL TARGET TOP POSITION
        e._initialTargetTop = OnScroll._getYOffsetDocument(e._triggerElem);
        const wrapper = document.createElement("div");
        let targetStyles = getComputedStyle(e._targetElem);
        wrapper.style["background-color"] = "yellow";
        wrapper.style["position"] = "relative";
        wrapper.style["max-width"] = (parseFloat(targetStyles.getPropertyValue("padding-left"))
                                        + parseFloat(targetStyles.getPropertyValue("padding-right"))
                                        + parseFloat(targetStyles.getPropertyValue("width"))) + "px";
        // SET WRAPPER MARGINS
        OnScroll._computedToInlineCSS(e._targetElem, wrapper, [
            "margin-left",
            "margin-right",
            "margin-top",
            "margin-bottom"
        ]);

        // CONSTRAIN WIDTH
        e._targetElem.style["min-width"] = e._targetElem.style["max-width"] = targetStyles.getPropertyValue("width");
        e._targetElem.style["min-height"] = e._targetElem.style["max-height"] = targetStyles.getPropertyValue("height");

        // SET TARGET STYLES
        OnScroll._computedToInlineCSS(e._targetElem, e._targetElem, [
            "padding-left",
            "padding-right",
            "padding-top",
            "padding-bottom",
            "border-left-width",
            "border-right-width",
            "border-top-width",
            "border-bottom-width"
        ]);
        
        // REMOVE MARGINS
        e._targetElem.style["margin"] = "0px";
        e._targetElem.style["width"] = "auto";

        if(e._pin == __PIN_TYPES__.__FIXED_LENGTH__) {
            wrapper.style["padding-bottom"] = e._duration + "px";
            e._eventChecker = OnScroll._fixPinFix;
        } else {
            e._eventChecker = OnScroll._fixPinFull;
        }
        //e._eventChecker = null;
        // PARENT OF TARGET
        const parent = e._targetElem.parentNode;
        // SET WRAPPER AS PARENT INSTEAD OF TARGET
        parent.replaceChild(wrapper, e._targetElem);
        wrapper.appendChild(e._targetElem);
    }

    
    static _addIndicators(e) {
        if (!e._showIndicator) return;
        let top = OnScroll._getYOffsetDocument(e._triggerElem);
        OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGERHOOK__, e._triggerPosition);
        OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGERELEM__, top);
        if(e._onscroll || e._pin == __PIN_TYPES__.__FIXED_LENGTH__) {
            OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGEREND__, top + e._duration)
        }
    }

    // VALUES CAN BE PASSED IN % VH AND VW
    static _parseUnit(x, elem) {
        if(typeof x === "number") {
            return x;
        } else {
            let val = parseInt(x) / 100;
            if(x.includes("vh")) {
                return window.screen.height * val;
            }  else if(x.includes("vw")) {
                return window.screen.width * val;
            } else if(x.includes("%")) {
                return elem.offsetWidth * val;
            }
        }
    }
}


class OnScrollEvent {

    
    constructor() {

        // ESSENTIALS
        this._triggerElem = null;
        this._targetElem = null;
        this._triggerPosition = 50;
        this._duration = 1;
        this._transformation = null;
        // HOLDS STYLE OBJECT OBJECT
        this._transformationObject = {};
        // INITIAL EVENT STATE
        this._eventState = __EVENT_STATES__.__INITIAL__;
        // HOLDS INLINE STYLE STRING
        this._initialStyle = "";
        // TRASITION EASING FUNCTION
        this._transitionEase = "";
        // THIS IS EVENT SPECIFIC
        this._eventChecker = null;        
    }

    
    setTrigger(elem) {
        // SETS TRIGGER ELEMENT
        this._triggerElem = document.querySelector(elem);
        return this;
    }

    
    setTarget(elem) {
        // SETS TARGET ELEMENT
        this._targetElem = document.querySelector(elem);
        return this;
    }

    
    setTriggerPosition(pos) {
        // SETS TRIGGER POSTIION RELATIVE TO VIEWPORT % FROM TOP
        this._triggerPosition = document.documentElement.clientHeight * (pos / 100);
        return this;
    }

    
    setTransformation(obj, ease = "linear") {
        // SETS THE TRANSFORMATION TO BE APPLIED ON THE TARGET ELEMENT
        // FIRST SAVE THE DEFAULT INLINE STYLE
        this._initialStyle = this._targetElem.getAttribute("style") || "";
    
        // IF TIMELINE IS PASSED
        if (obj instanceof OnScrollEventTimeline) {
            this._timeLine = true;            
            this._transformationObject = obj._transformationArray;
        } else {
            this._transformationObject = obj;
            this._transformation = (this._initialStyle === ""? "" : this._initialStyle + ";") + OnScroll._objectToInlineCSS(obj);
            this._transitionEase = ease;
        }
        return this;
    }
    
    
    setDuration(x) { 
        // SETS DURATION FOR TRANSITION
        this._duration = x;
        return this;
    }

    
    setScrollLength(x) {
        // SET SCROLL LENGTH FROM TRANSITION
        this._onscroll = true;
        this._duration = x;
        return this;
    }

    
    setPin(x = undefined) {
        if(x) {
            this._pin = __PIN_TYPES__.__FIXED_LENGTH__;
            this._duration = x;
        } else {
            this._pin = __PIN_TYPES__.__FULL_LENGTH__;
        }
        return this;
    }

    
    showIndicators() {
        // CREATES INDICATOR
        this._showIndicator = true;
        return this;
    }

    
    addTo(obj) {
        // FINALIZE EVENT TO ADD TO EVENT CONTROLLER
        // ADDS EVENT TO DISPATCH ARRAY
        // COMMON PROPERTIES INITIALIZATION
        OnScroll._initialize(this);
        if(this._onscroll && this._timeLine) {
            OnScroll._initializeTimeline(this);
            OnScroll._initializeDurationTimeline(this);
        } else if(this._onscroll) {
            OnScroll._initializeDuration(this);
        } else if(this._timeLine) {
            OnScroll._initializeTimeline(this);
        } else if(this._pin) {
            OnScroll._initializePin(this);
        } else {
            OnScroll._initializeSimple(this);
        }

        OnScroll._addIndicators(this);
        obj._events.push(this);
        return this;
    }
}

class OnScrollEventTimeline {
    
    
    constructor() {
        this._transformationArray = [];
        return this;
    }

    
    add(x, t = 1, f = "linear") {
        if(typeof t === "string") {
            f = t; 
            t = 1;
        }
        this._transformationArray.push({
            "transformation": x,
            "duration": t,
            "ease": f
        });
        return this;
    }
}