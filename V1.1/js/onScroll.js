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
    "__RUNNING_FORWARD__": 3,       //TIMELINE IS RUNNING FORWARD
    "__RUNNING_REVERSE__": 4        //TIMELINE IS RUNNING REVERSE
});

// TRANSITIONS WITH NO DURATIONS ARE COMPLETLY CONTROLLED BY THE BROWSER
// SIMPLE UNCONTROLLED TRANSITION AND DETRANSITION              [X]
// TIMELINED BASED UNCONTROLLED TRANISITION AND DETRANSITION    [X]
// PINNING                                                      [X]
// JS EXCEUTION AND DEXECUTIION                                 [X]
// CSS CLASSING AND DECLASSING                                  [X]

// TO BE IMPLEMENTED

// PARALLAX                                                     [ ]
// TRANSITION BASED ON SCROLL AMOUNT                            [ ]
// SCROLL BASED TIMELINE                                        [ ]
// SCROLL BASED PINNING                                         [ ]


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
        return elem.getBoundingClientRect().top;
    }



    //SETUP WINDOW SCROLL EVENT LISTENERS AND CHECKS FOR EVENTS
    _setupListeners() {
        let raf = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;
        _WINDOW_SCROLL_POSITION_ = window.pageYOffset;
        var _PREVIOUS_POSITION_ = -1;
        var _ONS_ = this;

        function _RAF_() {
            _WINDOW_SCROLL_POSITION_ = window.pageYOffset;
            if(_WINDOW_SCROLL_POSITION_ === _PREVIOUS_POSITION_) {

            } else {
                for (const e of _ONS_._events) {
                    // EACH EVENT HAS REFRENCE TO IT'S OWN EVENT CHECKER
                    e._eventChecker(e);     //CHECKS STATES AND EXECUTES EVENTS
                }
                _PREVIOUS_POSITION_ = _WINDOW_SCROLL_POSITION_;
            }
            raf(_RAF_);
        }
        _RAF_();
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

    // VALUES CAN BE PASSED IN % VH AND VW
    static _parseUnit(x) {
        if (typeof x === "number") {
            return x;
        } else if (x.includes("%")) {
            let val = parseInt(x) / 100;
            return window.screen.availHeight * val;
        }
    }

    static _play(e) {
        if (e._timelineIndex < e._timeline.length) {

            var transition = e._timeline[e._timelineIndex];
            let eStyle = transition.elem.style;

            for (const [x, y] of Object.entries(transition.transformation)) {
                transition.initialStyles[x] = eStyle[x];
                eStyle[x] = y;
            }

            eStyle["transition-duration"] = transition.duration + "s";
            eStyle["transition-property"] = transition.transitionProperties;
            eStyle["transition-timing-function"] = transition.ease;

            var transitionPropertiesLength = transition.transitionPropertiesLength;

            e._extras._timelineHandler = function () {
                if (transitionPropertiesLength == 0) {
                    transition.elem.removeEventListener("transitionend", e._extras._timelineHandler);
                    e._timelineIndex++;
                    OnScroll._play(e);
                } else {
                    transitionPropertiesLength--;
                }
            }

            transition.elem.addEventListener("transitionend", e._extras._timelineHandler);

            e._timelineState = __EVENT_STATES__.__RUNNING_FORWARD__;
        } else {
            // MARK THE EVENT AS FINISED
            e._timelineIndex--;
            e._timelineState = __EVENT_STATES__.__FINISHED__;
        }
    }

    static _reverse(e) {
        if (e._timelineIndex >= 0) {
            let transition = e._timeline[e._timelineIndex];
            let eStyle = transition.elem.style;

            for (const [x, y] of Object.entries(transition.initialStyles)) {
                if (!y) {
                    eStyle.removeProperty(x);
                } else {
                    eStyle[x] = y;
                }
            }
            eStyle["transition-duration"] = transition.duration + "s";
            eStyle["transition-property"] = transition.transitionProperties;
            eStyle["transition-timing-function"] = transition.ease;

            var transitionPropertiesLength = transition.transitionPropertiesLength;

            e._extras._timelineHandler = function () {
                if (transitionPropertiesLength == 0) {
                    transition.elem.removeEventListener("transitionend", e._extras._timelineHandler);
                    e._timelineIndex--;
                    OnScroll._reverse(e);
                } else {
                    transitionPropertiesLength--;
                }
            }

            transition.elem.addEventListener("transitionend", e._extras._timelineHandler);

            e._timelineState = __EVENT_STATES__.__RUNNING_REVERSE__;
        } else {
            // MARK THE EVENT AS FINISED
            e._timelineIndex++;
            e._timelineState = __EVENT_STATES__.__INITIAL__;
        }
    }

    static _createEventChecker(e) {
        // ESTYLE
        // IT IS A REFRENCE TO STYLE PROPERTY OF THE TARGET ELEMENT
        const setEStyle = `
        let eStyle = e._targetTransformationElem.style;`

        // TRANSITION PROPERTIES
        // IT SETS THE VARIOUS PARAMS RELATING TO TRANSITION 
        let setTransitionProperties = `
        var x = eStyle;
        eStyle["transition-property"] = "${e._transitionProperties}";
        eStyle["transition-duration"] = "${e._transitionDuration}s";
        eStyle["transition-timing-function"] = "${e._transitionEase}";
        clearInterval(e._extras._timeoutHandler);
        e._extras._timeoutHandler = setTimeout(function() {
            x.removeProperty("transition-duration");
            x.removeProperty("transition-timing-function");
            x.removeProperty("transition-property");
        }, ${e._transitionDuration * 1000});`

        // FIXING PIN
        let pinPropertiesENTER = `
        e._targetPinElem.style["position"] = "fixed";
        e._targetPinElem.style["top"] = "${e._triggerPosition}px";
        e._targetPinElem.style.removeProperty("bottom");`

        // RELEASING PIN
        let pinPropertiesEXIT = `
        e._targetPinElem.style.removeProperty("position")
        e._targetPinElem.style.removeProperty("top")`;

        // FOR DURATION BASED
        let pinPropertiesEXITDuration = `
        e._targetPinElem.style["position"] = "absolute";
        e._targetPinElem.style["bottom"] = -e._targetPinElem.clientHeight + "px";
        e._targetPinElem.style["top"] = "auto";`

        // APPLIES STYLES FROM TRANSFORMATION OBJECT
        let applyTransformation = `
        for(const [x, y] of Object.entries(e._transformationObject)) {
            eStyle[x] = y;
        }`;

        // REMOVES STYLES APPLIED BY TRANSFORMATION OBJECT TO INITIAL
        let removeTransformation = `
        for(const [x, y] of Object.entries(e._initialStyleObject)) {
            eStyle[x] = y;
        }`;

        let checkTimelineEnter = `
        // CHECKS
        if(e._timelineState == __EVENT_STATES__.__INITIAL__) {
            // PLAY IT
            OnScroll._play(e);
        } else {
            // RESTART IT
            e._timeline[e._timelineIndex].elem.removeEventListener("transitionend", e._extras._timelineHandler);
            OnScroll._play(e);
        }`;

        let checkTimelineExit = `
        if(e._timelineState == __EVENT_STATES__.__FINISHED__) {
            // REVERSE IT
            OnScroll._reverse(e);
        } else if(e._timelineState == __EVENT_STATES__.__RUNNING_FORWARD__) {
            // CANCEL IT
            e._timeline[e._timelineIndex].elem.removeEventListener("transitionend", e._extras._timelineHandler);
            OnScroll._reverse(e);
        }`;

        let funcString = "";

        if (e._duration) {
            funcString += "(function (e) {";
            // DURATION BASED
            if (e._transformationObject || e._timeline || e._extras.css || e._targetPinElem || e._extras.exit) {
                funcString += `
                
                    if(_WINDOW_SCROLL_POSITION_ < ${e._scrollPosition} && e._eventState != ${__EVENT_STATES__.__INITIAL__}) {
                        
                        // SET ESTYLE    
                        ${e._transformationObject ? setEStyle : ""}

                        // SIMPLE TRANSITION
                        ${e._transformationObject ? removeTransformation : ""}
                        ${e._transformationObject ? setTransitionProperties : ""}

                        // TIMELINE
                        ${e._timeline ? checkTimelineExit : ""}

                        // CSS AND JS
                        ${e._extras.exit ? e._extras.exit : ""}
                        ${e._extras.exitTop ? e._extras.exitTop : ""}
                        ${e._extras.css ? e._extras.css : ""}

                        // PINNING
                        ${e._targetPinElem ? pinPropertiesEXIT : ""}

                        e._eventState = ${__EVENT_STATES__.__INITIAL__};

                    } else`;
            }
            funcString += `
                if(_WINDOW_SCROLL_POSITION_ > ${e._scrollPosition} && _WINDOW_SCROLL_POSITION_ < ${e._scrollPositionEnd}) {
                    
                    var offset  = _WINDOW_SCROLL_POSITION_ - e._scrollPosition;
                    var duration = e._duration;
                    `;
            if (e._transformationObject || e._timeline || e._extras.css || e._targetPinElem || e._extras.eenter) {
                funcString +=
                    `if(e._eventState != ${__EVENT_STATES__.__RUNNING__}) {
                        
                            // SET ESTYLE    
                            ${e._transformationObject ? setEStyle : ""}
                            
                            // SIMPLE TRANSITION
                            ${e._transformationObject ? applyTransformation : ""}
                            ${e._transformationObject ? setTransitionProperties : ""}
        
                            // TIMELINE
                            ${e._timeline ? checkTimelineEnter : ""}

                            // CSS AND JS
                            ${e._extras.enter ? e._extras.enter : ""}
                            ${e._extras.css ? e._extras.css : ""}
                            

                            // PINNING
                            ${e._targetPinElem ? pinPropertiesENTER : ""}
                            
                        } `
            }
            funcString +=
                `${e._extras.progress ? e._extras.progress : ""}`;
            funcString +=
                `e._eventState = ${__EVENT_STATES__.__RUNNING__};}`


            if (e._transformationObject || e._timeline || e._extras.css || e._targetPinElem || e._extras.exit) {
                funcString +=
                    `else if(_WINDOW_SCROLL_POSITION_ > ${e._scrollPositionEnd} && e._eventState != ${__EVENT_STATES__.__FINISHED__}) {
                        
                        // SET ESTYLE    
                        ${e._transformationObject ? setEStyle : ""}

                        // SIMPLE TRANSITION
                        ${e._transformationObject ? removeTransformation : ""}
                        ${e._transformationObject ? setTransitionProperties : ""}

                        // TIMELINE
                        ${e._timeline ? checkTimelineExit : ""}

                        // CSS AND JS
                        ${e._extras.exit ? e._extras.exit : ""}
                        ${e._extras.css ? e._extras.css : ""}
                        ${e._extras.exitBottom ? e._extras.exitBottom : ""}
                        e._eventState = ${__EVENT_STATES__.__FINISHED__} ;

                        // PINNING
                        ${e._targetPinElem ? pinPropertiesEXITDuration : ""}
                    }`;

            }
            funcString += "})";
        } else {

            funcString = `
                
            (function(e) {
                
                if (_WINDOW_SCROLL_POSITION_ > ${e._scrollPosition} && e._eventState == ${__EVENT_STATES__.__INITIAL__}) {    

                    // SET ESTYLE    
                    ${e._transformationObject ? setEStyle : ""}
                    
                    // SIMPLE TRANSITION
                    ${e._transformationObject ? applyTransformation : ""}
                    ${e._transformationObject ? setTransitionProperties : ""}

                    // TIMELINE
                    ${e._timeline ? checkTimelineEnter : ""}
                    
                    // CSS AND JS
                    ${e._extras.enter ? e._extras.enter : ""}
                    ${e._extras.css ? e._extras.css : ""}
                    
                    // PINNING
                    ${e._targetPinElem ? pinPropertiesENTER : ""}

                    //SET EVENT STATE
                    e._eventState = ${__EVENT_STATES__.__FINISHED__}

                } else if (_WINDOW_SCROLL_POSITION_ < ${e._scrollPosition} && e._eventState == ${__EVENT_STATES__.__FINISHED__}) {

                    // SET ESTYLE    
                    ${e._transformationObject ? setEStyle : ""}

                    // SIMPLE TRANSITION
                    ${e._transformationObject ? removeTransformation : ""}
                    ${e._transformationObject ? setTransitionProperties : ""}

                    // TIMELINE
                    ${e._timeline ? checkTimelineExit : ""}

                    // CSS AND JS
                    ${e._extras.exit ? e._extras.exit : ""}
                    ${e._extras.css ? e._extras.css : ""}
                    
                    // PINNING
                    ${e._targetPinElem ? pinPropertiesEXIT : ""}

                    // SET EVENT STATE
                    e._eventState = ${__EVENT_STATES__.__INITIAL__}
                }})`;
        }

        // funcString = funcString.replace(/\/\/.*\n/gm, "");
        // funcString = funcString.replace(/[\n\t]/gm, "");
        // funcString = funcString.replace(/\s{2,}/gm, "");
        return eval(funcString);
    }
    static _computedToInlineCSS(source, dest, arr) {
        let targetStyles = getComputedStyle(source);
        for (let i = 0; i < arr.length; i++) {
            dest.style[arr[i]] = targetStyles.getPropertyValue(arr[i]);
        }
    }

}

