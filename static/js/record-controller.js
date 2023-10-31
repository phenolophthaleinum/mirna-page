/*!
 * Record page controller
 * Copyright 2023 Maciej Michalczyk
 *
*/

// back button in record handler
document.getElementById("search-back-btn").addEventListener("click", () => {
    // console.log("what");
    window.open('/' + "#search_results", "_self");
});

// isotope grids handlers (big grid without expandables and the rest with expandables)
var grids = document.querySelectorAll('.iso-grid');
var big_grid = document.querySelector('.iso-grid-big')

var big_iso = new Isotope(big_grid, {
  itemSelector: '.grid-item',
  stagger: 10,
  // percentPosition: true,
  masonry: {
    columnWidth: 150,
    gutter: 8,
    fitWidth: true
    }
});

grids.forEach((grid) => {
  var iso = new Isotope( grid, {
    itemSelector: '.grid-item',
    stagger: 10,
    // percentPosition: true,
    masonry: {
      columnWidth: 20,
      gutter: 8,
      fitWidth: true
    }
  });

  grid.addEventListener( 'click', function( event ) {
    var target = event.target;
    var expandable = target.querySelector('.expandable');
    target.style.gridTemplateColumns = '1fr';
    gsap.set(expandable, {
      css: {
          zIndex: -2
      }
    });
    gsap.to(expandable, {
      opacity: 0,
      scale: 0.5,
      duration: 0.3,
      ease: "power2.inOut"
    });
    if ( !target.classList.contains('grid-item-content') ) {
      return;
    }
    var itemElem = target.parentNode;
    itemElem.classList.toggle('is-expanded');

    if (itemElem.classList.contains("is-expanded")){
      target.style.gridTemplateColumns = '1fr 2fr';
      gsap.set(expandable, {
          css: {
              zIndex: 2
          }
      });
      gsap.to(expandable, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.inOut"
      });
    }
  //   target.children[0].classList.toggle('hidden');
    iso.layout();
  });
});