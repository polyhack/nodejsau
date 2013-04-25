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
})