class OnScrollEvent {

    constructor(obj) {

        this._triggerElem = document.querySelector(obj.triggerElement)

        // IF TRIGGER NOT FOUND OR PASSED
        if (!this._triggerElem)
            throw "INVALID TRIGGER ELEMENT";
        this._triggerPosition = obj.triggerPosition != undefined? (obj.triggerPosition / 100) : 0;
        this._triggerPosition *= (window.screen.height);
        this._duration = obj.duration != undefined? OnScroll._parseUnit(obj.duration) : 0;
        this._scrollPosition = OnScroll._getYOffsetDocument(this._triggerElem) - this._triggerPosition;
        this._scrollPositionEnd = this._scrollPosition + this._duration;

        // STORES EXTRA DATA
        this._extras = {};
        // INITIAL EVENT STATE
        this._eventState = __EVENT_STATES__.__INITIAL__;
    }

    setTransformation(elemOrTimeline, transformation, duration, ease) {
        // SETS THE TRANSFORMATION TO BE APPLIED ON THE TARGET ELEMENT

        // IF TIMELINE IS PASSED
        if (elemOrTimeline instanceof OnScrollEventTimeline) {
            this._timeline = elemOrTimeline._transformationArray;
            this._timelineIndex = 0;
            this._timelineHandler = null;
            this._timelineState = __EVENT_STATES__.__INITIAL__;

        } else {

            this._targetTransformationElem = document.querySelector(elemOrTimeline);

            // IF TARGET NOT FOUND
            if (!this._targetTransformationElem) {
                throw "INVALID TRANSFORMATION ELEMENT"
            }

            this._transformationObject = transformation;
            this._transitionEase = ease;
            this._transitionDuration = duration;
            this._transitionProperties = "";
            this._initialStyleObject = {};
            this._computedStyles = getComputedStyle(this._targetTransformationElem)
            for (const x of Object.keys(transformation)) {
                this._initialStyleObject[x] = this._computedStyles.getPropertyValue(x);
                this._transitionProperties += x + ",";
            }
            this._transitionProperties = this._transitionProperties.slice(0, this._transitionProperties.length - 1);

        }


        return this;
    }

