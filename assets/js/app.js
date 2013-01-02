/*global $*/
$.domReady(function () {
  var $activePopover

  $('a[rel=popover]')
    .popover()
    .on('click', function(e) {
      e.preventDefault()
      $activePopover = $(e.target)
    })

  // close popover if there is one active and a click is registered anywhere else
  $('body').on('click', function (e) {
    if ($activePopover && !$(e.target).closest('.popover,a[rel=popover]').length) {
      $activePopover.popover('hide')
      $activePopover = null
    }
  })
})