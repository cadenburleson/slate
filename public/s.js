/**
 * Slate CMS Snippet
 * Paste into your site's <head>:
 *   <script src="https://cdn.slate.app/s.js" data-site-id="YOUR_TOKEN" defer></script>
 */
(function () {
  "use strict";

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  // Resolve site id with override priority:
  //   1. ?slate_site_id=<token> in the URL (persists to localStorage)
  //   2. localStorage("slate_site_id")
  //   3. data-site-id on the script tag
  // The override pattern lets a developer test against any Slate site
  // without changing the embed code on the host site.
  var SITE_ID = (function () {
    try {
      var qs = new URLSearchParams(window.location.search).get("slate_site_id");
      if (qs) {
        localStorage.setItem("slate_site_id", qs);
        return qs;
      }
      var stored = localStorage.getItem("slate_site_id");
      if (stored) return stored;
    } catch (e) {}
    return script.getAttribute("data-site-id");
  })();

  var API = "https://dmmwptwopitvjeyweqrv.supabase.co/functions/v1";
  var MEDIA_BASE = "https://pub-c617e497d63d48e380f5a47eb765fb4e.r2.dev"; // Phase 1 default; Phase 2 swap to media.<domain>
  var WIDTH_PX = { small: 400, medium: 800, large: 1600, full: 1600 };
  var MANIFEST_KEY = "slate_manifest_" + SITE_ID;
  var HEADER_KEY = "slate_header_" + SITE_ID;
  var FOOTER_KEY = "slate_footer_" + SITE_ID;

  function srcFor(value, width) {
    if (!value) return "";
    if (value.indexOf("r2:") !== 0) return value;
    var px = WIDTH_PX[width] || WIDTH_PX.full;
    return MEDIA_BASE + "/" + value.slice(3) + "-" + px + ".webp";
  }

  if (!SITE_ID || SITE_ID === "YOUR_SITE_ID") return;

  // ── DOM Helpers ─────────────────────────────────────────────────────────────

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function text(str) {
    return document.createTextNode(str || "");
  }

  function append(parent) {
    for (var i = 1; i < arguments.length; i++) {
      parent.appendChild(arguments[i]);
    }
    return parent;
  }

  // ── Block Renderers (DOM-based, no innerHTML) ────────────────────────────────

  function renderBlock(block) {
    switch (block.type) {
      case "heading": {
        var h = el("h" + block.level, "slate-heading slate-h" + block.level);
        h.textContent = block.text || "";
        return h;
      }
      case "paragraph": {
        var p = el("p", "slate-p");
        p.textContent = block.text || "";
        return p;
      }
      case "quote": {
        var bq = el("blockquote", "slate-quote");
        bq.textContent = block.text || "";
        return bq;
      }
      case "list": {
        var listEl = el(block.ordered ? "ol" : "ul", "slate-list");
        (block.items || []).forEach(function (item) {
          var li = el("li");
          li.textContent = item;
          listEl.appendChild(li);
        });
        return listEl;
      }
      case "image": {
        var fig = el("figure", "slate-figure");
        var img = el("img", "slate-img");
        img.src = srcFor(block.src, block.width || "full");
        img.alt = block.alt || "";
        fig.appendChild(img);
        if (block.caption) {
          var cap = el("figcaption", "slate-caption");
          cap.textContent = block.caption;
          fig.appendChild(cap);
        }
        return fig;
      }
      case "divider": {
        return el("hr", "slate-hr");
      }
      case "service": {
        var card = el("div", "slate-service");
        var body = el("div", "slate-service-body");
        var h3 = el("h3", "slate-service-title");
        h3.textContent = block.title || "";
        var desc = el("p", "slate-service-desc");
        desc.textContent = block.description || "";
        body.appendChild(h3);
        body.appendChild(desc);
        card.appendChild(body);
        if (block.stripe_link) {
          var btn = el("a", "slate-service-btn");
          btn.textContent = block.label || "Buy now";
          btn.href = block.stripe_link;
          btn.target = "_blank";
          btn.rel = "noopener noreferrer";
          card.appendChild(btn);
        }
        return card;
      }
      default:
        return null;
    }
  }

  function renderBlocks(blocks, container) {
    (blocks || []).forEach(function (block) {
      var node = renderBlock(block);
      if (node) container.appendChild(node);
    });
  }

  // ── Content Area Detection ──────────────────────────────────────────────────

  var SELECTOR_PRIORITY = [
    "main",
    "article",
    "[role='main']",
    ".post-content",
    ".entry-content",
    ".page-content",
    ".wp-content",
    ".article-content",
    ".content-area",
    ".w-richtext",
    "#content",
    "#main",
  ];

  function findContentArea() {
    for (var i = 0; i < SELECTOR_PRIORITY.length; i++) {
      var found = document.querySelector(SELECTOR_PRIORITY[i]);
      if (found) return found;
    }
    return highestDensityDiv();
  }

  function highestDensityDiv() {
    var divs = document.querySelectorAll("div");
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < divs.length; i++) {
      var div = divs[i];
      var words = (div.innerText || "").trim().split(/\s+/).length;
      var height = div.offsetHeight || 1;
      var score = words / height;
      if (score > bestScore && words > 50) {
        bestScore = score;
        best = div;
      }
    }
    return best || document.body;
  }

  // ── Meta Injection ──────────────────────────────────────────────────────────

  function setMeta(selector, attr, value) {
    var metaEl = document.querySelector(selector);
    if (!metaEl) {
      metaEl = document.createElement("meta");
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute(attr, value);
  }

  function injectMeta(content) {
    if (content.title) {
      document.title = content.title;
      setMeta("meta[property='og:title']", "property", "og:title");
      document.querySelector("meta[property='og:title']").setAttribute("content", content.title);
    }
    if (content.meta_description) {
      setMeta("meta[name='description']", "name", "description");
      document.querySelector("meta[name='description']").setAttribute("content", content.meta_description);
    }
    if (content.og_image) {
      setMeta("meta[property='og:image']", "property", "og:image");
      document.querySelector("meta[property='og:image']").setAttribute("content", srcFor(content.og_image, "full"));
    }
  }

  // ── Shell Capture (header/footer for new routes) ─────────────────────────────

  function captureShell() {
    try {
      var headerEl = document.querySelector("header") || document.querySelector("[role='banner']");
      var footerEl = document.querySelector("footer") || document.querySelector("[role='contentinfo']");
      if (headerEl) localStorage.setItem(HEADER_KEY, headerEl.outerHTML);
      if (footerEl) localStorage.setItem(FOOTER_KEY, footerEl.outerHTML);
    } catch (e) {}
  }

  // ── Main Injection ──────────────────────────────────────────────────────────

  function injectContent(content, isNewRoute) {
    var wrapper = el("div", "slate-content");
    renderBlocks(content.content_json, wrapper);

    if (isNewRoute) {
      // For brand-new routes: rebuild page from cached shell + CMS content
      var main = el("main", "slate-main");
      main.appendChild(wrapper);
      var newBody = document.createElement("body");
      try {
        var hHtml = localStorage.getItem(HEADER_KEY);
        var fHtml = localStorage.getItem(FOOTER_KEY);
        // Use DOMParser to safely parse stored shell HTML
        var parser = new DOMParser();
        if (hHtml) {
          var hDoc = parser.parseFromString(hHtml, "text/html");
          var hNode = hDoc.body.firstChild;
          if (hNode) newBody.appendChild(document.adoptNode(hNode));
        }
        newBody.appendChild(main);
        if (fHtml) {
          var fDoc = parser.parseFromString(fHtml, "text/html");
          var fNode = fDoc.body.firstChild;
          if (fNode) newBody.appendChild(document.adoptNode(fNode));
        }
      } catch (e) {
        newBody.appendChild(main);
      }
      document.body.parentNode.replaceChild(newBody, document.body);
    } else {
      var area = findContentArea();
      while (area.firstChild) area.removeChild(area.firstChild);
      area.appendChild(wrapper);
    }

    injectMeta(content);
    captureShell();
  }

  // ── API Calls ───────────────────────────────────────────────────────────────

  function fetchManifest(cb) {
    // No client-side cache — newly-published pages must show up on the
    // next page load. The /manifest endpoint sets max-age=60 so the
    // browser's HTTP cache handles repeat-load performance.
    fetch(API + "/manifest?site=" + encodeURIComponent(SITE_ID))
      .then(function (r) { return r.json(); })
      .then(cb)
      .catch(function () {});
  }

  function fetchContent(slug, cb) {
    fetch(API + "/content?site=" + encodeURIComponent(SITE_ID) + "&slug=" + encodeURIComponent(slug))
      .then(function (r) { return r.json(); })
      .then(cb)
      .catch(function () {});
  }

  // ── Nav / Footer Injection ──────────────────────────────────────────────────

  var NAV_FALLBACK_SELECTORS = ["nav", "header nav", "[role='navigation']"];
  var FOOTER_FALLBACK_SELECTORS = ["footer", "[role='contentinfo']"];

  function findChrome(override, fallbacks) {
    if (override) {
      var picked = document.querySelector(override);
      if (picked) return picked;
    }
    for (var i = 0; i < fallbacks.length; i++) {
      var found = document.querySelector(fallbacks[i]);
      if (found) return found;
    }
    return null;
  }

  // Active-state classes commonly used by host themes — strip from cloned
  // templates so new pages don't inherit "current page" styling.
  var ACTIVE_CLASS_RE = /\b(active|current|current-menu-item|current-menu-parent|current-page|current-page-item|is-active|selected)\b/g;

  function stripActiveStates(node) {
    var nodes = [node];
    if (node.querySelectorAll) {
      var nested = node.querySelectorAll("*");
      for (var i = 0; i < nested.length; i++) nodes.push(nested[i]);
    }
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      if (n.className && typeof n.className === "string") {
        n.className = n.className.replace(ACTIVE_CLASS_RE, "").replace(/\s+/g, " ").trim();
      }
      if (n.removeAttribute) n.removeAttribute("aria-current");
    }
  }

  // Count how many <a> siblings (excluding Slate-injected ones) share a node's
  // immediate parent. Used to score template candidates — menu links sit in
  // a dense group, brand/logo links are usually solo.
  function siblingAnchorCount(a) {
    if (!a.parentNode) return 1;
    var kids = a.parentNode.children || [];
    var n = 0;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].tagName === "A" && !kids[i].hasAttribute("data-slate-link")) n++;
    }
    return n;
  }

  // Find a host link to clone as a template. Cloning preserves the host's
  // classes, wrapping <li>, and inline styles so injected links visually
  // match the rest of the nav/footer. Prefers links from the densest group
  // (i.e. the actual menu) so we don't clone a logo/brand link by mistake.
  function findLinkTemplate(container) {
    var anchors = container.querySelectorAll("a:not([data-slate-link])");
    if (!anchors.length) return null;
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var score = siblingAnchorCount(a);
      // Prefer larger groups; tie-break to the later anchor so we land at the
      // end of the menu rather than its first item (often "Home" / "logo").
      if (score >= bestScore) {
        best = a;
        bestScore = score;
      }
    }
    if (!best) return null;
    var li = best.closest && best.closest("li");
    if (li && container.contains(li)) {
      return { node: li, parent: li.parentNode };
    }
    return { node: best, parent: best.parentNode };
  }

  function injectLinks(container, items) {
    if (!container) return;
    // Remove any links Slate injected on a previous load so label changes
    // and removed pages take effect. Hand-coded links on the host site are
    // left alone — we only touch elements with data-slate-link.
    var prior = container.querySelectorAll("[data-slate-link]");
    for (var i = 0; i < prior.length; i++) prior[i].parentNode.removeChild(prior[i]);

    if (!items || !items.length) return;

    var template = findLinkTemplate(container);

    items.forEach(function (item) {
      if (!item.slug) return;
      // Skip if the host site already has a hand-coded link to this slug
      // (e.g. existing About link in the nav). Don't duplicate it.
      var existing = container.querySelector('a[href="' + item.slug + '"]');
      if (existing && !existing.hasAttribute("data-slate-link")) return;

      var node, anchor;
      if (template) {
        node = template.node.cloneNode(true);
        stripActiveStates(node);
        anchor = node.tagName === "A" ? node : node.querySelector("a");
      }
      if (!anchor) {
        anchor = el("a", "slate-nav-link");
        node = anchor;
      }

      anchor.href = item.slug;
      while (anchor.firstChild) anchor.removeChild(anchor.firstChild);
      anchor.appendChild(text(item.label || item.slug));

      node.setAttribute("data-slate-link", "true");
      if (anchor !== node) anchor.setAttribute("data-slate-link", "true");

      var dest = template ? template.parent : (container.querySelector("ul, ol") || container);
      dest.appendChild(node);
    });
  }

  function injectChrome(manifest) {
    var navEl = findChrome(manifest.nav_selector, NAV_FALLBACK_SELECTORS);
    injectLinks(navEl, manifest.nav);
    var footerEl = findChrome(manifest.footer_selector, FOOTER_FALLBACK_SELECTORS);
    injectLinks(footerEl, manifest.footer);
  }

  // ── Main ────────────────────────────────────────────────────────────────────

  function init() {
    var path = window.location.pathname;
    captureShell();

    fetchManifest(function (manifest) {
      if (!manifest) return;

      injectChrome(manifest);

      if (!manifest.slugs) return;
      var entry = null;
      for (var i = 0; i < manifest.slugs.length; i++) {
        if (manifest.slugs[i].slug === path) {
          entry = manifest.slugs[i];
          break;
        }
      }
      if (!entry) return;

      fetchContent(path, function (content) {
        if (!content || !content.content_json) return;
        injectContent(content, !entry.existsOnSite);
        // Re-inject nav/footer if injectContent rebuilt the body for a new route.
        injectChrome(manifest);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
