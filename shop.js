/* ============================================================
   Kopi Senja — shop.js
   Nav toggle + scroll reveal (sama seperti index.html) plus
   logic menu lengkap, keranjang, dan checkout demo.
   Dipakai oleh menu.html & pembelian.html.
   ============================================================ */
(function(){
  'use strict';

  /* ---------- nav toggle & scroll reveal (sama seperti index.html) ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (nav && navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- data menu lengkap ---------- */
  const WA_NUMBER = '62887436234143';
  const STORAGE_KEY = 'kopisenja_cart_v1';

  const PRODUCTS = [
    { id:'kopi-senja-signature', category:'Kopi & Minuman', name:'Kopi Senja Signature', price:22000,
      img:'resource/menu/2 es kopi.png',
      desc:'Racikan andalan kami.',
      badge:'Best Seller' },
    { id:'coffee-latte', category:'Kopi & Minuman', name:'Coffee Latte', price:20000,
      img:'resource/menu/1 coffe late.png',
      desc:'Espresso dengan susu steamed lembut, creamy buat nemenin santai sore.' },
    { id:'es-kopi-susu-gula-aren', category:'Kopi & Minuman', name:'Es Kopi Susu Gula Aren', price:18000,
      img:'resource/menu/3 es kopi susu.png',
      desc:'Kopi susu manis gula aren, seimbang dan nggak eneg. Menu paling laris kami.',
      badge:'Favorit' },
    { id:'es-matcha-latte', category:'Kopi & Minuman', name:'Es Matcha Latte', price:19000,
      img:'resource/menu/4 es macha.png',
      desc:'Matcha creamy dingin, buat kamu yang lagi nggak mood kopi.' },
    { id:'eskrim-coklat-kopi', category:'Eskrim', name:'Eskrim Coklat Kopi', price:17000,
      img:'resource/menu/6 eskrim coklat kopi.png',
      desc:'Eskrim coklat dengan sentuhan pahit kopi, dingin dan bikin nagih.' },
    { id:'eskrim-matcha', category:'Eskrim', name:'Eskrim Matcha', price:17000,
      img:'resource/menu/7 eskri macha.png',
      desc:'Eskrim matcha lembut, nggak terlalu manis, cocok buat siang hari.' },
    { id:'croissant-butter', category:'Kudapan', name:'Croissant Butter', price:15000,
      img:'resource/menu/5 Croissant.png',
      desc:'Croissant butter renyah di luar, lembut di dalam. Enak dicelup kopi.' },
    { id:'cake-slice', category:'Kudapan', name:'Cake Slice', price:22000,
      img:'resource/menu/8 cake.png',
      desc:'Sepotong cake lembut, isiannya gantian tiap minggu.' },
    { id:'pastry-manis', category:'Kudapan', name:'Pastry Manis', price:16000,
      img:'resource/menu/9 pastry.png',
      desc:'Pastry manis, pas buat nemenin kopi pagi kamu.' }
  ];

  const CATEGORY_ICONS = {
    'Kopi & Minuman':'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16 Q20 21 31 16 Q20 11 9 16 Z"/><path d="M9 16 V20 C9 28 14 31 20 31 C26 31 31 28 31 20 V16"/><path d="M31 18 C37 18 37 26 30 27"/></svg>',
    'Eskrim':'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 17 C14 11 16.5 7 20 7 C23.5 7 26 11 26 17 Z"/><path d="M13.5 17 H26.5 L20 33 Z"/></svg>',
    'Kudapan':'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 23 C8 14 14 8 20 10 C26 8 32 14 32 23 C26 20 14 20 8 23 Z"/></svg>'
  };

  function formatIDR(n){ return 'Rp ' + Number(n).toLocaleString('id-ID'); }
  function encodeSpaces(path){ return path.split(' ').join('%20'); }

  /* ---------- keranjang (localStorage) ---------- */
  function getCart(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch(e){ return {}; }
  }
  function saveCart(cart){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }catch(e){}
    updateCartBadge();
  }
  function addToCart(id, qty){
    const cart = getCart();
    cart[id] = (cart[id] || 0) + (qty || 1);
    saveCart(cart);
  }
  function setQty(id, qty){
    const cart = getCart();
    if (qty <= 0){ delete cart[id]; } else { cart[id] = qty; }
    saveCart(cart);
  }
  function removeFromCart(id){
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
  }
  function clearCart(){ saveCart({}); }

  function getCartDetailed(){
    const cart = getCart();
    return Object.keys(cart).map(id=>{
      const product = PRODUCTS.find(p=>p.id===id);
      if (!product) return null;
      const qty = cart[id];
      return Object.assign({}, product, { qty, lineTotal: product.price * qty });
    }).filter(Boolean);
  }
  function getCartCount(){
    const cart = getCart();
    return Object.values(cart).reduce((a,b)=>a+b,0);
  }
  function getCartTotal(){
    return getCartDetailed().reduce((sum,item)=>sum+item.lineTotal,0);
  }
  function updateCartBadge(){
    const count = getCartCount();
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function showToast(message){
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>'+message+'</span>';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove('is-visible'), 2400);
  }

  /* ---------- render kartu produk ---------- */
  function productImgMarkup(product){
    if (product.img){
      return '<img src="'+encodeSpaces(product.img)+'" alt="'+product.name+'" loading="lazy">';
    }
    return '<div class="product-card__no-img" style="display:flex;">'+
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16 Q20 21 31 16 Q20 11 9 16 Z"/><path d="M9 16 V20 C9 28 14 31 20 31 C26 31 31 28 31 20 V16"/></svg>'+
      '</div>';
  }

  function productCardMarkup(product){
    const cart = getCart();
    const qty = cart[product.id] || 0;
    const control = qty > 0
      ? '<div class="qty-stepper" data-id="'+product.id+'"><button type="button" data-action="dec" aria-label="Kurangi">−</button><span>'+qty+'</span><button type="button" data-action="inc" aria-label="Tambah">+</button></div>'
      : '<button type="button" class="btn-add" data-action="add" data-id="'+product.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Tambah</button>';

    return (
      '<div class="product-card">'+
        '<div class="product-card__img-wrap">'+
          (product.badge ? '<span class="product-card__badge">'+product.badge+'</span>' : '')+
          productImgMarkup(product)+
        '</div>'+
        '<div class="product-card__body">'+
          '<h3 class="product-card__name">'+product.name+'</h3>'+
          '<p class="product-card__desc">'+product.desc+'</p>'+
          '<div class="product-card__foot">'+
            '<span class="product-card__price">'+formatIDR(product.price)+'</span>'+
            control+
          '</div>'+
        '</div>'+
      '</div>'
    );
  }

  function groupByCategory(){
    const groups = {};
    PRODUCTS.forEach(p=>{
      groups[p.category] = groups[p.category] || [];
      groups[p.category].push(p);
    });
    return groups;
  }

  function renderProductGrid(container){
    if (!container) return;
    const groups = groupByCategory();
    let html = '';
    Object.keys(groups).forEach(cat=>{
      const icon = CATEGORY_ICONS[cat] || '';
      html += '<div class="cat-block reveal is-visible">'+
        '<div class="cat-head">'+icon+'<h3>'+cat+'</h3><span class="count">'+groups[cat].length+' menu</span></div>'+
        '<div class="product-grid">'+ groups[cat].map(productCardMarkup).join('') +'</div>'+
      '</div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('[data-action="add"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        addToCart(id, 1);
        const product = PRODUCTS.find(p=>p.id===id);
        showToast((product ? product.name : 'Item') + ' ditambahkan ke keranjang');
        refreshEverything();
      });
    });
    container.querySelectorAll('.qty-stepper').forEach(stepper=>{
      const id = stepper.dataset.id;
      stepper.querySelector('[data-action="inc"]').addEventListener('click', ()=>{ addToCart(id,1); refreshEverything(); });
      stepper.querySelector('[data-action="dec"]').addEventListener('click', ()=>{
        const cart = getCart(); setQty(id, (cart[id]||0) - 1); refreshEverything();
      });
    });
  }

  /* ---------- render panel keranjang (pembelian.html) ---------- */
  function renderCartPanel(){
    const listEl = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    if (!listEl) return;
    const items = getCartDetailed();

    if (items.length === 0){
      listEl.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10 H10 L14 26 H30 L34 14 H12"/><circle cx="16" cy="32" r="2"/><circle cx="28" cy="32" r="2"/></svg>Keranjang masih kosong.<br>Pilih menu di sebelah kiri, ya.</div>';
    } else {
      listEl.innerHTML = items.map(item=>{
        const img = item.img ? '<img src="'+encodeSpaces(item.img)+'" alt="'+item.name+'">' : '';
        return '<div class="cart-item">'+
          '<div class="cart-item__img">'+img+'</div>'+
          '<div class="cart-item__body">'+
            '<div class="cart-item__name">'+item.name+'</div>'+
            '<div class="cart-item__price">'+formatIDR(item.price)+' × '+item.qty+'</div>'+
            '<div class="cart-item__ctrl">'+
              '<div class="qty-stepper" data-id="'+item.id+'"><button type="button" data-action="inc-c" aria-label="Kurangi">−</button><span>'+item.qty+'</span><button type="button" data-action="inc-c-plus" aria-label="Tambah">+</button></div>'+
              // '<button type="button" class="cart-item__remove" data-action="remove" data-id="'+item.id+'">Hapus</button>'+
              '<button type="button" class="cart-item__remove" data-action="remove" data-id="'+item.id+'" aria-label="Hapus">✕</button>'+
            '</div>'+
          '</div>'+
        '</div>';
      }).join('');
    }
    if (totalEl) totalEl.textContent = formatIDR(getCartTotal());

    listEl.querySelectorAll('.qty-stepper').forEach(stepper=>{
      const id = stepper.dataset.id;
      const dec = stepper.querySelector('[data-action="inc-c"]');
      const inc = stepper.querySelector('[data-action="inc-c-plus"]');
      if (dec) dec.addEventListener('click', ()=>{ const cart=getCart(); setQty(id,(cart[id]||0)-1); refreshEverything(); });
      if (inc) inc.addEventListener('click', ()=>{ addToCart(id,1); refreshEverything(); });
    });
    listEl.querySelectorAll('[data-action="remove"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ removeFromCart(btn.dataset.id); refreshEverything(); });
    });
  }

  function refreshEverything(){
    updateCartBadge();
    renderProductGrid(document.getElementById('menuContent') || document.getElementById('shopProducts'));
    renderCartPanel();
  }

  /* ---------- checkout demo ---------- */
  function setupCheckoutForm(){
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const items = getCartDetailed();
      if (items.length === 0){
        showToast('Keranjang masih kosong, pilih menu dulu ya');
        return;
      }

      const payBtn = document.getElementById('payButton');
      const originalLabel = payBtn ? payBtn.textContent : '';
      if (payBtn){ payBtn.disabled = true; payBtn.textContent = 'Memproses...'; }

      setTimeout(function(){
        const name = document.getElementById('custName').value.trim() || 'Kak';
        const phone = document.getElementById('custPhone').value.trim();
        const note = document.getElementById('custNote').value.trim();
        const total = getCartTotal();
        const orderId = 'KS-' + Date.now().toString().slice(-6);

        const modalName = document.getElementById('modalName');
        const modalOrderId = document.getElementById('modalOrderId');
        const modalSummary = document.getElementById('modalSummary');
        if (modalName) modalName.textContent = name;
        if (modalOrderId) modalOrderId.textContent = '#' + orderId;
        if (modalSummary) modalSummary.textContent = items.length + ' item · ' + formatIDR(total);

        const lines = ['Halo Kopi Senja! Saya mau pesan (order demo #'+orderId+'):'];
        items.forEach(function(it){ lines.push('- '+it.name+' x'+it.qty); });
        lines.push('Total: '+formatIDR(total));
        if (note) lines.push('Catatan: '+note);
        lines.push('Nama: '+name+(phone ? (' ('+phone+')') : ''));

        const waLink = document.getElementById('modalWaLink');
        if (waLink) waLink.href = 'https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));

        const overlay = document.getElementById('orderModal');
        if (overlay) overlay.classList.add('is-visible');

        if (payBtn){ payBtn.disabled = false; payBtn.textContent = originalLabel; }
      }, 700);
    });

    const overlay = document.getElementById('orderModal');
    const closeModal = function(){
      if (!overlay) return;
      overlay.classList.remove('is-visible');
      clearCart();
      form.reset();
      refreshEverything();
    };
    const modalClose = document.getElementById('modalClose');
    const modalCloseX = document.getElementById('modalCloseX');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCloseX) modalCloseX.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
  }

  /* ---------- entry point ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    updateCartBadge();
    renderProductGrid(document.getElementById('menuContent') || document.getElementById('shopProducts'));
    renderCartPanel();
    setupCheckoutForm();
  });

})();
