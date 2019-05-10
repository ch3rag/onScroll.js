const onscroll = new OnScroll();

var divBg = document.querySelector("#parallax1");
const ev = new OnScrollEvent({
    triggerElement: "#parallax1",
    triggerPosition: 0,
    duration: "100%"
}).on("progress",  () => {
    divBg.style["transform"] = `translate3d(0,0,0)`;
    divBg.style["background-position-y"] = `${offset/duration * 120}%`;
}).showIndicators()
.addTo(onscroll);
