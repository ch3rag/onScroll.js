var event = new OnScrollEvent({
    triggerElement: "#animate",
    triggerPosition: "middle"
})
.setTransformation("#animate", {
    "background-color": "red",
    "transform": "scale(2)"
})