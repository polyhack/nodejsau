/*global $*/
$.domReady(function () {
  var $activePopover
    , cleanupPopover = function () {
        if (!$activePopover) return
        $activePopover.popover('hide')
        $activePopover = null
      }

  // close popover if there is one active and a click is registered anywhere else
  $('body').on('click', function (e) {
    $activePopover
      && !$(e.target).closest('.popover,a[rel=popover]').length
      && cleanupPopover()
  })

  $('a[rel=popover]')
    .popover()
    .on('click', function(e) {
      e.preventDefault()
      cleanupPopover()
      $activePopover = $(e.target)

      var $tip = $activePopover.data('popover').$tip
        , top  = $tip.css('top').replace(/px$/, '') * 1

      if (top < 70) {
        $tip.css({ top: '70px' })
        $tip.down('.arrow').css('top', $activePopover.offset().top - 70 + 8)
      }

      $tip.down('.description').each(function () {
        this.innerHTML = this.innerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      })
    })

  //// Navigation/Page Stuff ////

  $(window).on('hashchange', function() {
    showPage(document.location.hash)
  })

  showPage(document.location.hash)

  function showPage(name) {
    const HOME_PAGE = 'posts'

    name = name.replace(/^#/, '') // normalise, remove leading #

    // default name to HOME_PAGE
    name = name || HOME_PAGE

    // go to location if it not already there
    if (document.location.hash !== '#' + name) {
      document.location.hash = name
      return
    }

    // hide other pages
    $('.page').hide()

    // find target
    var targetPage = $('.page.'+name)

    // display target if exists otherwise go home.
    if (targetPage.length) targetPage.show()
    else showPage(HOME_PAGE)
  }

  // Navigation menu updates

  $(window).on('hashchange', function() {
    setActiveNav(document.location.hash)
  })

  setActiveNav(document.location.hash)

  // Highlight the active navigation item
  function setActiveNav(name) {
    $('.nav a').removeClass('active')
    $('.nav a[href='+name+']').addClass('active')
  }

})
