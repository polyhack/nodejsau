const AU_LOCATION_REGEX =
        /\Wau(s|st)?\W|australia|straya|sydney|melbourne|brisbane|perth|darwin|adelaide|canberra|\W(nsw|vic|qld|new south wales|victoria|queensland|western australia|northern territory|south australia|tasmania)\W/i
      // secondary guess, does your blog UI end with .au?
    , AU_BLOG_REGEX     = /\.au$/i

module.exports = function (data) {
  if (data.location && AU_LOCATION_REGEX.test(data.location)) return true
  if (data.blog && AU_BLOG_REGEX.test(data.blog)) return true
  return false
}
