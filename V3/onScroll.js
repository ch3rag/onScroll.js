OnScroll = {};
OnScroll.handleScroll = function(entries, observer) {
    entries.forEach(function(entry) {
        console.log(entry);
    })
}

OnScroll.init = function() {
    OnScroll.intersectionObserverDefault = new IntersectionObserver(OnScroll.handleScroll, {
        root: null,
        rootMargin: "-50%"
    });
}

OnScroll.init();

class OnScrollEvent {
    constructor(obj) {
        this.triggerElem = document.querySelector(obj.triggerElement);
        if(!this.triggerElem) {
            throw "INVALID TRIGGER"
        }

        switch(obj.triggerPosition) {
            case "top": 
                this.triggerPosition = "top";
                break;
            case "middle": 
                this.triggerPosition = "middle";
                OnScroll.intersectionObserverDefault.observe(this.triggerElem);
                break;
            case "bottom": 
                this.triggerPosition = "bottom";
                break;
            default: 
                this.triggerPosition = "middle";
                break;
        }
    }

    setTransformation(elem, transformation, duration = 1, ease = "linear") {
        this.targetTransformationElement = document.querySelector(elem);
        this.transformationObject = transformation;
        this.revertTransformationObject = {};

        if(!this.targetTransformationElement) {
            throw "Invalid Target"
        }                        
        
        // EXTRACT TRANSFORMATION PROPERTIES
        let transitionProperty = "";
        for (const x of Object.keys(transformation)) {
            transitionProperty += x + ",";
            this.revertTransformationObject[x] = this.targetTransformationElement.style[x];
        }

        transitionProperty = transitionProperty.slice(0, transitionProperty.length - 1);

        let transitionAttributes = {
            "transitionProperty": transitionProperty,
            "transitionDuration": duration + "s",
            "transitionTimingFunction": ease
        }

        // SAVE REVERT STYLES
        Object.assign(this.revertTransformationObject, transitionAttributes);
        Object.assign(this.transformationObject, transitionAttributes)
        let transformationString = "";
        for(const [x, y] of Object.entries(this.transformationObject)) {
            transformationString += x + "=" + y + " ";
        }
        this.targetTransformationElement.setAttribute("data-onscroll-transformtion", transformationString);
        this.transform = true;
        
    }
}