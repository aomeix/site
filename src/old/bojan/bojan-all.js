(function () {
  var styleid = "bojan-widget-style";

  var proxy = "https://bojan.aomeixp.workers.dev/api";
  var userlookup = proxy + "/users/@";
  var globalposts = proxy + "/latest-posts";

  function getconfig(container) {
    return {
      mode: container.getAttribute("data-mode") || "global",
      username: container.getAttribute("data-username"),
      width: parseInt(container.getAttribute("data-width") || "340", 10),
      height: container.getAttribute("data-height") || null,
    };
  }
  var css = 
    "#bojan-widget {\n" +
    "  font-family: Arial, Helvetica, sans-serif;\n" +
    "  border: 1px solid #b2b2b2;\n" +
    "  background: #fff;\n" +
    "  font-size: 12px;\n" +
    "  color: #000;\n" +
    "  overflow: hidden;\n" +
    "  scrollbar-width: thin;\n" +
    "  scrollbar-color: #bbb transparent;}\n" +
    "  \n" +
    "#bojan-widget * { box-sizing: border-box; }\n" +
    "#bojan-widget .bw-header {\n" +
    "  height: 70px;\n" +
    "  background: url(\"https://bscdn.colourlabs.net/banners/7449470513165894656/d630a2a5.webp\");\n" +
    "  background-size: cover;\n" +
    "  display: flex;\n" +
    "  align-items: flex-end;\n" +
    "  padding: 6px 8px;\n" +
    "  color: #fff;\n" +
    "  font-weight: bold;\n" +
    "  text-shadow: 0 1px 2px #000;}\n" +
    "#bojan-widget .bw-title {\n" +
    "  background: rgba(0,0,0,0.45);\n" +
    "  padding: 2px 6px;\n" +
    "  border-radius: 3px;\n" +
    "  text-transform: lowercase;}\n" +
    "#bojan-widget .bw-post {\n" +
    "  display: flex;\n" +
    "  gap: 8px;\n" +
    "  padding: 8px;\n" +
    "  border-top: 1px solid #ddd;}\n" +
    "#bojan-widget .bw-avatar {\n" +
    "  width: 38px;\n" +
    "  height: 38px;\n" +
    "  border: 1px solid #999;\n" +
    "  border-radius: 3px;\n" +
    "  background-size: cover;\n" +
    "  background-position: center;\n" +
    "  flex-shrink: 0;\n" +
    "  position: relative;\n" +
    "  display: block;}\n" +
    "#bojan-widget .bw-avatar::after {\n" +
    "  content: \"\";\n" +
    "  position: absolute;\n" +
    "  inset: 0;\n" +
    "  display: block;\n" +
    "  background: url(\"https://bojan.social/img/pfp-gloss.svg\") center / cover no-repeat;}\n" +
    "#bojan-widget .bw-content {\n" +
    "  flex: 1;\n" +
    "  display: flex;\n" +
    "  flex-direction: column;\n" +
    "  gap: 4px;\n" +
    "  min-width: 0;}\n" +
    "#bojan-widget .bw-user a {\n" +
    "  color: #000;\n" +
    "  text-decoration: none;\n" +
    "  font-weight: bold;}\n" +
    "#bojan-widget .bw-user a:hover {\n" +
    "  text-decoration: underline;\n" +
    "  color: #2164c0;}\n" +
    "#bojan-widget .bw-text {\n" +
    "  line-height: 1.4;\n" +
    "  word-break: break-word;\n" +
    "  white-space: pre-wrap;}\n" +
    "#bojan-widget .bw-attachments {\n" +
    "  display: flex;\n" +
    "  flex-direction: column;\n" +
    "  gap: 6px;\n" +
    "  margin-top: 6px;}\n" +
    "#bojan-widget .bw-attachments img {\n" +
    "  max-width: 100%;\n" +
    "  border: 1px solid #ddd;\n" +
    "  border-radius: 4px;\n" +
    "  display: block;}\n" +
    "#bojan-widget .bw-meta {\n" +
    "  font-size: 10px;\n" +
    "  color: #777;}\n" +
    "#bojan-widget .bw-loading {\n" +
    "  padding: 10px;\n" +
    "  color: #666;}\n" +
    "#bojan-widget::-webkit-scrollbar { width: 6px; height: 6px; }\n" +
    "#bojan-widget::-webkit-scrollbar-track { background: transparent; }\n" +
    "#bojan-widget::-webkit-scrollbar-thumb {\n" +
    "  background-color: #bbb;\n" +
    "  border-radius: 10px;}\n" +
    "#bojan-widget::-webkit-scrollbar-thumb:hover {\n" +
    "  background-color: #999;}\n" +
    "  ";

  function injectcss() {
    if (document.getElementById(styleid)) return;
    var style = document.createElement("style");
    style.id = styleid;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapehtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function (match) {
      switch (match) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#039;";
        default: return match;
      }
    });
  }
  function getResourceUrl(type, data, extra) {
      //way overkill but too lazy to change it, not my script but i forgot where i stole it from
    if (type === "avatar") {
      return data.avatar_hash
        ? "https://bscdn.colourlabs.net/avatars/" + data.id + "/" + data.avatar_hash + ".png"
        : "https://bscdn.colourlabs.net/avatars/default.jpg";
    }
    if (type === "banner") {
      if (!extra) return null;
      return "https://bscdn.colourlabs.net/banners/" + data + "/" + extra + ".webp";
    }
    if (type === "attachment") {
      var extmap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif"
      };
      var ext = extmap[data.mime_type] || "bin";
      return "https://bscdn.colourlabs.net/attachments/" + data.id + "/" + data.file_hash + "." + ext;
    }
    return "";
  }

  function applysizing(container, config) {
    container.style.width = config.width + "px";
    var scale = Math.max(0.85, Math.min(1, config.width / 340));
    container.style.fontSize = (12 * scale) + "px";
    if (config.height) {
      container.style.height = config.height + "px";
      container.style.overflowY = "auto";
    }
  }
  function makeRequest(endpoint) {
    return fetch(endpoint).then(function (res) {
      return res.json();
    });
  }

  function render(container, title, posts, banner) {
    container.innerHTML = "";
    var header = document.createElement("div");
    header.className = "bw-header";
    if (banner) {
      header.style.backgroundImage = "url(\"" + banner + "\")";
    }
    header.innerHTML = "<div class=\"bw-title\">" + escapehtml(title) + "</div>";
    
    var list = document.createElement("div");
    
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var el = document.createElement("div");
      el.className = "bw-post";
      var avatar = getResourceUrl("avatar", post.author);
      var text = escapehtml(post.content || "");
      
      var attachmentshtml = "";
      if (post.attachments && post.attachments.length) {
        for (var j = 0; j < post.attachments.length; j++) {
          var att = post.attachments[j];
          var url = getResourceUrl("attachment", att);
          if (att.mime_type && att.mime_type.indexOf("image/") === 0) {
            attachmentshtml += "<img src=\"" + url + "\" alt=\"" + escapehtml(att.name || "") + "\" loading=\"lazy\">";
          }
        }
      }

      el.innerHTML = 
        "        <div class=\"bw-avatar\" style=\"background-image:url('" + avatar + "')\"></div>\n" +
        "        <div class=\"bw-content\">\n" +
        "          <div class=\"bw-user\">\n" +
        "            <a href=\"https://bojan.social/u/" + post.author.username + "\"\n" +
        "               target=\"_blank\" rel=\"noopener noreferrer\">\n" +
        "              " + escapehtml(post.author.display_name || post.author.username) + "\n" +
        "            </a>\n" +
        "          </div>\n" +
        "          <div class=\"bw-text\">" + text + "</div>\n" +
        "          " + (attachmentshtml ? "<div class=\"bw-attachments\">" + attachmentshtml + "</div>" : "") + "\n" +
        "          <div class=\"bw-meta\">@" + escapehtml(post.author.username) + "</div>\n" +
        "        </div>\n" +
        "      ";
      list.appendChild(el);
    }
    
    container.appendChild(header);
    container.appendChild(list);
  }

  function init() {
    injectcss();
    var container = document.getElementById("bojan-widget");
    if (!container) return;
    var config = getconfig(container);
    applysizing(container, config);
    container.innerHTML = "<div class=\"bw-loading\">loading..</div>";

    if (config.mode === "user") {
      if (!config.username) {
        container.innerHTML = "missing data-username >:";
        return;
      }

      makeRequest(userlookup + config.username)
        .then(function (userData) {
          if (userData.status !== "success") {
            throw new Error("user not found >:");
          }
          
          return Promise.all([
            userData,
            makeRequest(proxy + "/users/" + userData.id + "/profile"),
            makeRequest(proxy + "/users/" + userData.id + "/posts")
          ]);
        })
        .then(function (results) {
          var user = results[0];
          var profile = results[1];
          var postsData = results[2];

          var banner = null;
          if (profile.status === "success") {
            banner = getResourceUrl("banner", user.id, profile.banner_hash);
          }
          
          var posts = postsData.posts || [];
          var title = user.display_name || user.username;
          
          render(container, title, posts, banner);
        })
        .catch(function (e) {
          console.error(e);
          container.innerHTML = "failed to load posts >:";
        });

    } else {
      makeRequest(globalposts)
        .then(function (data) {
          var posts = data.posts || [];
          render(container, "recent posts", posts, null);
        })
        .catch(function (e) {
          console.error(e);
          container.innerHTML = "failed to load posts >:";
        });
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();