    toggleCSS(elem, cls) {
        if (!document.querySelector(elem)) {
            throw "INVALID ELEMENT PASS TO TOGGLECSS"
        }
        if (!this._extras.css) this._extras.css = "";
        this._extras.css += `document.querySelector("${elem}").classList.toggle("${cls}");\n`;
        return this;
    }

    on(state, callback) {
        for (const s of state.split(" ")) {
            switch (s) {
                case "enter":
                    if (!this._extras.enter) this._extras.enter = "";
                    this._extras.enter += `(${callback})();\n`;
                    break;
                case "exit":
                    if (!this._extras.exit) this._extras.exit = "";
                    this._extras.exit += `(${callback})();\n`;
                    break;
                case "progress":
                    if (!this._extras.progress) this._extras.progress = "";
                    this._extras.progress += `(${callback})();\n`;
                    break;
                case "exit-top":
                    if(!this._extras.exitTop) this._extras.exitTop = "";
                    this._extras.exitTop += `(${callback})();\n`;
                    break;
                case "exit-bottom":
                    if(!this._extras.exitBottom) this._extras.exitBottom = "";
                    this._extras.exitBottom += `(${callback})();\n`;
                    break;
            }
        }
        return this;
    }

    setPin(elem) {
        this._targetPinElem = document.querySelector(elem);
        if (!this._targetPinElem) {
            throw "INVALID PIN ELEMENT";
        }
        if (this._duration) {

            const wrapper = document.createElement("div");

            wrapper.style["position"] = "relative";
            wrapper.style["height"] = this._duration + "px";

            // PARENT OF TARGET
            const parent = this._targetPinElem.parentNode;
            // SET WRAPPER AS PARENT INSTEAD OF TARGET
            parent.replaceChild(wrapper, this._targetPinElem);
            wrapper.appendChild(this._targetPinElem);
        }
        return this;
    }

