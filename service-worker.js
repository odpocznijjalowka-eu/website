self.addEventListener('install', event => {
    //force new service worker when one is waiting
    self.skipWaiting();
    event.waitUntil(
        caches.open('v1').then(cache => {
            //docać /webwaver_front dla deva
            return cache.addAll(['/manifest.json']);
        }, error => {
            console.log(`Installation failed with error: ${error}`);
        })
    );
});

self.addEventListener('activate', event => {
    let cacheKeepList = ['v1'];
    event.waitUntil(
        caches.keys().then( keyList => {
            return Promise.all(keyList.map(function(key) {
                if (cacheKeepList.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function(event) {
    if(event.request.url.indexOf('gui/fileUpload') !== -1 || event.request.url.indexOf('gui/saveAndPublishService') !== -1) {
        return;
    }
    event.respondWith(
        // Try the network
        fetch(event.request)
            .then(function (res) {
                return caches.open('v1')
                    .then(function (cache) {
                        // Put in cache if succeeds
                        cache.put(event.request.url, res.clone());
                        return res;
                    })
            })
            .catch(function (err) {
                // Fallback to cache
                return caches.match(event.request);
            })
    );
});

