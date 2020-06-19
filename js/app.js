
document.addEventListener('DOMContentLoaded', (event) => {
    _addingSegmentClickListener();
    _detailsSectionScrollableByMouse();
});



function _addingSegmentClickListener () {
    const buttons = document.querySelectorAll('#units-section div.toggle button');
    buttons.forEach((btn, index) => {
        btn.onclick = () => {
            const otherBtnIndex = index ? 0 : 1;
            btn.classList.add("selected");
            buttons[otherBtnIndex].classList.remove("selected");
        }
    })
    console.log('#DEBUG => ', buttons);
}

function _detailsSectionScrollableByMouse() {
    const target = document.querySelector('.details-section')

    target.addEventListener('wheel', event => {
        const toLeft  = event.deltaY < 0 && target.scrollLeft > 0
        const toRight = event.deltaY > 0 && target.scrollLeft < target.scrollWidth - target.clientWidth

        if (toLeft || toRight) {
            // event.preventDefault()
            target.scrollLeft += event.deltaY
        }
    });
}



