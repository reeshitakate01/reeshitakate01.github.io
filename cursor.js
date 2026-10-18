// Bitsy: a little ladybug that follows the cursor, comments on what you hover, and naps when you stop.
(function () {
  'use strict';
  var toggle = document.getElementById('bugToggle');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) { if (toggle) toggle.hidden = true; return; }

  var enabled = true;
  try { enabled = localStorage.getItem('rk-bug') !== 'off'; } catch (e) {}

  var SVG =
    '<svg viewBox="0 0 40 48" width="20" height="24">' +
      '<g stroke="#16130f" stroke-width="2.2" stroke-linecap="round" fill="none">' +
        '<path class="lg l1" d="M12 20 L4 15"/><path class="lg l2" d="M11 27 L3 27"/><path class="lg l3" d="M12 34 L4 40"/>' +
        '<path class="lg r1" d="M28 20 L36 15"/><path class="lg r2" d="M29 27 L37 27"/><path class="lg r3" d="M28 34 L36 40"/>' +
        '<path d="M17 8 Q14 2 10 3 M23 8 Q26 2 30 3" stroke-width="2"/>' +
      '</g>' +
      '<ellipse cx="20" cy="29" rx="11" ry="13" fill="#ff9e8a" stroke="#16130f" stroke-width="2.4"/>' +
      '<line x1="20" y1="17" x2="20" y2="42" stroke="#16130f" stroke-width="2"/>' +
      '<g fill="#16130f"><circle cx="15" cy="27" r="2.3"/><circle cx="25" cy="31" r="2.3"/><circle cx="16" cy="35.5" r="1.8"/><circle cx="24.5" cy="23" r="1.8"/></g>' +
      '<circle cx="20" cy="13" r="6.5" fill="#2b2620" stroke="#16130f" stroke-width="2"/>' +
      '<g class="eyes"><circle cx="17.4" cy="11.6" r="2.3" fill="#fff"/><circle cx="22.6" cy="11.6" r="2.3" fill="#fff"/>' +
      '<circle class="pupil" cx="17.7" cy="11" r="1.05" fill="#16130f"/><circle class="pupil" cx="22.9" cy="11" r="1.05" fill="#16130f"/></g>' +
    '</svg>';

  var el = document.createElement('div');
  el.className = 'buddy gone';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="buddy-bug">' + SVG + '</div><span class="buddy-say"></span><span class="buddy-z">z<i>z</i><b>z</b></span>';
  document.body.appendChild(el);
  var bug = el.querySelector('.buddy-bug'), say = el.querySelector('.buddy-say');

  // footprint pool
  var feet = [], fi = 0;
  for (var i = 0; i < 16; i++) { var f = document.createElement('span'); f.className = 'foot'; f.setAttribute('aria-hidden', 'true'); document.body.appendChild(f); feet.push(f); }

  var tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, ang = 0, lastMove = 0, seen = false, walked = 0, moving = 0;

  function labelFor(t) {
    if (!t || !t.closest) return '';
    if (t.closest('.arena')) return 'HIDE';
    if (t.closest('.prow')) return 'deal it! 🃏';
    if (t.closest('.live-link, .prow-live')) return 'it’s live! 🟢';
    if (t.closest('.pcard')) return t.closest('a') ? 'open ↗' : 'flip! ↻';
    if (t.closest('#lock3d, #unlockBtn')) return 'unlock? 🔓';
    if (t.closest('.sticker')) return 'drag me!';
    if (t.closest('.keys.big li')) return 'tap tap';
    if (t.closest('.code button')) return 'this line?';
    if (t.closest('#planeBtn')) return 'whoosh ✈️';
    if (t.closest('#trophyBtn')) return 'shiny 🏆';
    if (t.closest('.lens-btn')) return 'filter';
    if (t.closest('a[download]')) return 'grab it ↓';
    if (t.closest('a[target="_blank"]')) return 'new tab ↗';
    if (t.closest('a, button, [role="button"]')) return 'click!';
    return '';
  }

  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY; lastMove = performance.now();
    if (!seen) { seen = true; x = tx; y = ty; }
    el.classList.remove('gone', 'sleep');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { el.classList.add('gone'); });
  document.addEventListener('pointerover', function (e) {
    var l = labelFor(e.target);
    el.classList.toggle('hide', l === 'HIDE');
    if (l === 'HIDE') l = '';
    if (l) say.textContent = l;
    el.classList.toggle('talk', !!l);
  });

  var COLORS = ['#bff3d4', '#ddd1ff', '#ffeaa0', '#ffcdb8', '#c6e6ff'];
  document.addEventListener('pointerdown', function (e) {
    if (!enabled || e.pointerType !== 'mouse' || (e.target.closest && e.target.closest('.arena'))) return;
    for (var k = 0; k < 7; k++) {
      var s = document.createElement('span');
      s.className = 'spark';
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.background = COLORS[k % COLORS.length];
      (document.querySelector('dialog[open]') || document.body).appendChild(s);
      var a = (k / 7) * Math.PI * 2 + Math.random() * 0.5, d = 22 + Math.random() * 18;
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(0)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(s);
    }
    bug.animate([{ transform: 'rotate(' + ang + 'deg) scale(1)' }, { transform: 'rotate(' + ang + 'deg) scale(1.35)' }, { transform: 'rotate(' + ang + 'deg) scale(1)' }], { duration: 300, easing: 'cubic-bezier(.3,1.8,.5,1)' });
  });

  function setEnabled(on) {
    enabled = on;
    el.classList.toggle('off', !on);
    // the bug replaces the system cursor only while it's switched on
    document.documentElement.classList.toggle('bug-cursor', on);
    if (toggle) { toggle.textContent = '🐞 cursor bug: ' + (on ? 'on' : 'off'); toggle.setAttribute('aria-pressed', String(on)); }
    try { localStorage.setItem('rk-bug', on ? 'on' : 'off'); } catch (e) {}
  }
  if (toggle) toggle.addEventListener('click', function () { setEnabled(!enabled); });
  setEnabled(enabled);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!enabled || !seen) return;
    // modal dialogs live in the top layer, so carry the bug into whichever one is open
    var host = document.querySelector('dialog[open]') || document.body;
    if (el.parentNode !== host) host.appendChild(el);
    // the bug IS the cursor: its head sits exactly on the pointer, its body swings behind the direction of travel
    var vx = tx - x, vy = ty - y;
    x = tx; y = ty;
    // keep the speech bubble on screen near the edges
    el.classList.toggle('below', y < 56);
    el.classList.toggle('left', x > innerWidth - 140);
    var speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 1.5) {
      var target = Math.atan2(vy, vx) * 180 / Math.PI + 90;
      var diff = ((target - ang + 540) % 360) - 180;
      ang += diff * 0.25;
    }
    moving = speed > 0.5 ? 8 : Math.max(0, moving - 1);
    el.classList.toggle('walking', moving > 0);
    if (now - lastMove > 4500 && !el.classList.contains('talk')) el.classList.add('sleep');

    walked += speed;
    if (walked > 18 && speed > 0.5) {
      walked = 0;
      // footprints land where the little legs are: behind the head, alternating left/right
      var f = feet[fi++ % feet.length], r = ang * Math.PI / 180, back = 10, off = (fi % 2 ? 3.5 : -3.5);
      f.style.left = (x - Math.sin(r) * back + Math.cos(r) * off) + 'px';
      f.style.top = (y + Math.cos(r) * back + Math.sin(r) * off) + 'px';
      f.animate([{ opacity: 0.3 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in' });
    }
    el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    bug.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
  }
  requestAnimationFrame(frame);
})();
