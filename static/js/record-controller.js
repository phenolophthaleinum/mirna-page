document.getElementById("search-back-btn").addEventListener("click", () => {
    console.log("what");
    window.open('/' + "#search_results", "_self");
});

var grids = document.querySelectorAll('.iso-grid');
// console.log(grid);
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
    // only click on itemContent
    // var childs = target.children[0];
    // var last = childs.children.length - 1;
    console.log(target);
    var expandable = target.querySelector('.expandable');
    // console.log(childs.children)
    console.log(expandable);
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