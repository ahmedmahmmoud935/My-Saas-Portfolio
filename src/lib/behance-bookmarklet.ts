// Behance import bookmarklet (ported verbatim from the old Flask site).
// Runs in the visitor browser on a Behance project page; __API_BASE__ is
// replaced with the site origin when served from /bookmarklet.js.
export const BOOKMARKLET_JS = `(function(){
  if(!location.host.includes('behance.net')){
    alert('⚠️ هذا الزر يعمل فقط على صفحات Behance');
    return;
  }

  // Show progress overlay
  var overlay = document.createElement('div');
  overlay.id = '__bh_overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif;font-size:18px;flex-direction:column;';
  overlay.innerHTML = '<div style="background:#1769ff;padding:30px 50px;border-radius:12px;text-align:center;"><div id="__bh_msg" style="font-size:18px;font-weight:bold;margin-bottom:14px;">⏳ جاري التحضير...</div><div id="__bh_sub" style="font-size:13px;opacity:0.8;">يرجى عدم التحرك</div></div>';
  document.body.appendChild(overlay);
  var setMsg = function(m, s){ var el=document.getElementById('__bh_msg'); if(el) el.textContent=m; var es=document.getElementById('__bh_sub'); if(es && s!==undefined) es.textContent=s; };
  var removeOverlay = function(){ try{ document.body.removeChild(overlay); }catch(e){} };

  // Cache images as we scroll (Behance may dispose images that leave viewport)
  var imageCache = {};  // key → {src, y, x, width, height}
  var bgCache = {};

  function captureImagesNow(){
    // Capture all visible images (including from <picture> srcset)
    var imgs = document.querySelectorAll('img');
    for(var i=0; i<imgs.length; i++){
      var node = imgs[i];
      var src = node.currentSrc || node.src || node.getAttribute('data-src') || node.getAttribute('data-lazy-src') || '';
      // Try srcset if regular src didn't match
      if(!isBehanceProjectImage(src)){
        var srcset = node.srcset || node.getAttribute('data-srcset') || '';
        if(srcset){
          // Parse srcset, get last (largest) URL
          var parts = srcset.split(',');
          for(var p=parts.length-1; p>=0; p--){
            var url = parts[p].trim().split(' ')[0];
            if(isBehanceProjectImage(url)){ src = url; break; }
          }
        }
      }
      if(!isBehanceProjectImage(src)) continue;
      var hires = upgradeRes(src);
      var key = hires.split('?')[0];
      if(imageCache[key]) continue;
      var rect = node.getBoundingClientRect();
      if(rect.width < 50 || rect.height < 50) continue;
      imageCache[key] = {
        src: hires,
        y: rect.top + window.scrollY,
        x: rect.left,
        width: rect.width,
        height: rect.height
      };
    }
    // Capture <source> tags inside <picture>
    var sources = document.querySelectorAll('source[srcset]');
    for(var i=0; i<sources.length; i++){
      var srcset = sources[i].srcset || '';
      var parts = srcset.split(',');
      for(var p=parts.length-1; p>=0; p--){
        var url = parts[p].trim().split(' ')[0];
        if(!isBehanceProjectImage(url)) continue;
        var hires = upgradeRes(url);
        var key = hires.split('?')[0];
        if(imageCache[key]) continue;
        var pict = sources[i].parentElement;
        var rect = pict ? pict.getBoundingClientRect() : {top:0,left:0,width:200,height:200};
        if(rect.width < 50 || rect.height < 50) continue;
        imageCache[key] = {
          src: hires,
          y: rect.top + window.scrollY,
          x: rect.left,
          width: rect.width,
          height: rect.height
        };
        break;
      }
    }
    // Capture background-image elements
    var bgEls = document.querySelectorAll('[style*="background"], [class*="image"], [class*="Image"], [class*="grid"], [class*="Grid"], [class*="module"], [class*="Module"]');
    for(var i=0; i<bgEls.length; i++){
      var el = bgEls[i];
      var bg = getBgImage(el);
      if(!bg || !isBehanceProjectImage(bg)) continue;
      var hires = upgradeRes(bg);
      var key = hires.split('?')[0];
      if(imageCache[key] || bgCache[key]) continue;
      var rect = el.getBoundingClientRect();
      if(rect.width < 100 || rect.height < 100) continue;
      bgCache[key] = {
        src: hires,
        y: rect.top + window.scrollY,
        x: rect.left,
        width: rect.width,
        height: rect.height
      };
    }
  }

  // Smart auto-scroll: wait for images to actually load between scroll steps
  setMsg('⏳ جاري تحميل كل الصور...', 'الخطوة 1 من 2: التمرير لأسفل');
  var step = window.innerHeight * 0.4;  // smaller steps for thoroughness
  captureImagesNow();

  function waitForImagesToLoad(timeoutMs){
    return new Promise(function(resolve){
      var imgs = document.querySelectorAll('img');
      var pending = 0;
      for(var i=0; i<imgs.length; i++){
        var img = imgs[i];
        if(!img.complete && img.src){ pending++; }
      }
      if(pending === 0){ setTimeout(resolve, 200); return; }
      // Wait for images or timeout
      var done = false;
      var timeout = setTimeout(function(){ if(!done){ done = true; resolve(); } }, timeoutMs);
      var checkInterval = setInterval(function(){
        var stillPending = 0;
        var imgs2 = document.querySelectorAll('img');
        for(var i=0; i<imgs2.length; i++){
          if(!imgs2[i].complete && imgs2[i].src) stillPending++;
        }
        if(stillPending === 0 && !done){
          done = true;
          clearInterval(checkInterval);
          clearTimeout(timeout);
          setTimeout(resolve, 300);  // small buffer
        }
      }, 200);
    });
  }

  async function smartScroll(){
    // Pass 1: scroll down, waiting for images at each step
    var pos = 0;
    var totalHeight = document.body.scrollHeight;
    var stepCount = Math.ceil(totalHeight / step);
    var current = 0;
    while(pos < document.body.scrollHeight + 200){
      current++;
      pos += step;
      window.scrollTo(0, pos);
      setMsg('⏳ جاري تحميل الصور...', 'تمرير ' + current + '/' + (stepCount + 2) + ' — انتظار التحميل');
      await waitForImagesToLoad(2500);  // wait up to 2.5s for images
      captureImagesNow();
      // Update height in case page grew (lazy loaded sections)
      if(document.body.scrollHeight > totalHeight){
        totalHeight = document.body.scrollHeight;
        stepCount = Math.ceil(totalHeight / step);
      }
    }

    // Pass 2: scroll back up, capturing images that may have re-rendered
    setMsg('⏳ جاري المرور النهائي...', 'الخطوة 2 من 2: التحقق');
    var backPos = document.body.scrollHeight;
    while(backPos > 0){
      backPos -= step * 1.5;  // bigger steps on the way up
      window.scrollTo(0, Math.max(0, backPos));
      await new Promise(r => setTimeout(r, 400));
      captureImagesNow();
    }

    // Final: back to top and extract
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 800));
    captureImagesNow();  // final capture
    extractContent();
  }
  smartScroll();

  function upgradeRes(src){
    if(!src) return src;
    return src.replace(/\\/(disp|115|202|404|disp_500|max_1200|max_3840)\\//g, '/source/');
  }

  function getBgImage(el){
    // 1. Inline style
    var style = el.getAttribute('style') || '';
    var m = style.match(/background(?:-image)?\\s*:\\s*url\\(["']?([^"')]+)["']?\\)/);
    if(m) return m[1];
    // 2. Computed style (slower but catches CSS-defined backgrounds)
    try{
      var cs = window.getComputedStyle(el);
      var bg = cs.getPropertyValue('background-image');
      if(bg && bg !== 'none'){
        var m2 = bg.match(/url\\(["']?([^"')]+)["']?\\)/);
        if(m2) return m2[1];
      }
    }catch(e){}
    return null;
  }

  function isBehanceProjectImage(src){
    if(!src || src.indexOf('http') !== 0) return false;
    // Skip data URLs, gifs of small icons, profile pics
    if(src.indexOf('data:') === 0) return false;
    if(src.indexOf('/profiles/') > -1) return false;
    if(src.indexOf('/users/') > -1) return false;
    if(src.indexOf('avatar') > -1) return false;
    // Behance CDNs
    return src.indexOf('mir-s3-cdn-cf.behance.net/project_modules') > -1 ||
           src.indexOf('mir-s3-cdn-cf.behance.net/projects/') > -1 ||
           src.indexOf('mir-cdn.behance.net/project_modules') > -1 ||
           src.indexOf('mir-cdn.behance.net/v1/project_modules') > -1 ||
           // Also: any subdomain.behance.net with project_modules path
           (src.indexOf('.behance.net') > -1 && src.indexOf('project_modules') > -1) ||
           // Also accept images inside an EditProject context (more permissive)
           (location.pathname.indexOf('/edit') > -1 && src.indexOf('behance.net') > -1 && src.indexOf('project_modules') > -1);
  }

  function extractContent(){
    setMsg('🔍 جاري استخراج المحتوى...', '');

    // Final capture before extraction
    captureImagesNow();

    var allItems = [];
    var seen = {};

    var title = '';
    var ogT = document.querySelector('meta[property="og:title"]');
    if(ogT) title = ogT.content;
    if(!title) title = (document.title||'').split('::')[0].split('|')[0].trim();

    var desc = '';
    var ogD = document.querySelector('meta[property="og:description"]');
    if(ogD) desc = ogD.content;

    var cover = '';
    var ogI = document.querySelector('meta[property="og:image"]');
    if(ogI) cover = ogI.content;

    // 1. All cached images (from <img> tags during scroll)
    for(var key in imageCache){
      if(seen[key]) continue;
      seen[key] = 1;
      var ic = imageCache[key];
      allItems.push({
        type:'image', src: ic.src,
        y: ic.y, x: ic.x, width: ic.width, height: ic.height
      });
    }

    // 2. All cached background-image elements
    for(var key in bgCache){
      if(seen[key]) continue;
      seen[key] = 1;
      var bc = bgCache[key];
      allItems.push({
        type:'image', src: bc.src,
        y: bc.y, x: bc.x, width: bc.width, height: bc.height
      });
    }

    // 3. Videos
    var allVids = document.querySelectorAll('video');
    for(var i=0; i<allVids.length; i++){
      var v = allVids[i].currentSrc || allVids[i].src || '';
      if(v && v.indexOf('http')===0 && !seen[v]){
        seen[v]=1;
        var rect = allVids[i].getBoundingClientRect();
        allItems.push({type:'video', src: v, y: rect.top + window.scrollY, x: rect.left, width: rect.width, height: rect.height});
      }
    }

    // 4. Iframes (Vimeo / YouTube)
    var allFrames = document.querySelectorAll('iframe');
    for(var i=0; i<allFrames.length; i++){
      var f = allFrames[i].src || '';
      if(f && (f.indexOf('vimeo.com')>-1 || f.indexOf('youtube.com')>-1) && !seen[f]){
        seen[f]=1;
        var rect = allFrames[i].getBoundingClientRect();
        allItems.push({type:'embed', url: f, y: rect.top + window.scrollY, x: rect.left, width: rect.width, height: rect.height});
      }
    }

    // 5. Text blocks
    var textNodes = document.querySelectorAll('p, h1, h2, h3, blockquote');
    for(var i=0; i<textNodes.length; i++){
      var node = textNodes[i];
      var text = (node.innerText||'').trim();
      if(text.length < 30 || text.length > 4000) continue;
      if(node.closest('nav, header, footer, [class*="toolbar"], [class*="appreciation"], [class*="comment"], [class*="related"], [class*="profile-stats"], [class*="byline"]')) continue;
      var key = 't:'+text.slice(0,50);
      if(seen[key]) continue;
      seen[key] = 1;
      var rect = node.getBoundingClientRect();
      allItems.push({type:'text', content: text, y: rect.top + window.scrollY, x: rect.left, width: rect.width, height: rect.height});
    }

    // Sort by Y position (document order)
    allItems.sort(function(a,b){
      var dy = (a.y||0) - (b.y||0);
      if(Math.abs(dy) < 20) return (a.x||0) - (b.x||0);  // same row → left-to-right
      return dy;
    });

    // Group images that are on the same row (within 30px Y) → image_row
    var modules = [];
    var i = 0;
    while(i < allItems.length){
      var item = allItems[i];
      if(item.type !== 'image'){
        modules.push(stripMeta(item));
        i++;
        continue;
      }
      // Check if next item(s) are images on the same row
      var rowItems = [item];
      var j = i + 1;
      while(j < allItems.length && allItems[j].type === 'image' && Math.abs(allItems[j].y - item.y) < 30){
        rowItems.push(allItems[j]);
        j++;
      }
      if(rowItems.length >= 2){
        // It's a grid row
        modules.push({type:'image_row', images: rowItems.map(function(r){ return r.src; })});
      } else {
        modules.push(stripMeta(item));
      }
      i = j;
    }

    function stripMeta(it){
      var c = {};
      for(var k in it){ if(k!=='y' && k!=='x' && k!=='width' && k!=='height' && k!=='el') c[k] = it[k]; }
      return c;
    }

    if(!modules.length){
      removeOverlay();
      alert('⚠️ لم يتم العثور على محتوى\\n\\nتأكد إنك على صفحة مشروع Behance (وليس صفحة البروفايل)');
      return;
    }

    var totalImages = 0;
    var totalEmbeds = 0;
    var totalText = 0;
    modules.forEach(function(m){
      if(m.type === 'image') totalImages++;
      else if(m.type === 'image_row') totalImages += m.images.length;
      else if(m.type === 'embed') totalEmbeds++;
      else if(m.type === 'text') totalText++;
    });

    console.log('[Bookmarklet] Extracted:', {
      images: totalImages, embeds: totalEmbeds, text: totalText,
      imageCache: Object.keys(imageCache).length,
      bgCache: Object.keys(bgCache).length,
      modules: modules.length
    });

    // Convert images to base64 IN BROWSER (Behance returns 403 to server but works in browser)
    setMsg('🖼️ جاري تحويل الصور...', '0 / ' + totalImages);

    function urlToBase64(url){
      return new Promise(function(resolve){
        var img = new Image();
        img.crossOrigin = 'anonymous';
        var done = false;
        var timeoutId = setTimeout(function(){
          if(done) return;
          done = true;
          // Try fetch() as fallback
          fetch(url, {credentials:'include'})
            .then(function(r){ if(!r.ok) throw new Error('fail'); return r.blob(); })
            .then(function(blob){
              var reader = new FileReader();
              reader.onload = function(){ resolve(reader.result); };
              reader.onerror = function(){ resolve(null); };
              reader.readAsDataURL(blob);
            })
            .catch(function(){ resolve(null); });
        }, 8000);
        img.onload = function(){
          if(done) return;
          done = true;
          clearTimeout(timeoutId);
          try {
            var canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 1200;
            canvas.height = img.naturalHeight || 800;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Use JPEG with 0.9 quality for smaller payload
            var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            if(dataUrl.length < 300) { resolve(null); return; }
            resolve(dataUrl);
          } catch(e){
            // CORS taint — fallback to fetch
            fetch(url, {credentials:'include'})
              .then(function(r){ if(!r.ok) throw new Error('fail'); return r.blob(); })
              .then(function(blob){
                var reader = new FileReader();
                reader.onload = function(){ resolve(reader.result); };
                reader.onerror = function(){ resolve(null); };
                reader.readAsDataURL(blob);
              })
              .catch(function(){ resolve(null); });
          }
        };
        img.onerror = function(){
          if(done) return;
          done = true;
          clearTimeout(timeoutId);
          // Fallback to fetch
          fetch(url, {credentials:'include'})
            .then(function(r){ if(!r.ok) throw new Error('fail'); return r.blob(); })
            .then(function(blob){
              var reader = new FileReader();
              reader.onload = function(){ resolve(reader.result); };
              reader.onerror = function(){ resolve(null); };
              reader.readAsDataURL(blob);
            })
            .catch(function(){ resolve(null); });
        };
        img.src = url;
      });
    }

    // Process all image URLs in parallel (with concurrency limit)
    async function convertAllImages(){
      var allUrls = [];
      modules.forEach(function(m){
        if(m.type === 'image') allUrls.push(m.src);
        else if(m.type === 'image_row') (m.images||[]).forEach(function(s){ allUrls.push(s); });
      });

      var urlToData = {};
      var done = 0;
      var concurrency = 4;
      var idx = 0;

      async function worker(){
        while(idx < allUrls.length){
          var myIdx = idx++;
          var url = allUrls[myIdx];
          if(urlToData[url] !== undefined){ done++; continue; }
          var data = await urlToBase64(url);
          urlToData[url] = data;
          done++;
          setMsg('🖼️ جاري تحويل الصور...', done + ' / ' + allUrls.length);
        }
      }

      var workers = [];
      for(var w=0; w<concurrency; w++) workers.push(worker());
      await Promise.all(workers);

      // Replace URLs with base64 (only successful ones)
      var newModules = [];
      modules.forEach(function(m){
        if(m.type === 'image'){
          var data = urlToData[m.src];
          if(data) newModules.push({type:'image', src: data, originalUrl: m.src});
          else newModules.push({type:'image', src: m.src});  // keep URL as fallback
        } else if(m.type === 'image_row'){
          var newImages = [];
          (m.images||[]).forEach(function(s){
            var data = urlToData[s];
            newImages.push(data || s);
          });
          if(newImages.length) newModules.push({type:'image_row', images: newImages});
        } else {
          newModules.push(m);
        }
      });

      var successCount = 0;
      Object.keys(urlToData).forEach(function(k){ if(urlToData[k]) successCount++; });
      console.log('[Bookmarklet] Converted', successCount, '/', allUrls.length, 'images to base64');

      return newModules;
    }

    convertAllImages().then(function(processedModules){
      setMsg('📤 جاري الإرسال...', 'لا تغلق الصفحة');
      sendToServer(processedModules);
    });

    function sendToServer(processedModules){
      fetch('__API_BASE__/api/bookmarklet/submit', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title: title, description: desc, cover: cover, modules: processedModules,
        source_url: location.href
      })
    })
    .then(function(r){
      if(!r.ok) throw new Error('Server returned ' + r.status);
      return r.json();
    })
    .then(function(d){
      removeOverlay();
      if(d.import_id){
        var url = '__API_BASE__/dashboard/projects?bh=' + encodeURIComponent(d.import_id);
        var ok = confirm('✅ تم استخراج ' + d.count + ' عنصر بنجاح!\\n\\nاضغط OK لفتح لوحة التحكم');
        if(ok){
          // Use window.open for Safari compatibility (avoids "string did not match" error)
          var w = window.open(url, '_blank');
          if(!w){
            // Popup blocked → fallback
            location.href = url;
          }
        }
      } else {
        alert('❌ ' + (d.error||'فشل الإرسال'));
      }
    })
    .catch(function(e){
      removeOverlay();
      alert('❌ خطأ في الإرسال:\\n' + e.message + '\\n\\nتأكد من أنك مسجل دخول في موقع Portfolio');
    });
    }
  }
})();`
