document.getElementById("search-back-btn").addEventListener("click", () => {
    console.log("what");
    window.open('/' + "#search_results", "_self");
});

var grid = document.querySelector('#iso-grid');
var iso = new Isotope( grid, {
  itemSelector: '.grid-item',
  masonry: {
    columnWidth: 80
  }
});

grid.addEventListener( 'click', function( event ) {
  var target = event.target;
  // only click on itemContent
  gsap.set(target.children[0], {
    css: {
        zIndex: -2
    }
  });
  gsap.to(target.children[0], {
    opacity: 0,
    duration: 0.3,
    ease: "power2.inOut"
  });
  if ( !target.classList.contains('grid-item-content') ) {
    return;
  }
  var itemElem = target.parentNode;
  itemElem.classList.toggle('is-expanded');

  if (itemElem.classList.contains("is-expanded")){
    gsap.set(target.children[0], {
        css: {
            zIndex: 2
        }
    });
    gsap.to(target.children[0], {
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut"
    });
  }
//   target.children[0].classList.toggle('hidden');
  iso.layout();
});