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
    })
})