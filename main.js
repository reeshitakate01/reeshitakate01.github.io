(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var EMAIL = 'reeshitakate01@gmail.com';

  /* ================= Capture the flag ================= */
  var FLAG_NAMES = { tab: 'flag{survived_the_tabnab}', scam: 'flag{spotted_the_scam}', grade: 'flag{straight_A_scan}' };
  var flags = {};
  try { flags = JSON.parse(localStorage.getItem('rk-flags') || '{}') || {}; } catch (e) { flags = {}; }
  var flagBtn = $('#flagBtn'), flagPop = $('#flagPop'), flagCount = $('#flagCount'), toastEl = $('#toast'), toastT;
  function toast(msg, html) {
    clearTimeout(toastT);
    if (html) toastEl.innerHTML = msg; else toastEl.textContent = msg;
    toastEl.classList.add('on');
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 4200);
  }
  function renderFlags() {
    var n = Object.keys(flags).length;
    flagCount.textContent = n;
    flagBtn.classList.toggle('all', n === 3);
    $$('li', flagPop).forEach(function (li) { li.classList.toggle('got', !!flags[li.getAttribute('data-flag')]); });
  }
  function capture(id) {
    if (flags[id]) return;
    flags[id] = true;
    try { localStorage.setItem('rk-flags', JSON.stringify(flags)); } catch (e) {}
    renderFlags();
    flagBtn.classList.remove('pop'); void flagBtn.offsetWidth; flagBtn.classList.add('pop');
    var n = Object.keys(flags).length;
    if (n === 3) toast('All 3 flags captured. Thanks for exploring! <a href="#contact">Let\'s talk &rarr;</a>', true);
    else toast('Flag ' + n + '/3 captured: ' + FLAG_NAMES[id]);
  }
  flagBtn.addEventListener('click', function () {
    var open = flagPop.hidden;
    flagPop.hidden = !open;
    flagBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!flagPop.hidden && !e.target.closest('.flags')) { flagPop.hidden = true; flagBtn.setAttribute('aria-expanded', 'false'); }
  });
  renderFlags();
  try { console.log('%cLooking for flags? There are three on this page, and none of them are in the source.', 'color:#5eead4;font-weight:bold'); } catch (e) {}

  /* ================= Hero: what your browser just told me ================= */
  // Everything below is read locally from standard browser APIs. Nothing is sent anywhere or stored.
  var bv = $('#bv');
  function bvBrowser() {
    var ua = navigator.userAgent, b = 'a browser', os = 'an unknown system';
    if (/Edg\//.test(ua)) b = 'Edge'; else if (/OPR\//.test(ua)) b = 'Opera'; else if (/Firefox\//.test(ua)) b = 'Firefox';
    else if (/Chrome\//.test(ua)) b = 'Chrome'; else if (/Safari\//.test(ua)) b = 'Safari';
    if (/Windows/.test(ua)) os = 'Windows'; else if (/Android/.test(ua)) os = 'Android'; else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (/Mac OS X/.test(ua)) os = 'macOS'; else if (/CrOS/.test(ua)) os = 'ChromeOS'; else if (/Linux/.test(ua)) os = 'Linux';
    return b + ' on ' + os;
  }
  var TZ_PLACE = { 'Asia/Kolkata': 'India', 'Asia/Calcutta': 'India', 'Asia/Dubai': 'the UAE', 'Asia/Singapore': 'Singapore', 'Europe/London': 'the UK', 'America/New_York': 'US East Coast', 'America/Chicago': 'US Central', 'America/Denver': 'US Mountain', 'America/Los_Angeles': 'US West Coast', 'Australia/Sydney': 'Sydney', 'Europe/Berlin': 'Germany', 'Europe/Paris': 'France', 'Asia/Tokyo': 'Japan' };
  function bvTime() {
    var tz = 'your time zone';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (e) {}
    var place = TZ_PLACE[tz] || (tz.indexOf('/') > -1 ? tz.split('/').pop().replace(/_/g, ' ') : tz);
    var t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return t + ', ' + place;
  }
  function bvFrom() {
    var r = document.referrer, host = '';
    try { host = r ? new URL(r).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (!host || host === location.hostname) return null;
    if (/linkedin\.com$|lnkd\.in$/.test(host)) return 'LinkedIn';
    if (/google\./.test(host)) return 'Google';
    if (/github\.com$/.test(host)) return 'GitHub';
    if (/naukri\.com$/.test(host)) return 'Naukri';
    if (/indeed\./.test(host)) return 'Indeed';
    return host;
  }
  function bvScreen() {
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    return screen.width + ' × ' + screen.height + ', ' + (dark ? 'dark mode' : 'light mode');
  }
  function bvDevice() {
    var c = navigator.hardwareConcurrency, m = navigator.deviceMemory, touch = navigator.maxTouchPoints > 0;
    var parts = [];
    if (c) parts.push(c + ' processor cores');
    if (m) parts.push('about ' + m + ' GB memory');
    if (!parts.length) parts.push(touch ? 'a phone or tablet' : 'a laptop or desktop');
    return parts.join(', ');
  }
  if (bv) {
    var from = bvFrom();
    var VALS = { browser: bvBrowser(), time: bvTime(), from: from, screen: bvScreen(), device: bvDevice() };
    if (!from) {
      // where they came from is often hidden (apps, email); show something always true instead
      var lang = navigator.language || 'en';
      try { lang = new Intl.DisplayNames([lang], { type: 'language' }).of(lang) || lang; } catch (e) {}
      VALS.from = lang;
      var fromLi = $('.bv-list li[data-k="from"]', bv);
      $('.bv-label', fromLi).textContent = 'your language';
      $('.bv-ico', fromLi).innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var loadS = nav && nav.domContentLoadedEventEnd > 0 ? nav.domContentLoadedEventEnd / 1000 : performance.now() / 1000;
    $('#bvLoad').textContent = (loadS < 0.1 ? loadS.toFixed(2) : loadS.toFixed(1)) + ' s';
    $$('.bv-list li', bv).forEach(function (li, i) {
      var val = VALS[li.getAttribute('data-k')];
      setTimeout(function () { $('.bv-text', li).textContent = val; li.classList.add('in'); }, reduce ? 0 : 350 + i * 380);
    });
    setTimeout(function () { bv.classList.add('done'); }, reduce ? 0 : 350 + 5 * 380);
    var redact = $('#bvRedact');
    redact.addEventListener('click', function () {
      var on = !bv.classList.contains('redacted');
      bv.classList.toggle('redacted', on);
      redact.setAttribute('aria-pressed', String(on));
      redact.textContent = on ? 'Show it again' : 'Redact my data';
    });
    var how = $('#bvHow'), howBox = $('#bvHowBox');
    how.addEventListener('click', function () {
      var open = howBox.hidden;
      howBox.hidden = !open;
      how.setAttribute('aria-expanded', String(open));
    });
  }

  /* ================= Tabnabbing surprise (harmless, once per visit) ================= */
  (function () {
    var done = false, armed = false, realTitle = document.title, icon = document.querySelector('link[rel="icon"]'), realIcon = icon && icon.href;
    var FAKE_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23e8eaed'/%3E%3Crect x='18' y='28' width='28' height='22' rx='4' fill='%235f6368'/%3E%3Cpath d='M24 28v-6a8 8 0 0 1 16 0v6' fill='none' stroke='%235f6368' stroke-width='5'/%3E%3C/svg%3E";
    // only once they're actually reading (scrolled past the front page), so a quick tab switch never looks like phishing
    var arm = function () { if (!armed && scrollY > innerHeight * 0.9) { armed = true; removeEventListener('scroll', arm); } };
    addEventListener('scroll', arm, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (done || !armed) return;
      if (document.hidden) {
        document.title = 'Sign in to continue (just kidding: tabnabbing demo)';
        if (icon) icon.href = FAKE_ICON;
        armed = 'swapped';
      } else if (armed === 'swapped') {
        done = true;
        document.title = realTitle;
        if (icon) icon.href = realIcon;
        capture('tab');
        setTimeout(function () { toast('While you were away, this tab pretended to be a login page. That\'s called tabnabbing. Don\'t worry, I\'m one of the good ones.'); }, 400);
      }
    });
  })();

  /* ================= Spot the scam ================= */
  var phone = $('#phone'), phFound = $('#phFound'), phLeft = $('#phLeft'), found = {};
  var WHY = [
    ['Unknown sender', 'a random international number, not your bank\'s registered sender ID'],
    ['Fake urgency', 'a deadline designed to make you act before you think'],
    ['Look-alike link', 'not the bank\'s real domain, just one that sounds close'],
    ['Asks for an OTP', 'no real bank ever asks you to share a one-time password']
  ];
  $$('.flag', phone).forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.getAttribute('data-flag');
      if (found[i]) return;
      found[i] = true;
      b.classList.add('hit');
      var li = document.createElement('li');
      li.innerHTML = '<b></b> ';
      li.firstChild.textContent = WHY[i][0] + ':';
      li.appendChild(document.createTextNode(WHY[i][1]));
      phFound.appendChild(li);
      var n = Object.keys(found).length;
      phone.setAttribute('data-found', n);
      if (n === 4) capture('scam');
      phLeft.textContent = 4 - n;
    });
  });
  $('#phReset').addEventListener('click', function () {
    found = {}; phFound.innerHTML = ''; phone.setAttribute('data-found', '0'); phLeft.textContent = '4';
    $$('.flag', phone).forEach(function (b) { b.classList.remove('hit'); });
    $('.flag', phone).focus({ preventScroll: true });
  });

  /* ================= Reveal on scroll ================= */
  if ('IntersectionObserver' in window) {
    var rv = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
    }, { threshold: 0.18 });
    $$('.reveal, .roe').forEach(function (el) { rv.observe(el); });
  } else $$('.reveal, .roe').forEach(function (el) { el.classList.add('in'); });

  /* ================= Scroll-played project scenes ================= */
  var steps = $$('.step'), scenes = $$('.scene'), dots = $$('.stage-dots i');
  var mobile = window.matchMedia('(max-width: 900px)');

  // VulnScan: scan finds 3 issues, then fixes land and the grade climbs from D to A
  var vsItems = $$('#vsChecks li'), vsGrade = $('#vsGrade'), vsRing = $('#vsRing'), vsPhase = $('#vsPhase'), vsCi = $('#vsCi');
  var badIdx = vsItems.map(function (li, i) { return li.hasAttribute('data-bad') ? i : -1; }).filter(function (i) { return i > -1; });
  function vuln(p) {
    var scanned = Math.floor(clamp(p / 0.5, 0, 1) * 8.999);
    var nFixed = p < 0.5 ? 0 : Math.floor(clamp((p - 0.5) / 0.4, 0, 1) * 3.999);
    vsItems.forEach(function (li, i) {
      var bad = li.hasAttribute('data-bad'), on = i < scanned || p >= 0.5;
      li.className = !on ? '' : bad ? ('bad' + (badIdx.indexOf(i) < nFixed ? ' fixed' : '')) : 'ok';
    });
    var g = ['D', 'C', 'B', 'A'][nFixed], frac = [0.35, 0.55, 0.78, 1][nFixed];
    var done = scanned >= 8 || p >= 0.5;
    vsGrade.textContent = done ? g : '…';
    vsRing.style.strokeDashoffset = done ? (314 * (1 - frac)).toFixed(1) : (314 * (1 - scanned / 8 * 0.35)).toFixed(1);
    vsRing.classList.toggle('good', nFixed === 3);
    vsPhase.textContent = p < 0.5 ? 'scanning' : nFixed < 3 ? 'fixing' : 'all fixed';
    vsCi.classList.toggle('on', p > 0.88);
    if (nFixed === 3) capture('grade');
  }
  // SAGE: a message is typed, the secret gets caught before send
  var sgText = $('#sgText'), sgSecret = $('#sgSecret'), sgBlock = $('#sgBlock'), sgScene = $('.sc-sage');
  var MSG = 'Can you debug my login? My key is ', KEY = 'sk-live-8f3kQ29xT7wLp1';
  function sage(p) {
    var n = Math.floor(clamp(p / 0.5, 0, 1) * (MSG.length + KEY.length));
    sgText.textContent = MSG.slice(0, n);
    sgSecret.textContent = n > MSG.length ? KEY.slice(0, n - MSG.length) : '';
    var caught = p > 0.55;
    sgSecret.classList.toggle('redacted', caught);
    sgBlock.classList.toggle('on', caught);
    sgScene.style.setProperty('--p', clamp((p - 0.58) / 0.3, 0, 1).toFixed(3));
  }
  // MedSentry: the ECG draws itself, the impossible spike gets flagged
  var medScene = $('.sc-med'), hr = $('#ecgHr'), flag = $('#ecgFlag');
  function med(p) {
    var q = clamp(p / 0.85, 0, 1);
    medScene.style.setProperty('--p', q.toFixed(3));
    var spike = q > 0.66 && q < 0.74;
    hr.textContent = spike ? '230' : String(70 + Math.round(Math.sin(q * 20) * 3));
    hr.classList.toggle('alarm', spike || q >= 0.74);
    if (q >= 0.74) hr.textContent = '230';
    flag.classList.toggle('on', q > 0.68);
  }
  // Federated IDS: model updates travel, raw traffic doesn't
  var idsScene = $('.sc-ids'), flRound = $('#flRound'), flPk = $('#flPkts'), NS = 'http://www.w3.org/2000/svg';
  var flEdges = [0, 1, 2].map(function (i) { var e = $('#flE' + i); return { e: e, len: e.getTotalLength() }; });
  var flDots = flEdges.map(function () { var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '7'); c.setAttribute('class', 'pkt'); flPk.appendChild(c); return c; });
  function ids(p) {
    var q = clamp(p / 0.9, 0, 0.999);
    flRound.textContent = 1 + Math.floor(q * 3);
    var t = (q * 3) % 1;
    flEdges.forEach(function (ed, i) {
      var pt = ed.e.getPointAtLength(clamp(t * 1.1 - i * 0.05, 0, 1) * ed.len);
      flDots[i].setAttribute('cx', pt.x.toFixed(1)); flDots[i].setAttribute('cy', pt.y.toFixed(1));
    });
    idsScene.style.setProperty('--p', clamp((p - 0.45) / 0.4, 0, 1).toFixed(3));
  }
  var UPD = [vuln, sage, med, ids];
  var cur = -1;
  function scenesTick() {
    var line = innerHeight * (mobile.matches ? 0.78 : 0.55), idx = 0, prog = 0;
    steps.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      if (r.top <= line) { idx = i; prog = clamp((line - r.top) / r.height, 0, 1); }
    });
    if (idx !== cur) {
      cur = idx;
      scenes.forEach(function (sc, i) { sc.classList.toggle('on', i === idx); });
      steps.forEach(function (st, i) { st.classList.toggle('on', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }
    UPD[idx](reduce ? 1 : prog);
  }


  /* ================= Active nav link ================= */
  var navLinks = $$('.nav-pill a');
  function navTick() {
    var y = innerHeight * 0.35, on = null;
    navLinks.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < y) on = a; });
    navLinks.forEach(function (a) { a.classList.toggle('on', a === on); });
  }


  /* ================= Pentest progress rail ================= */
  var railLinks = $$('.rail a'), railPct = $('#railPct'), railBar = $('#railBar');
  function railTick() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var pct = max > 0 ? Math.round(clamp(scrollY / max, 0, 1) * 100) : 0;
    railPct.textContent = pct;
    railBar.style.transform = 'scaleX(' + (pct / 100) + ')';
    var y = innerHeight * 0.4, cur = -1;
    railLinks.forEach(function (a, i) { var s = document.getElementById(a.getAttribute('data-sec')); if (s && s.getBoundingClientRect().top < y) cur = i; });
    railLinks.forEach(function (a, i) { a.classList.toggle('on', i === cur); a.classList.toggle('done', i < cur); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; scenesTick(); navTick(); railTick(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ================= 30-second view ================= */
  var SKIM = {
    sec: [
      'Security internship (2026): ran an independent VAPT of a production platform\'s APIs. Critical access-control issues reported, fixed and re-tested.',
      'Built VulnScan Pro: a 15-check web scanner, live on AWS, with findings mapped to OWASP Top 10, CWE and CVSS.',
      'SAGE: owned the on-device ML that blocks secrets before they reach AI chatbots (0.89 F1 vs 0.69 baseline).',
      'ISC2 Certified in Cybersecurity, Cisco Ethical Hacker, IBM SOC in Practice, AWS Security Fundamentals.'
    ],
    swe: [
      'VulnScan Pro: Flask API with auth and rate limiting, SQLAlchemy, Docker, deployed on AWS.',
      'Ruff linting and 52 tests on every push with GitHub Actions.',
      'Web internship (2025): a responsive, accessibility-first e-commerce site, launched for a client.',
      'Python, Java, SQL and C, with DSA, DBMS and networks coursework.'
    ],
    ml: [
      'SAGE: fine-tuned DistilBERT, exported to ONNX to run in the browser. 0.89 macro F1 vs 0.69.',
      'Federated IDS: 90%+ accuracy on unseen networks vs 25–40% centralised, across 11M+ samples.',
      'MedSentry: built a 3,395-message HL7 evaluation set and scored the detector against 5 baselines.',
      'Remote sensing internship (2024): flood classifiers on satellite radar in Google Earth Engine.'
    ]
  };
  var skim = $('#skim'), skimTabs = $$('.skim-tab'), skimList = $('#skimList');
  function skimShow(role, focus) {
    skimTabs.forEach(function (t) {
      var on = t.getAttribute('data-role') === role;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    skimList.innerHTML = '';
    SKIM[role].forEach(function (s) { var li = document.createElement('li'); li.textContent = s; skimList.appendChild(li); });
  }
  skimTabs.forEach(function (t, i) {
    t.addEventListener('click', function () { skimShow(t.getAttribute('data-role')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); skimShow(skimTabs[(i + d + skimTabs.length) % skimTabs.length].getAttribute('data-role'), true); }
    });
  });
  skimShow('sec');
  $('#skimBtn').addEventListener('click', function () { if (skim.showModal) skim.showModal(); });
  $('#skimClose').addEventListener('click', function () { skim.close(); });
  skim.addEventListener('click', function (e) { if (e.target === skim) skim.close(); });

  /* ================= Copy email ================= */
  var copyBtn = $('#copyEmail');
  copyBtn.addEventListener('click', function () {
    var done = function (ok) {
      if (!ok) { location.href = 'mailto:' + EMAIL; return; }
      copyBtn.textContent = 'copied to clipboard';
      setTimeout(function () { copyBtn.textContent = EMAIL; }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
})();