    showIndicators() {
        // CREATES INDICATOR
        let top = OnScroll._getYOffsetDocument(this._triggerElem);
        OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGERHOOK__, this._triggerPosition);
        OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGERELEM__, top);
        if (this._duration) {
            OnScroll._createIndicator(__INDICATOR_TYPES__.__TRIGGEREND__, top + this._duration)
        }
        return this;
    }

    addTo(obj) {
        this._eventChecker = OnScroll._createEventChecker(this);
        if (obj instanceof OnScroll) {
            obj._events.push(this);
        } else {
            throw "INVALID HANDLER";
        }
        return this;
    }
}

class OnScrollEventTimeline {
    constructor() {
        this._transformationArray = [];
        return this;
    }

    add(elem, x, t = 1, f = "linear") {
        if (typeof t === "string") {
            f = t;
            t = 1;
        }
        let element = document.querySelector(elem);
        if (!element)
            throw "INVALID ELEMENT PASSED TO TIMLINE";

        let transitionProperties = "";
        let initialStyles = {};
        let transitionPropertiesLength = -1;

        for (const k of Object.keys(x)) {
            transitionProperties += k + ",";
            transitionPropertiesLength++;
        }

        transitionProperties = transitionProperties.slice(0, transitionProperties.length - 1);

        let obj = {
            "elem": document.querySelector(elem),
            "transformation": x,
            "duration": t,
            "ease": f,
            "transitionProperties": transitionProperties,
            "initialStyles": initialStyles,
            "transitionPropertiesLength": transitionPropertiesLength
        }

        this._transformationArray.push(obj);
        return this;
    }
}