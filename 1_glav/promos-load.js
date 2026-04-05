(function () {
  function apply(urls) {
    for (var i = 0; i < 3; i++) {
      var el = document.getElementById('promo-img-' + i);
      if (el && urls[i]) {
        el.src = urls[i];
      }
    }
  }

  fetch('/api/promos')
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data && data.urls) apply(data.urls);
    })
    .catch(function () {});

})();
