(function () {
    "use strict";

    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    if (!input || !results || typeof elasticlunr === "undefined") return;

    var index = null;
    var docs = {};

    fetch("/search_index.en.json")
        .then(function (r) { return r.json(); })
        .then(function (data) {
            index = elasticlunr.Index.load(data);
            docs = (data.documentStore && data.documentStore.docs) || {};
            if (input.value) search(input.value);
        })
        .catch(function () {
            results.textContent = "Search index failed to load.";
        });

    function search(q) {
        if (!index) return;
        var hits = index.search(q, {
            fields: { title: { boost: 2 }, body: { boost: 1 } },
            expand: true
        });
        results.innerHTML = "";
        if (!hits.length) {
            results.innerHTML = "<p class='search-empty'>Nothing found.</p>";
            return;
        }
        hits.slice(0, 20).forEach(function (hit) {
            var doc = docs[hit.ref] || (index.documentStore && index.documentStore.getDoc && index.documentStore.getDoc(hit.ref));
            if (!doc) return;
            var item = document.createElement("article");
            item.className = "post-item";
            var meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = doc.date ? String(doc.date).slice(0, 10) : "";
            var h = document.createElement("h3");
            var a = document.createElement("a");
            a.href = "/" + hit.ref.replace(/\.md$/, "/");
            a.textContent = doc.title;
            h.appendChild(a);
            item.appendChild(meta);
            item.appendChild(h);
            if (doc.body) {
                var p = document.createElement("p");
                p.textContent = String(doc.body).replace(/\s+/g, " ").slice(0, 160) + "…";
                item.appendChild(p);
            }
            results.appendChild(item);
        });
    }

    var timer = null;
    input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () { search(input.value.trim()); }, 150);
    });
})();
