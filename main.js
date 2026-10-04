(() => {
  const products = window.ATHAR_PRODUCTS;
  const categories = window.ATHAR_CATEGORIES;
  const cart = window.ATHAR_CART;
  const $ = selector => document.querySelector(selector);
  const landing = $("#landing");
  const store = $("#store");
  const shell = $("#siteShell");
  const productGrid = $("#productGrid");
  const categoryGrid = $("#categoryGrid");
  const filterChips = $("#filterChips");
  const search = $("#productSearch");
  const sort = $("#productSort");
  const overlay = $("#overlay");
  const cartDrawer = $("#cartDrawer");
  const FAVORITES_KEY = "athar-favorites-v1";
  let gender = "women";
  let activeCategory = "all";
  let toastTimer;
  let homeAdIndex = 0;
  let homeAdTimer;
  const womenCategories = [
    {id:"featured",title:"عطور مميزة",sub:"اختيارات أثر الخاصة",image:"https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=800&q=85"},
    {id:"luxury",title:"عطور فاخرة",sub:"الفخامة في كل رشة",image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85"},
    {id:"floral",title:"عطور زهرية",sub:"رائحة الورد في أجمل صورها",image:"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85"},
    {id:"oriental",title:"عطور شرقية",sub:"دفء وأناقة لا تنتهي",image:"https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=85"},
    {id:"brands",title:"عطور الماركات",sub:"أشهر الماركات العالمية",image:"https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=85"},
    {id:"bestsellers",title:"الأكثر مبيعاً",sub:"الأفضل دائماً",image:"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85"}
  ];
  const menCategories = [
    {id:"brand-tom-ford",brand:"TOM FORD",title:"عطور توم فورد",sub:"فخامة بلمسة جريئة",image:"https://images.unsplash.com/photo-1598634222670-87c5f558119c?auto=format&fit=crop&w=800&q=85"},
    {id:"brand-creed",brand:"CREED",title:"عطور كريد",sub:"تراث من الفخامة",image:"https://images.unsplash.com/photo-1642867737971-b965d45b0c68?auto=format&fit=crop&w=800&q=85"},
    {id:"brand-chanel",brand:"CHANEL",title:"عطور شانيل",sub:"أناقة خالدة",image:"https://images.unsplash.com/photo-1785881570973-281d0db41119?auto=format&fit=crop&w=800&q=85"},
    {id:"brand-versace",brand:"VERSACE",title:"عطور ڤيرساتشي",sub:"جاذبية لا تقاوم",image:"https://images.unsplash.com/photo-1595389294696-ae969ff733a8?auto=format&fit=crop&w=800&q=85"},
    {id:"brand-dior",brand:"DIOR",title:"عطور ديور",sub:"كلاسيكية بطابع عصري",image:"https://images.unsplash.com/photo-1700522604220-471669e4364c?auto=format&fit=crop&w=800&q=85"},
    {id:"brand-montblanc",brand:"MONTBLANC",title:"عطور مونت بلانك",sub:"أسطورة الرجولة",image:"https://images.unsplash.com/photo-1700665053090-e64274eeba84?auto=format&fit=crop&w=800&q=85"}
  ];
  const money = value => `${new Intl.NumberFormat("ar-IQ").format(value)} د.ع`;
  const renderRating = rating => {
    const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    return `<span class="product-rating" aria-label="التقييم ${rating.toFixed(1)} من 5 نجوم"><span aria-hidden="true">${stars}</span><b>${rating.toFixed(1)}</b></span>`;
  };
  const currentProducts = () => products.filter(product => product.gender === gender);
  const visibleCategories = () => categories.filter(category =>
    products.some(product => product.gender === gender && product.category === category.id));
  const categoryProducts = categoryId => {
    if (categoryId === "all") return currentProducts();
    const brandCategory = menCategories.find(category => category.id === categoryId);
    if (brandCategory) return currentProducts().filter(product => product.brand === brandCategory.brand);
    if (categoryId === "brands") return currentProducts().filter(product => product.brand && product.brand !== "ATHAR");
    if (categoryId === "featured" || categoryId === "bestsellers") {
      return currentProducts().filter(product => product.featured && (categoryId !== "bestsellers" || product.rating >= 4.8));
    }
    if (categoryId === "floral") return currentProducts().filter(product => product.category === "floral" || product.category === "french");
    return currentProducts().filter(product => product.category === categoryId);
  };
  const productById = id => products.find(product => product.id === id);
  function loadFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      return new Set(Array.isArray(saved) ? saved.filter(id => typeof id === "string" && productById(id)) : []);
    } catch (error) {
      console.warn("تعذّر تحميل قائمة المفضلة.", error);
      return new Set();
    }
  }
  const favoriteIds = loadFavorites();

  function toggleFavorite(id) {
    if (favoriteIds.has(id)) favoriteIds.delete(id);
    else favoriteIds.add(id);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteIds]));
    } catch (error) {
      console.warn("تعذّر حفظ قائمة المفضلة.", error);
    }
    document.querySelectorAll(`[data-action="favorite"][data-id="${id}"]`).forEach(button => {
      const isFavorite = favoriteIds.has(id);
      button.classList.toggle("is-favorite", isFavorite);
      button.setAttribute("aria-pressed", String(isFavorite));
      button.setAttribute("aria-label", isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة");
      button.textContent = isFavorite ? "♥" : "♡";
    });
    notify(favoriteIds.has(id) ? "أُضيف العطر إلى المفضلة" : "أُزيل العطر من المفضلة");
  }

  function setGender(value) {
    window.clearInterval(homeAdTimer);
    gender = value;
    activeCategory = "all";
    search.value = "";
    landing.hidden = true;
    store.hidden = false;
    shell.dataset.gender = gender;
    document.body.classList.toggle("men-theme", gender === "men");
    document.body.classList.toggle("women-theme", gender === "women");
    document.body.classList.add("in-store");
    $(".women-breadcrumb").hidden = gender !== "women";
    $(".men-breadcrumb").hidden = gender !== "men";
    $(".gender-label").textContent = gender === "women" ? "العطور النسائية" : "العطور الرجالية";
    $(".hero-title").innerHTML = gender === "women"
      ? "عطور النساء<br><em>أناقة لا تقاوم، في كل تفصيلة</em>"
      : "عطور الرجال<br><em>قوة.. أناقة.. حضور لا يُنسى</em>";
    $(".category-section .eyebrow").innerHTML = gender === "women" ? "✿ &nbsp; اختاري عطركِ" : '<span></span> اكتشف حسب ذوقك';
    $(".category-section h2").innerHTML = gender === "women" ? "عطور <em>لكل حكاية</em>" : "عالمٌ من <em>النفحات</em>";
    $(".category-section .section-heading>p").textContent = gender === "women"
      ? "نفحات أنثوية اختيرت لترافق أجمل لحظاتك."
      : "لكل حكاية عطرها، ولكل لحظة نفحتها الخاصة.";
    $(".product-heading h2").innerHTML = gender === "women" ? "اكتشفي <em>عطركِ المفضل</em>" : "عطور <em>تستحق الاكتشاف</em>";
    if (gender === "men") {
      $(".category-section .eyebrow").innerHTML = "✦ &nbsp; اختَر عطرك";
      $(".category-section h2").innerHTML = "عطور <em>الماركات العالمية</em>";
      $(".category-section .section-heading>p").textContent = "اختيارات عالمية تجمع بين الفخامة والثبات.";
      $(".product-heading h2").innerHTML = "اكتشف <em>عطرك المفضل</em>";
    }
    $(".hero-description").textContent = gender === "women" ? "اكتشفي عطرك المفضّل من بين نفحات صُنعت لتكون جزءاً من حكايتك." : "اكتشف عطرك المفضّل من بين نفحات صُنعت لتكون جزءاً من حكايتك.";
    $(".hero-image").src = gender === "women" ? "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90" : "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=90";
    $(".hero-image").alt = gender === "women" ? "زجاجة عطر نسائي من مجموعة أثر" : "زجاجة عطر رجالي من مجموعة أثر";
    renderCategories();
    renderFilters();
    renderProducts();
    closePanels();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function goHome() {
    closePanels();
    store.hidden = true;
    landing.hidden = false;
    document.body.classList.remove("in-store", "men-theme", "women-theme");
    shell.removeAttribute("data-gender");
    startHomeAdRotation();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function getHomeAds() {
    const womenProducts = products.filter(product => product.gender === "women");
    const menProducts = products.filter(product => product.gender === "men");
    return womenProducts.flatMap((product, index) => [product, menProducts[index]]).filter(Boolean);
  }

  function showHomeAd(index) {
    const homeAds = getHomeAds();
    if (!homeAds.length) return;
    homeAdIndex = (index + homeAds.length) % homeAds.length;
    const product = homeAds[homeAdIndex];
    const slide = $("#homeAdSlide");
    slide.dataset.gender = product.gender;
    $("#homeAdImage").src = product.image;
    $("#homeAdImage").alt = `صورة توضيحية لعطر ${product.name}`;
    $("#homeAdEyebrow").textContent = product.gender === "women" ? "مجموعة العطور النسائية" : "مجموعة العطور الرجالية";
    $("#homeAdTitle").textContent = product.name;
    $("#homeAdBrand").textContent = product.brand || "ATHAR";
    $("#homeAdDescription").textContent = product.description;
    $("#homeAdPrice").textContent = money(product.price);
    $("#homeAdDetails").dataset.id = product.id;
    $("#homeAdCount").textContent = `${String(homeAdIndex + 1).padStart(2, "0")} / ${String(homeAds.length).padStart(2, "0")}`;
    slide.classList.remove("home-ad-enter");
    requestAnimationFrame(() => slide.classList.add("home-ad-enter"));
  }

  function startHomeAdRotation() {
    window.clearInterval(homeAdTimer);
    homeAdTimer = window.setInterval(() => {
      if (!document.hidden && !landing.hidden) showHomeAd(homeAdIndex + 1);
    }, 5000);
  }

  function renderCategories() {
    const cards = gender === "women"
      ? womenCategories
      : menCategories;
    categoryGrid.innerHTML = cards.map((category, index) => `
      <button type="button" class="category-card${gender === "women" ? " women-category-card" : " men-category-card"}" data-category="${category.id}" style="--card-index:${index}">
        <img src="${category.image}" alt="${category.title}" loading="lazy">
        <span class="category-shade"></span><span class="category-number">0${index + 1}</span>
        <span class="category-arrow" aria-hidden="true">›</span>
        <span class="category-text"><small>${category.sub}</small><strong>${category.title}</strong><i></i></span>
      </button>`).join("");
  }

  function renderFilters() {
    filterChips.innerHTML = `<button type="button" class="filter-chip ${activeCategory === "all" ? "active" : ""}" data-category="all">الكل</button>` +
      (gender === "women" ? womenCategories : menCategories)
        .map(category => `<button type="button" class="filter-chip ${activeCategory === category.id ? "active" : ""}" data-category="${category.id}">${category.title}</button>`).join("");
  }

  function renderLandingProducts() {
    const rankByRating = value => products
      .filter(product => product.gender === value)
      .sort((a,b) => b.rating - a.rating || Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    const womenBestSellers = rankByRating("women").slice(0,8);
    const menBestSellers = rankByRating("men").slice(0,7);
    const bestSellers = [...womenBestSellers, ...menBestSellers];
    const bestSellerIds = new Set(bestSellers.map(product => product.id));
    const bestSellerImages = new Set(bestSellers.map(product => new URL(product.image, document.baseURI).pathname));
    const newArrivals = products
      .filter(product => product.new && !bestSellerIds.has(product.id))
      .filter(product => !bestSellerImages.has(new URL(product.image, document.baseURI).pathname))
      .slice(0,8);
    const renderCards = list => list.map(product => {
      const isFavorite = favoriteIds.has(product.id);
      return `
      <article class="home-mini-card home-showcase-card" data-product-id="${product.id}">
        <div class="home-card-image">
          <button class="mini-photo" type="button" data-action="details" data-id="${product.id}" aria-label="عرض تفاصيل ${product.name}"><img src="${product.image}" alt="عطر ${product.name} من ${product.brand || "أثر"}" loading="lazy"></button>
          ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
          <button class="home-favorite-button${isFavorite ? " is-favorite" : ""}" type="button" data-action="favorite" data-id="${product.id}" aria-label="${isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}" aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button>
        </div>
        <div class="home-card-content">
          <small class="home-card-brand">${product.brand || "ATHAR"}</small>
          <h3>${product.name}</h3>
          <span class="home-card-english">${product.english}</span>
          <p class="home-card-description">${product.description}</p>
          <div class="home-card-rating">${renderRating(product.rating)}<span>${product.size}</span></div>
          <strong class="home-card-price">${money(product.price)}</strong>
          <div class="home-card-actions">
            <button type="button" class="home-card-add" data-action="add" data-id="${product.id}">أضف إلى السلة</button>
            <button type="button" class="home-card-details" data-action="details" data-id="${product.id}">عرض التفاصيل</button>
          </div>
        </div>
      </article>`;
    }).join("");
    $("#homeWomenBestSellers").innerHTML = renderCards(womenBestSellers);
    $("#homeMenBestSellers").innerHTML = renderCards(menBestSellers);
    $("#homeNewArrivals").innerHTML = renderCards(newArrivals);
  }

  function visibleProducts() {
    const term = search.value.trim().toLocaleLowerCase("ar");
    let result = categoryProducts(activeCategory).filter(product =>
      (!term || `${product.name} ${product.brand || ""} ${product.english} ${product.description} ${product.notes}`.toLocaleLowerCase("ar").includes(term)));
    if (sort.value === "price-asc") result.sort((a,b) => a.price - b.price);
    if (sort.value === "price-desc") result.sort((a,b) => b.price - a.price);
    if (sort.value === "rating") result.sort((a,b) => b.rating - a.rating);
    if (sort.value === "featured") result.sort((a,b) =>
      Number(b.brand !== "ATHAR") - Number(a.brand !== "ATHAR") ||
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      b.rating - a.rating);
    return result;
  }

  function renderProducts() {
    const list = visibleProducts();
    productGrid.innerHTML = list.map((product, index) => `
      <article class="product-card" style="--card-index:${index}">
        <div class="product-image-wrap"><img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
          <button type="button" class="quick-view" data-action="details" data-id="${product.id}">عرض التفاصيل <span>↗</span></button>
        </div>
        <div class="product-info"><div class="product-title-row"><div><small>${product.brand || "أثر"}</small><h3>${product.name}</h3></div><span class="product-size">${product.size}</span></div>
          ${renderRating(product.rating)}
          <p>${product.english} — ${product.description}</p><div class="product-bottom"><strong>${money(product.price)}</strong><button type="button" class="add-button" data-action="add" data-id="${product.id}" aria-label="أضف ${product.name} إلى السلة">أضف إلى السلة</button></div>
          <button type="button" class="details-link" data-action="details" data-id="${product.id}">عرض التفاصيل <span>←</span></button>
        </div>
      </article>`).join("");
    $("#emptyState").hidden = list.length > 0;
  }

  function renderCart() {
    const items = cart.getItems();
    const count = cart.count();
    document.querySelectorAll(".cart-count").forEach(node => node.textContent = count);
    $(".drawer-count").textContent = `(${count})`;
    if (!items.length) {
      $("#cartContent").innerHTML = `<div class="cart-empty"><span>✧</span><h3>سلتك بانتظار عطرك</h3><p>أضف العطور التي أحببتها، وستجدها هنا.</p><button type="button" class="primary-button" data-action="close-panels">تابع التسوق ←</button></div>`;
      $("#cartFooter").innerHTML = "";
      return;
    }
    const subtotal = items.reduce((sum, item) => sum + (productById(item.id)?.price || 0) * item.quantity, 0);
    $("#cartContent").innerHTML = items.map(item => {
      const product = productById(item.id);
      if (!product) return "";
      return `<article class="cart-item"><img src="${product.image}" alt="${product.name}"><div class="cart-item-info"><small>${product.english}</small><h3>${product.name}</h3><strong>${money(product.price)}</strong><div class="quantity-control"><button type="button" data-action="quantity" data-id="${product.id}" data-delta="-1" aria-label="تقليل الكمية">−</button><span>${item.quantity}</span><button type="button" data-action="quantity" data-id="${product.id}" data-delta="1" aria-label="زيادة الكمية">+</button></div></div><button type="button" class="remove-item" data-action="remove" data-id="${product.id}" aria-label="حذف ${product.name}">×</button></article>`;
    }).join("");
    $("#cartFooter").innerHTML = `<div class="subtotal"><span>المجموع</span><strong>${money(subtotal)}</strong></div><p>أجور التوصيل تُحدد عند تأكيد الطلب.</p><button type="button" class="checkout-button" data-action="checkout">إتمام الطلب <span>←</span></button>`;
  }

  function openPanel(panel) {
    overlay.hidden = false;
    document.body.classList.add("panel-open");
    if (panel === "cart") {
      renderCart();
      cartDrawer.classList.add("open");
      cartDrawer.setAttribute("aria-hidden", "false");
    } else {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("visible"));
    }
  }

  function closePanels() {
    overlay.hidden = true;
    document.body.classList.remove("panel-open");
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    [$("#productModal"), $("#checkoutModal")].forEach(panel => {
      panel.classList.remove("visible");
      window.setTimeout(() => { if (!panel.classList.contains("visible")) panel.hidden = true; }, 220);
    });
  }

  function showDetails(id) {
    const product = productById(id);
    if (!product) return;
    const notes = [
      ["البداية", product.top || product.notes],
      ["قلب العطر", product.heart || "نفحات متوازنة"],
      ["القاعدة", product.base || product.notes]
    ];
    $("#productModalContent").innerHTML = `<div class="detail-layout">
      <div class="detail-image"><img src="${product.image}" alt="صورة توضيحية لعطر ${product.name} من ${product.brand || "أثر"}"><span class="detail-image-label">${product.brand || "ATHAR"}</span></div>
      <div class="detail-copy">
        <p class="eyebrow"><span></span> ${product.brand || "ATHAR"}</p><h2>${product.name}</h2>
        <p class="detail-english">${product.english}</p>
        <div class="detail-tagline"><span>✦</span> ${product.tag || "اختيار أثر"}</div>
        ${renderRating(product.rating)}
        <strong class="detail-price">${money(product.price)}</strong>
        <p class="detail-description">${product.description}</p>
        <h3 class="notes-heading">رحلة الرائحة</h3>
        <div class="note-pyramid">${notes.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join("")}</div>
        <div class="detail-facts">
          <div class="detail-spec"><span>الحجم</span><strong>${product.size}</strong></div>
          <div class="detail-spec"><span>التركيز</span><strong>${product.concentration || "تركيبة عطرية"}</strong></div>
          <div class="detail-spec"><span>مناسب لـ</span><strong>${product.occasion || "النهار والمساء"}</strong></div>
          <div class="detail-spec"><span>الثبات</span><strong>${product.longevity || "يتفاوت حسب البشرة والطقس"}</strong></div>
        </div>
        <p class="detail-promise">توصيل لجميع محافظات العراق · السعر بالدينار العراقي</p>
        <button type="button" class="checkout-button" data-action="add" data-id="${product.id}">أضف إلى السلة <span>＋</span></button>
      </div>
    </div>`;
    openPanel($("#productModal"));
  }

  function showCheckout() {
    if (!cart.count()) return;
    const total = cart.getItems().reduce((sum, item) => sum + (productById(item.id)?.price || 0) * item.quantity, 0);
    $("#checkoutContent").innerHTML = `<p class="eyebrow"><span></span> خطوة واحدة تفصلك</p><h2>إتمام الطلب</h2><p class="checkout-intro">أدخل معلومات التوصيل، وسنتواصل معك لتأكيد طلبك.</p><div class="checkout-total">إجمالي الطلب <strong>${money(total)}</strong></div><form id="checkoutForm" class="checkout-form">
      <label>الاسم الكامل<input name="name" type="text" autocomplete="name" required minlength="2" placeholder="الاسم الثلاثي"></label>
      <label>رقم الهاتف<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required pattern="[0-9٠-٩+()\\s-]{7,18}" placeholder="07xxxxxxxxx"></label>
      <label>المحافظة<select name="governorate" required><option value="">اختر المحافظة</option><option>بغداد</option><option>البصرة</option><option>نينوى</option><option>أربيل</option><option>النجف</option><option>كربلاء</option><option>ذي قار</option><option>السليمانية</option><option>ديالى</option><option>الأنبار</option><option>بابل</option><option>كركوك</option><option>واسط</option><option>ميسان</option><option>المثنى</option><option>القادسية</option><option>دهوك</option><option>صلاح الدين</option></select></label>
      <label>المنطقة<input name="district" type="text" required placeholder="اسم المنطقة أو الحي"></label>
      <label class="full-field">العنوان بالتفصيل<textarea name="address" required rows="2" placeholder="الشارع، أقرب نقطة دالة، رقم المنزل"></textarea></label>
      <label class="full-field">ملاحظات الطلب <textarea name="notes" rows="2" placeholder="ملاحظات إضافية (اختياري)"></textarea></label>
      <button class="checkout-button full-field" type="submit">تأكيد الطلب <span>←</span></button>
      </form>`;
    openPanel($("#checkoutModal"));
  }

  function notify(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.addEventListener("click", event => {
    const browseGender = event.target.closest("[data-browse-gender]");
    if (browseGender) { setGender(browseGender.dataset.browseGender); return; }
    const browseSection = event.target.closest("[data-browse-section]");
    if (browseSection) {
      setGender("men");
      document.querySelector("#categories").scrollIntoView({behavior:"smooth"});
      return;
    }
    const genderButton = event.target.closest(".gender-card[data-gender]");
    if (genderButton) { setGender(genderButton.dataset.gender); return; }
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      activeCategory = categoryButton.dataset.category;
      renderFilters();
      renderProducts();
      if (categoryButton.closest("#categoryGrid")) document.querySelector("#products").scrollIntoView({behavior:"smooth"});
      return;
    }
    const carouselButton = event.target.closest("[data-carousel-target]");
    if (carouselButton) {
      const rail = document.getElementById(carouselButton.dataset.carouselTarget);
      const direction = carouselButton.dataset.carouselDirection === "prev" ? -1 : 1;
      rail.scrollBy({left:direction * rail.clientWidth * 0.8,behavior:"smooth"});
      return;
    }
    const scrollLink = event.target.closest("[data-scroll]");
    if (scrollLink) { event.preventDefault(); document.getElementById(scrollLink.dataset.scroll)?.scrollIntoView({behavior:"smooth"}); $("#mainNav").classList.remove("nav-open"); $(".menu-toggle").setAttribute("aria-expanded","false"); return; }
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const id = action.dataset.id;
    switch (action.dataset.action) {
      case "home": event.preventDefault(); goHome(); break;
      case "cart": openPanel("cart"); break;
      case "close-panels": closePanels(); break;
      case "add": cart.add(id); renderCart(); renderProducts(); notify("أُضيف العطر إلى سلتك بنجاح"); break;
      case "details": showDetails(id); break;
      case "favorite": toggleFavorite(id); break;
      case "quantity": cart.change(id, Number(action.dataset.delta)); renderCart(); break;
      case "remove": cart.remove(id); renderCart(); renderProducts(); notify("تم حذف العطر من السلة"); break;
      case "checkout": showCheckout(); break;
    }
  });

  overlay.addEventListener("click", closePanels);
  search.addEventListener("input", renderProducts);
  $("#landingSearchForm").addEventListener("submit", event => {
    event.preventDefault();
    const query = $("#landingSearch").value.trim().toLocaleLowerCase("ar");
    if (!query) return;
    const product = products.find(item =>
      [item.name, item.english, item.brand].some(value => value?.toLocaleLowerCase("ar").includes(query))
    );
    if (!product) { notify("لم نعثر على عطر بهذا الاسم"); return; }
    setGender(product.gender);
    search.value = $("#landingSearch").value.trim();
    renderProducts();
    document.querySelector("#products").scrollIntoView({behavior:"smooth"});
  });
  $("#homeAdDetails").addEventListener("click", event => showDetails(event.currentTarget.dataset.id));
  $("#homeAdPrev").addEventListener("click", () => showHomeAd(homeAdIndex - 1));
  $("#homeAdNext").addEventListener("click", () => showHomeAd(homeAdIndex + 1));
  sort.addEventListener("change", renderProducts);
  $(".menu-toggle").addEventListener("click", event => {
    const isOpen = $("#mainNav").classList.toggle("nav-open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  });
  $("#checkoutContent").addEventListener("submit", event => {
    if (event.target.id !== "checkoutForm") return;
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const name = new FormData(event.target).get("name");
    cart.clear();
    closePanels();
    renderCart();
    notify(`شكراً ${name}، تم استلام طلبك وسنتواصل معك قريباً`);
  });
  window.addEventListener("scroll", () => $("#toTop").classList.toggle("visible", window.scrollY > 500));
  $("#toTop").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  renderLandingProducts();
  showHomeAd(homeAdIndex);
  startHomeAdRotation();
  renderCart();
})();
