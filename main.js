(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function party(opts) {
    if (reduce || typeof window.confetti !== 'function') return;
    window.confetti(Object.assign({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors: ['#bff3d4', '#ddd1ff', '#ffeaa0', '#ffcdb8', '#c6e6ff', '#ff5a36'] }, opts || {}));
  }
  window.rkParty = party;

  /* =============== Achievements =============== */
  var ACH = [
    { id: 'lock', ico: '🔓', name: 'Locksmith', how: 'Unlock my profile (the 3D padlock).' },
    { id: 'sticker', ico: '🎨', name: 'Sticker artist', how: 'Drag a sticker somewhere new.' },
    { id: 'lens', ico: '🔍', name: 'Recruiter mode', how: "Use the “I'm hiring for” filter." },
    { id: 'cards', ico: '🃏', name: 'Card collector', how: 'Flip all 4 project cards.' },
    { id: 'bugs', ico: '🐛', name: 'Exterminator', how: 'Score 10+ in Bug Hunt.' },
    { id: 'vuln', ico: '🔎', name: 'Code reviewer', how: 'Get 3+ right in Spot the Vuln.' },
    { id: 'secret', ico: '🕵️', name: 'Secret agent', how: 'Find the hidden easter egg.' },
    { id: 'end', ico: '🏁', name: 'Completionist', how: 'Scroll all the way to the end.' }
  ];
  var got = store.get('rk-ach-v2', {});
  var trophyBtn = $('#trophyBtn'), trophyCount = $('#trophyCount');
  function renderAch() {
    var n = ACH.filter(function (a) { return got[a.id]; }).length;
    trophyCount.textContent = n;
    trophyBtn.setAttribute('aria-label', 'Achievements: ' + n + ' of ' + ACH.length + ' unlocked');
    $('#achList').innerHTML = ACH.map(function (a) {
      return '<li class="' + (got[a.id] ? 'got' : '') + '"><span class="ach-ico" aria-hidden="true">' + a.ico + '</span><div><b>' + a.name + (got[a.id] ? ' ✓' : '') + '</b><span>' + a.how + '</span></div></li>';
    }).join('');
  }
  function toast(ico, title, kicker) {
    var box = $('#toasts');
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="t-ico" aria-hidden="true">' + ico + '</span><div><small>' + (kicker || 'achievement unlocked') + '</small><b>' + title + '</b></div>';
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 320); }, 3200);
  }
  function unlock(id) {
    if (got[id]) return;
    var a = ACH.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    got[id] = true; store.set('rk-ach-v2', got); renderAch();
    toast(a.ico, a.name);
    trophyBtn.classList.remove('bump'); void trophyBtn.offsetWidth; trophyBtn.classList.add('bump');
    if (ACH.every(function (x) { return got[x.id]; })) {
      setTimeout(function () { toast('👑', 'All 8 unlocked. You should probably hire me.', 'legendary'); party({ particleCount: 200, spread: 120 }); }, 900);
    }
  }
  window.rkUnlock = unlock;
  renderAch();
  var achDlg = $('#achDlg');
  trophyBtn.addEventListener('click', function () { renderAch(); achDlg.showModal ? achDlg.showModal() : null; });
  $('#achClose').addEventListener('click', function () { achDlg.close(); });
  achDlg.addEventListener('click', function (e) { if (e.target === achDlg) achDlg.close(); });

  /* =============== Hero word rotator =============== */
  var WORDS = [
    ['break', 'things <span class="scribble">(on purpose)</span>'],
    ['build', 'bug-catching tools'],
    ['secure', 'APIs for a living'],
    ['train', 'ML to spot attacks'],
    ['test', 'everything. twice.']
  ];
  var rot = $('#rotator'), rest = $('.hero-line-rest'), wi = 0;
  setInterval(function () {
    wi = (wi + 1) % WORDS.length;
    rot.textContent = WORDS[wi][0];
    rest.innerHTML = WORDS[wi][1];
    rot.classList.remove('swap'); void rot.offsetWidth; rot.classList.add('swap');
  }, 2600);

  /* =============== Draggable stickers =============== */
  var wide = window.matchMedia('(min-width: 901px)');
  $$('.sticker').forEach(function (s) {
    var sx, sy, ox, oy, moved, box;
    s.addEventListener('pointerdown', function (e) {
      if (!wide.matches) return;
      box = s.parentElement.getBoundingClientRect();
      var r = s.getBoundingClientRect();
      ox = e.clientX - (r.left + r.width / 2); oy = e.clientY - (r.top + r.height / 2);
      sx = e.clientX; sy = e.clientY; moved = false;
      s.setPointerCapture(e.pointerId); s.classList.add('dragging');
    });
    s.addEventListener('pointermove', function (e) {
      if (!s.classList.contains('dragging')) return;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6) moved = true;
      var x = Math.max(3, Math.min(97, ((e.clientX - ox - box.left) / box.width) * 100));
      var y = Math.max(3, Math.min(97, ((e.clientY - oy - box.top) / box.height) * 100));
      s.style.setProperty('--x', x + '%'); s.style.setProperty('--y', y + '%');
    });
    function drop() {
      if (!s.classList.contains('dragging')) return;
      s.classList.remove('dragging');
      s.style.setProperty('--r', (Math.random() * 24 - 12).toFixed(1) + 'deg');
      if (moved) unlock('sticker');
    }
    s.addEventListener('pointerup', drop);
    s.addEventListener('pointercancel', drop);
  });

  /* =============== Padlock (3D lives in lock3d.js) =============== */
  var bubble = $('#bubble'), unlockBtn = $('#unlockBtn'), lockWrap = $('#lockWrap');
  var BUBBLES = ['access granted ✨', 'welcome in 💚', 'no CVEs here 😌', 'hi hi hi 👋'];
  var bi = 0, lockTimer, lockCard = $('#lockCard'), lockBack = $('#lockBack');
  window.addEventListener('lockstate', function (e) {
    var open = e.detail.open;
    unlockBtn.textContent = open ? '🔒 Lock it again' : '🔓 Unlock my profile';
    unlockBtn.setAttribute('aria-pressed', String(open));
    clearTimeout(lockTimer);
    if (open) {
      bubble.textContent = BUBBLES[bi++ % BUBBLES.length];
      bubble.classList.add('show');
      var r = lockWrap.getBoundingClientRect();
      party({ origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.4) / innerHeight }, particleCount: 70 });
      unlock('lock');
      // let the shackle pop first, then flip the card to reveal the profile
      lockTimer = setTimeout(function () {
        lockCard.classList.add('flipped'); lockBack.inert = false; lockWrap.inert = true;
      }, reduce ? 0 : 950);
    } else {
      bubble.classList.remove('show');
      lockCard.classList.remove('flipped'); lockBack.inert = true; lockWrap.inert = false;
    }
  });
  // if the 3D padlock hasn't started after a few seconds (no WebGL, offline, blocked CDN), show the drawn one
  setTimeout(function () { if (!window.rkLock) lockWrap.classList.add('no-webgl'); }, 3500);
  $('.lock-fallback').addEventListener('click', function () { unlockBtn.click(); });
  $('#relockBtn').addEventListener('click', function () { unlockBtn.click(); unlockBtn.focus({ preventScroll: true }); });
  var fallbackOpen = false;
  unlockBtn.addEventListener('click', function () {
    if (window.rkLock) window.rkLock.toggle();
    else {
      fallbackOpen = !fallbackOpen;
      $('.lock-fallback').classList.toggle('open', fallbackOpen);
      window.dispatchEvent(new CustomEvent('lockstate', { detail: { open: fallbackOpen } }));
    }
  });

  /* =============== Hiring lens =============== */
  var HINTS = {
    all: "Pick one and I'll highlight what's relevant for you.",
    sec: 'Security: start with the Sciqus VAPT quest and VulnScan Pro. Then try Spot the Vuln below.',
    swe: 'Software eng: open VulnScan Pro (it\u2019s live on AWS). Flask API, SQL, Docker, 52 tests in CI.',
    ml: 'ML / AI: SAGE (DistilBERT in the browser, 0.89 F1) and the federated IDS (90%+ on unseen data).'
  };
  $$('.lens-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var lens = b.dataset.lens;
      $$('.lens-btn').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      document.body.classList.toggle('lensing', lens !== 'all');
      $$('[data-tags]').forEach(function (el) { el.classList.toggle('match', el.dataset.tags.split(' ').indexOf(lens) > -1); });
      $('#lensHint').textContent = HINTS[lens];
      $('#lensClear').hidden = lens === 'all';
      if (lens !== 'all') unlock('lens');
    });
  });
  $('#lensClear').addEventListener('click', function () { $('.lens-btn[data-lens="all"]').click(); });

  /* =============== Reveal, counters =============== */
  function countUp(el) {
    var target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min((now - t0) / 1300, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    })(t0);
    setTimeout(function () { el.textContent = target; }, 1600);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('[data-count]', en.target).concat(en.target.dataset.count ? [en.target] : []).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
    new IntersectionObserver(function (ents) { if (ents[0].isIntersecting) unlock('end'); }, { threshold: 0.9 }).observe($('#footer'));
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* =============== Pune clock =============== */
  var clock = $('#clock'), clockStatus = $('#clockStatus');
  function tick() {
    var now = new Date();
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    clock.textContent = parts;
    var h = +parts.slice(0, 2), s;
    if (h < 6) s = 'asleep. probably. 😴';
    else if (h < 10) s = 'coffee + inbox ☕';
    else if (h < 13) s = 'breaking APIs (ethically) 🔨';
    else if (h < 17) s = 'writing tests ✅';
    else if (h < 21) s = 'training a model 🧠';
    else s = 'one more commit 🌙';
    clockStatus.textContent = s;
  }
  tick(); setInterval(tick, 20000);

  /* =============== Flip tiles + project cards =============== */
  $$('[data-flip]').forEach(function (b) {
    b.addEventListener('click', function () { $('#' + b.dataset.flip).classList.toggle('flipped'); });
  });
  // The whole card flips on click. The hover tilt lives on the outer .pcard so it never fights the flip transform on .pcard-inner.
  var flippedCards = {};
  $$('.pcard').forEach(function (card, idx) {
    var front = $('.pcard-front', card), back = $('.pcard-back', card);
    back.inert = true;
    function flip() {
      var on = card.classList.toggle('flipped');
      front.inert = on; back.inert = !on;
      $$('.flip-btn', card).forEach(function (x) { x.setAttribute('aria-expanded', String(on)); });
      if (on) { flippedCards[idx] = 1; if (Object.keys(flippedCards).length === 4) unlock('cards'); }
      return on;
    }
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var fromKeyboard = e.detail === 0;
      var on = flip();
      if (fromKeyboard) $(on ? '.pcard-back .flip-btn' : '.pcard-front .flip-btn', card).focus({ preventScroll: true });
    });
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      front.style.setProperty('--mx', x * 100 + '%'); front.style.setProperty('--my', y * 100 + '%'); front.style.setProperty('--hx', x * 100 + '%');
      if (!reduce) {
        // gentle tilt (max ~3deg), eased slowly, and frozen while you're over a button or link so it's easy to click
        if (e.target.closest('a, button')) return;
        card.style.transition = 'transform .6s cubic-bezier(.2,.7,.3,1)';
        card.style.transform = 'perspective(1200px) rotateX(' + ((0.5 - y) * 3).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 4).toFixed(2) + 'deg)';
      }
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  /* =============== Keycaps =============== */
  $$('.keys.big li').forEach(function (k) {
    k.addEventListener('click', function () { k.classList.add('pressed'); setTimeout(function () { k.classList.remove('pressed'); }, 160); });
  });

  /* =============== Bug Hunt =============== */
  var arena = $('#arena'), msg = $('#arenaMsg');
  var hudScore = $('#bhScore'), hudTime = $('#bhTime'), hudBest = $('#bhBest'), bhStatus = $('#bhStatus');
  var best = store.get('rk-bughunt-best', 0); hudBest.textContent = best;
  var BUGS = ['🐛', '🐞', '🪲', '🦟'];
  var game = null;
  function rank(s) {
    if (s >= 20) return 'Reeshita-level 🏆';
    if (s >= 15) return 'Senior AppSec engineer';
    if (s >= 10) return 'Junior pentester';
    if (s >= 5) return 'Script kiddie';
    return 'Intern who pushed to prod';
  }
  function popText(x, y, txt, cls) {
    var p = document.createElement('span');
    p.className = 'pop ' + cls; p.textContent = txt;
    p.style.left = x + 'px'; p.style.top = y - 20 + 'px';
    arena.appendChild(p); setTimeout(function () { p.remove(); }, 800);
  }
  function spawn() {
    var W = arena.clientWidth, H = arena.clientHeight;
    var feature = Math.random() < 0.22;
    var c = document.createElement('button');
    c.type = 'button'; c.className = 'critter';
    c.textContent = feature ? '✨' : BUGS[(Math.random() * BUGS.length) | 0];
    c.setAttribute('aria-label', feature ? 'feature, do not squash' : 'bug, squash it');
    var o = { el: c, feature: feature, x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60), a: Math.random() * Math.PI * 2, v: feature ? 30 : 55 + Math.random() * 70 + game.level * 12, born: performance.now(), life: feature ? 2600 : 2200 + Math.random() * 1200, dead: false };
    c.addEventListener('pointerdown', function (e) { e.preventDefault(); hit(o); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(o); } });
    arena.appendChild(c); game.critters.push(o);
  }
  function hit(o) {
    if (!game || o.dead) return;
    o.dead = true; o.el.classList.add('squashed');
    setTimeout(function () { o.el.remove(); }, 400);
    if (o.feature) { game.score = Math.max(0, game.score - 2); popText(o.x, o.y, '−2 that was a feature!', 'minus'); }
    else { game.score++; popText(o.x, o.y, '+1', 'plus'); }
    hudScore.textContent = game.score;
  }
  function loop(now) {
    if (!game) return;
    var dt = Math.min((now - game.last) / 1000, 0.05); game.last = now;
    var left = Math.max(0, 20 - (now - game.start) / 1000);
    hudTime.textContent = Math.ceil(left);
    game.level = Math.floor((20 - left) / 5);
    if (now - game.lastSpawn > Math.max(320, 720 - game.level * 110)) { spawn(); game.lastSpawn = now; }
    var W = arena.clientWidth, H = arena.clientHeight;
    game.critters = game.critters.filter(function (o) {
      if (o.dead) return false;
      if (now - o.born > o.life) { o.el.remove(); return false; }
      o.a += (Math.random() - 0.5) * 3 * dt;
      o.x += Math.cos(o.a) * o.v * dt; o.y += Math.sin(o.a) * o.v * dt;
      if (o.x < 26 || o.x > W - 26) { o.a = Math.PI - o.a; o.x = Math.max(26, Math.min(W - 26, o.x)); }
      if (o.y < 26 || o.y > H - 26) { o.a = -o.a; o.y = Math.max(26, Math.min(H - 26, o.y)); }
      var deg = o.feature ? Math.sin(now / 200) * 15 : (o.a * 180 / Math.PI + 90);
      o.el.style.transform = 'translate(' + o.x.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px) rotate(' + deg.toFixed(0) + 'deg)';
      return true;
    });
    if (left <= 0) return end();
    requestAnimationFrame(loop);
  }
  function startGame() {
    $$('.critter, .pop', arena).forEach(function (n) { n.remove(); });
    var now = performance.now();
    game = { score: 0, start: now, last: now, lastSpawn: 0, level: 0, critters: [] };
    hudScore.textContent = 0; hudTime.textContent = 20;
    msg.hidden = true; bhStatus.textContent = 'Game started. Squash bugs, avoid features.';
    requestAnimationFrame(loop);
  }
  function end() {
    var s = game.score;
    game.critters.forEach(function (o) { o.el.remove(); });
    game = null;
    var newBest = s > best;
    if (newBest) { best = s; store.set('rk-bughunt-best', best); hudBest.textContent = best; }
    msg.innerHTML = '<p class="arena-title">' + s + ' bug' + (s === 1 ? '' : 's') + ' squashed' + (newBest && s > 0 ? ' · new best!' : '') + '</p>' +
      '<p class="arena-rank">' + rank(s) + '</p>' +
      '<button type="button" class="btn btn-ink" id="bhStart">Play again</button>';
    msg.hidden = false;
    $('#bhStart').addEventListener('click', startGame);
    $('#bhStart').focus({ preventScroll: true });
    bhStatus.textContent = 'Time up. Score ' + s + '. Rank: ' + rank(s) + '.';
    if (s >= 10) { unlock('bugs'); party(); }
  }
  $('#bhStart').addEventListener('click', startGame);

  /* =============== Spot the Vuln =============== */
  var ROUNDS = [
    { title: 'Round 1 · a user search endpoint', code: [
        'def find_user(name):',
        '    db = get_db()',
        '    query = "SELECT * FROM users WHERE name = \'" + name + "\'"',
        '    return db.execute(query).fetchall()'
      ], ans: 2, why: "SQL injection. The name goes straight into the query, so <code>' OR '1'='1</code> dumps every user. Fix: a parameterised query, <code>db.execute(\"... WHERE name = ?\", (name,))</code>." },
    { title: 'Round 2 · fetch an invoice', code: [
        '@app.get("/api/invoices/<int:invoice_id>")',
        '@login_required',
        'def get_invoice(invoice_id):',
        '    invoice = Invoice.query.get_or_404(invoice_id)',
        '    return jsonify(invoice.to_dict())'
      ], ans: 3, why: "IDOR / broken access control. Being logged in isn't the same as being allowed: change the ID and you can read anyone's invoice. This is the bug class I found across a production API. Fix: <code>filter_by(id=invoice_id, owner_id=current_user.id)</code>." },
    { title: 'Round 3 · a friendly greeting', code: [
        'const params = new URLSearchParams(location.search);',
        'const name = params.get("name") || "friend";',
        'greeting.innerHTML = "Hi, " + name + "!";',
        'analytics.track("greeted");'
      ], ans: 2, why: "Cross-site scripting. <code>?name=&lt;img src=x onerror=alert(1)&gt;</code> runs script on the page. Fix: use <code>greeting.textContent</code>." },
    { title: 'Round 4 · link preview service', code: [
        '@app.post("/api/preview")',
        'def preview():',
        '    url = request.json["url"]',
        '    resp = requests.get(url, timeout=5)',
        '    return {"title": extract_title(resp.text)}'
      ], ans: 3, why: "SSRF. The server fetches any URL you give it, including <code>http://169.254.169.254</code> (cloud credentials). VulnScan Pro blocks exactly this. Fix: resolve the host and reject private or reserved IPs." }
  ];
  var sv = { i: 0, score: 0 };
  var svCode = $('#svCode'), svFb = $('#svFb'), svNext = $('#svNext');
  function renderRound() {
    var r = ROUNDS[sv.i];
    $('#svRound').textContent = sv.i + 1; $('#svScore').textContent = sv.score;
    $('#svQ').textContent = r.title + ': which line is vulnerable?';
    svFb.innerHTML = ''; svNext.hidden = true;
    svCode.innerHTML = '';
    r.code.forEach(function (line, li) {
      var item = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = line;
      b.setAttribute('aria-label', 'Line ' + (li + 1) + ': ' + line.trim());
      b.addEventListener('click', function () { answer(li); });
      item.appendChild(b); svCode.appendChild(item);
    });
  }
  function answer(li) {
    var r = ROUNDS[sv.i], btns = $$('button', svCode);
    btns.forEach(function (b) { b.disabled = true; });
    btns[r.ans].classList.add('right');
    var ok = li === r.ans;
    if (ok) sv.score++; else btns[li].classList.add('wrong');
    $('#svScore').textContent = sv.score;
    svFb.innerHTML = (ok ? '<b class="ok">Nice catch! ✅</b> ' : '<b class="no">Not quite. It was line ' + (r.ans + 1) + '.</b> ') + r.why;
    svNext.hidden = false;
    svNext.textContent = sv.i < ROUNDS.length - 1 ? 'Next round →' : 'See results →';
    svNext.focus({ preventScroll: true });
  }
  svNext.addEventListener('click', function () {
    if (sv.i < ROUNDS.length - 1) { sv.i++; renderRound(); return; }
    var s = sv.score;
    $('#svQ').textContent = 'You scored ' + s + '/4. ' + (s === 4 ? 'Flawless. Want a job? Oh wait, I do. 😅' : s >= 3 ? 'Sharp eyes. Code reviewer energy.' : s >= 2 ? 'Not bad! OWASP Top 10 is a fun read.' : 'Bugs: 1, you: 0. Rematch?');
    svCode.innerHTML = ''; svFb.innerHTML = '';
    svNext.textContent = 'Play again ↺';
    if (s >= 3) { unlock('vuln'); party({ particleCount: 60 }); }
    sv = { i: -1, score: 0 };
  });
  renderRound();

  /* =============== Contact =============== */
  var EMAIL = 'reeshitakate01@gmail.com';
  $('#planeBtn').addEventListener('click', function (e) {
    var btn = e.currentTarget, r = btn.getBoundingClientRect();
    if (!reduce) {
      var p = document.createElement('span');
      p.className = 'plane-fly'; p.textContent = '✈️';
      p.style.left = r.left + 10 + 'px'; p.style.top = r.top + 'px';
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 1400);
    }
    setTimeout(function () { location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Hi Reeshita!'); }, reduce ? 0 : 700);
  });
  $('#copyBtn').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    function done(ok) {
      btn.textContent = ok ? 'Copied! ✓' : EMAIL;
      $('#copyStatus').textContent = ok ? 'Email copied to clipboard.' : 'Email: ' + EMAIL;
      if (ok) toast('📋', 'Email copied', 'clipboard');
      setTimeout(function () { btn.textContent = 'Copy email'; }, 2000);
    }
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  /* =============== Easter eggs =============== */
  function secret() {
    unlock('secret');
    party({ particleCount: 160, spread: 140, origin: { y: 0.5 } });
    $$('.sticker').forEach(function (s, i) {
      s.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 700 + i * 90, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    });
  }
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], kpos = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; secret(); }
  });
  var clicks = [];
  $('#logo').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var now = Date.now();
    clicks = clicks.filter(function (t) { return now - t < 2500; }); clicks.push(now);
    if (clicks.length >= 5) { clicks = []; secret(); }
  });

  /* =============== Active nav =============== */
  var links = $$('.nav-links a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var cur = -1;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
      ticking = false;
    });
  }, { passive: true });

  /* =============== Heading word pop-in =============== */
  $$('.sec-head h2').forEach(function (h) {
    var text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + '</span>'; }).join(' ');
  });
  if ('IntersectionObserver' in window) {
    var ho = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ho.unobserve(en.target); } });
    }, { threshold: 0.4 });
    $$('.sec-head').forEach(function (h) { ho.observe(h); });
  } else $$('.sec-head').forEach(function (h) { h.classList.add('in'); });

  /* =============== Hero floaties parallax + 3D tilt on tiles =============== */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hero = $('.hero'), floaties = $('.floaties');
  if (finePointer && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      floaties.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      floaties.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    $$('.tile, .step').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .15s ease-out';
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-3px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* =============== Project index: deal a card (Anacuna-style) =============== */
  var cardDlg = $('#cardDlg'), slot = $('#cardSlot'), deck = $('.cards.deck'), pcards = $$('.pcard'), cur = -1;
  function dealCard(i, fromEl) {
    if (cur > -1) deck.appendChild(pcards[cur]);
    cur = (i + pcards.length) % pcards.length;
    var card = pcards[cur];
    card.classList.remove('flipped');
    $('.pcard-front', card).inert = false; $('.pcard-back', card).inert = true;
    $$('.flip-btn', card).forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    card.classList.add('in'); card.style.transform = ''; card.style.transitionDelay = '0ms';
    slot.appendChild(card);
    $('#cardCount').textContent = (cur + 1) + ' / ' + pcards.length;
    if (reduce || !slot.animate) return;
    var to = slot.getBoundingClientRect(), dx, dy;
    if (fromEl) {
      var from = fromEl.getBoundingClientRect();
      dx = (from.left + from.width * 0.75) - (to.left + to.width / 2);
      dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    } else { dx = (fromEl === false ? -1 : 1) * Math.min(innerWidth * 0.5, 420); dy = 40; }
    slot.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-28deg) rotateY(-85deg) scale(.35)', opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: 'perspective(1200px) translate(0,0) rotate(2deg) rotateY(4deg) scale(1.03)', offset: 0.75 },
      { transform: 'perspective(1200px) rotateX(2deg) rotateY(-3deg)', opacity: 1 }
    ], { duration: 800, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  $$('.prow').forEach(function (row) {
    row.addEventListener('click', function () {
      if (!cardDlg.open) cardDlg.showModal();
      dealCard(+row.dataset.card, row);
    });
  });
  $('#cardPrev').addEventListener('click', function () { dealCard(cur - 1, false); });
  $('#cardNext').addEventListener('click', function () { dealCard(cur + 1, null); });
  $('#cardFlip').addEventListener('click', function () { if (cur > -1) pcards[cur].click(); });
  $('#cardClose').addEventListener('click', function () { cardDlg.close(); });
  cardDlg.addEventListener('click', function (e) { if (e.target === cardDlg) cardDlg.close(); });
  cardDlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') dealCard(cur + 1, null);
    else if (e.key === 'ArrowLeft') dealCard(cur - 1, false);
  });
  cardDlg.addEventListener('close', function () { if (cur > -1) { deck.appendChild(pcards[cur]); cur = -1; } });

  /* =============== Magnetic buttons =============== */
  if (finePointer && !reduce) {
    $$('.hero-ctas .btn, .contact-ctas .btn, .tldr-ctas .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }
  try { sessionStorage.setItem('rk-seen', '1'); } catch (e) {}

  /* =============== Story: scroll-driven chapters =============== */
  // Each .scrolly has a sticky stage and a list of steps; the step in the middle of the screen drives the stage.
  $$('.scrolly').forEach(function (sc) {
    var stage = $('[data-step]', sc), steps = $$('.sstep', sc);
    function setStep(n) {
      stage.setAttribute('data-step', n);
      $$('[data-s]', stage).forEach(function (e) { e.classList.toggle('on', +e.dataset.s <= n); });
      $$('[data-only]', stage).forEach(function (e) { e.classList.toggle('on', +e.dataset.only === n); });
      steps.forEach(function (s, i) { s.classList.toggle('active', i === n); });
    }
    // pick the step closest to the middle of the screen (works for slow scrolls, fast flicks and jumps)
    var current = -1, queued = false;
    function update() {
      queued = false;
      var mid = innerHeight / 2, best = 0, bestD = Infinity;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== current) { current = best; setStep(best); }
    }
    addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  });

  // big outlined chapter number behind each heading, read from its kicker
  $$('.sec-head').forEach(function (h) {
    var k = ($('.sec-kicker', h) || {}).textContent || '', n = k.match(/chapter (\d+)/);
    if (n) h.setAttribute('data-chap', n[1]); else if (/epilogue/.test(k)) h.setAttribute('data-chap', '∞');
  });

  /* =============== Story spine (left rail with a walking ladybug) =============== */
  var spine = $('.spine');
  if (spine) {
    var sLinks = $$('a', spine), sSecs = sLinks.map(function (a) { return $(a.getAttribute('href')); });
    var sBug = $('.spine-bug', spine), sList = $('ol', spine), sTick = false;
    var spineUpdate = function () {
      sTick = false;
      var h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      sBug.style.transform = 'translateY(' + (p * sList.offsetHeight).toFixed(1) + 'px)';
      var cur = 0;
      sSecs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) cur = i; });
      sLinks.forEach(function (a, i) {
        a.classList.toggle('active', i === cur); a.classList.toggle('done', i < cur);
        if (i === cur) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
    };
    addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(spineUpdate); } }, { passive: true });
    addEventListener('resize', spineUpdate);
    spineUpdate();
  }

  /* =============== Story map: a winding level path Bitsy walks along =============== */
  var smap = $('#storymap');
  if (smap) {
    var mSvg = $('.map-path', smap), mBase = $('.mp-base', mSvg), mProg = $('.mp-prog', mSvg), mBug = $('.map-bug', smap);
    var mLevels = $$('.level', smap), mNodes = mLevels.map(function (l) { return $('.node', l); });
    var mLen = 0, mPts = [], mQueued = false;
    var buildMap = function () {
      var r = smap.getBoundingClientRect(), w = smap.offsetWidth, h = smap.offsetHeight;
      mSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); mSvg.setAttribute('width', w); mSvg.setAttribute('height', h);
      mPts = mNodes.map(function (n) { var b = n.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; });
      if (!mPts.length) return;
      // node to node with sideways bulges, so the path winds like a game map (y only ever increases)
      var swing = Math.min(140, w * 0.16), d = 'M' + mPts[0][0] + ' ' + Math.max(0, mPts[0][1] - 70) + ' L' + mPts[0][0] + ' ' + mPts[0][1];
      for (var i = 1; i < mPts.length; i++) {
        var a = mPts[i - 1], b = mPts[i], my = (a[1] + b[1]) / 2, sw = (i % 2 ? 1 : -1) * swing;
        d += ' C' + (a[0] + sw) + ' ' + my + ', ' + (b[0] + sw) + ' ' + my + ', ' + b[0] + ' ' + b[1];
      }
      mBase.setAttribute('d', d); mProg.setAttribute('d', d);
      mLen = mProg.getTotalLength();
      mProg.style.strokeDasharray = mLen;
      updateMap();
    };
    var updateMap = function () {
      mQueued = false;
      if (!mLen) return;
      var r = smap.getBoundingClientRect(), target = innerHeight * 0.55 - r.top;
      if (reduce) target = Infinity;
      // find how far along the path the middle of the screen has reached
      var lo = 0, hi = mLen;
      for (var k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (mProg.getPointAtLength(m).y < target) lo = m; else hi = m; }
      mProg.style.strokeDashoffset = (mLen - lo).toFixed(1);
      var p = mProg.getPointAtLength(lo), q = mProg.getPointAtLength(Math.min(mLen, lo + 3));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90;
      mBug.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + ang.toFixed(0) + 'deg)';
      mLevels.forEach(function (lv, i) { if (mPts[i] && mPts[i][1] <= target + 6) lv.classList.add('unlocked'); });
    };
    addEventListener('scroll', function () { if (!mQueued) { mQueued = true; requestAnimationFrame(updateMap); } }, { passive: true });
    addEventListener('resize', buildMap);
    if ('ResizeObserver' in window) new ResizeObserver(buildMap).observe(smap);
    buildMap();
  }

  $('#yr').textContent = new Date().getFullYear();
})();
