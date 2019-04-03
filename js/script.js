const onscroll = new OnScroll();

const timelineLeft = new OnScrollEventTimeline();
timelineLeft.add({"width": "50%"}, 3,  "cubic")
            .add({"background-color": "red", "color": "yellow"}, 2, "cubic")
            .add({"transform": "rotateY(360deg) scale(1.5)"}, 5, "cubic-bezier(.18, .89, .32, 1.28)");

const timelineRight = new OnScrollEventTimeline();
timelineRight.add({"right": "50%"}, 0.5)
            .add({"background-color": "cyan", "color": "black"}, 0.5)
            .add({"transform": "rotateY(360deg) scale(1.5)"}, 0.5);

// var controller = new ScrollMagic.Controller();
// var scene = new ScrollMagic.Scene({
//     triggerElement: "#box1",
//     duration: 300,
// })
// .setPin("#box1")
// .addIndicators({name: "1 (duration: 300)"})
// .addTo(controller);

// WHILE CALLING FUNCTIONS THIS SEQUENCE MUST BE FOLLOWED

// const scene1 = new OnScrollEvent() 
//                 .setTarget("#box1")
//                 .setTrigger("#box1")
//                 .setTriggerPosition(50)
//                 .toggleCSS("test")
//                 .replaceCSS("box", "box2")
const scene1 = new OnScrollEvent()
                .setTarget("#parallax1 > div")
                .setTrigger("#parallax1")      
                .setTriggerPosition(100)
                .setScrollLength("200vh")
                .setTransformation({
                    "transform": `translate3d(0,0,0) translateY(80%)`,
                }, "linear")
                
                // .showIndicators()
                .addTo(onscroll);
				const scene2 = new OnScrollEvent()
                .setTarget("#parallax2 > div")
                .setTrigger("#parallax2")      
                .setTriggerPosition(100)
                .setScrollLength("200vh")
                .setTransformation({
                    "transform": `translate3d(0,0,0) translateY(80%)`,
                }, "linear")
                
                // .showIndicators()
                .addTo(onscroll);
				const scene3 = new OnScrollEvent()
                .setTarget("#parallax3 > div")
                .setTrigger("#parallax3")      
                .setTriggerPosition(100)
                .setScrollLength("200vh")
                .setTransformation({
                    "transform": `translate3d(0,0,0) translateY(80%)`,
                }, "linear")
                
                // .showIndicators()
                .addTo(onscroll);






// const scene2 = new OnScrollEvent() 
//                 .setTarget("#box1")
//                 .setTrigger("#box1")
//                 .setTriggerPosition(50)
//                 .setPin(400)
//                 .addTo(onscroll);

// const scene5 = new OnScrollEvent()
//                 .setTarget("#box1")
//                 .setTrigger("#box1")
//                 .setTriggerPosition(51)
//                 .setTransformation({
//                     "background-color": "yellow",
//                     "transform": "rotateY(360deg)"
//                 }, "cubic")
//                 .setDuration(1)
//                 .setScrollLength(200)
//                 .showIndicators()
//                 .addTo(onscroll);



                // .addTo(onscroll);  

// const scene2 = new OnScrollEvent()
//                 .setTarget("#box1")
//                 .setTrigger("#box1")
//                 .setTriggerPosition(50)
//                 .setTransformation(timelineLeft)
//                 // .setScrollLength(200)
//                 .showIndicators()
//                 .addTo(onscroll);  
