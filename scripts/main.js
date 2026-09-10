const GEO_LIST = [
  "Albania (AL)", "Algeria (DZ)", "Angola (AO)", "Argentina (AR)", "Armenia (AM)",
  "Australia (AU)", "Austria (AT)", "Brazil (BR)", "Canada (CA)", "Germany (DE)",
  "Spain (ES)", "France (FR)", "United Kingdom (GB)", "Greece (GR)", "India (IN)",
  "Italy (IT)", "Japan (JP)", "Russia (RU)", "Ukraine (UA)", "United States (US)"
];

const FILTER_OPTIONS = {
  linkType: [
    "Гостевые посты",
    "Нишевые правки",
    "linkType-ссылки",
    "Крауд-маркетинг",
    "Аутрич и PR-публикации",
    "Каталоги и справочники"
  ],
  budget: [
    "До $1,000",
    "$1,000 – 5,000",
    "$5,000 – 10,000",
    "$10,000 – 25,000",
    "$$25,000+",
    "По договорённости"
  ],
  geo: [
    "Любая страна",
    ...GEO_LIST
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  //burger script START//
  const burgerBtn = document.querySelector(".burgerBtn");
  const headerRight = document.querySelector(".headerRight");
  if (burgerBtn && headerRight) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = headerRight.classList.toggle("burger-open");
      const label = isOpen ? "Закрити меню" : "Відкрити меню";
      burgerBtn.setAttribute("aria-label", label);
      burgerBtn.setAttribute("title", label);
    });
  }
  //burger script END//

  //login popup (telegram bot) script START//
  const loginPopup = document.getElementById("loginPopup");
  const openPopupButtons = document.querySelectorAll(".popupOpenBtn");

  const setPopupOpen = (isOpen) => {
    if (!loginPopup) return;
    loginPopup.classList.toggle("is-open", isOpen);
    loginPopup.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("is-modal-open", isOpen);
  };

  const closePopup = () => setPopupOpen(false);
  const openPopup = () => setPopupOpen(true);

  if (loginPopup && openPopupButtons.length) {
    openPopupButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openPopup();
      });
    });

    loginPopup.addEventListener("click", (e) => {
      if (e.target === loginPopup) closePopup();
    });

    const closeBtn = loginPopup.querySelector("[data-popup-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closePopup();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && loginPopup.classList.contains("is-open")) {
        closePopup();
      }
    });
  }
  //login popup (telegram bot) script END//

  //hero search geo / provider script START//
  const hero = document.querySelector(".heroSection");
  if (hero) {
    const tabs = hero.querySelectorAll(".tab");
    const input = hero.querySelector(".input");
    const resetBtn = hero.querySelector(".reset");
    const searchBtn = hero.querySelector(".searchBtn");
    const geoDropdown = hero.querySelector(".geoDropdown");
    const geoList = hero.querySelector(".geoList");

    // Визначаємо, що це сторінка слотів (де потрібен фільтр по провайдеру)
    const isSlotsPage = !!document.querySelector(".brands table thead th:nth-child(5)");
    let providerListCache = null;

    function getProviderList() {
      if (providerListCache) return providerListCache;
      const cells = document.querySelectorAll(".brands tbody tr td:nth-child(5)");
      const set = new Set();
      cells.forEach((td) => {
        const value = td.textContent.trim();
        if (value) set.add(value);
      });
      providerListCache = Array.from(set).sort((a, b) =>
        a.localeCompare(b, "ru", { sensitivity: "base" })
      );
      return providerListCache;
    }

    if (!input || !resetBtn || !searchBtn || !geoDropdown) {
      // На цій сторінці немає критичних елементів пошуку — не ініціалізуємо
    } else {
      let mode = "brand";
      let selectedOption = null;

      function setMode(newMode) {
        mode = newMode;
        tabs.forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
        const isFilterMode = mode !== "brand";
        const placeholder =
          !isFilterMode
            ? "Введите название бренда"
            : isSlotsPage
            ? "Введите или выберите провайдера"
            : "Введите или выберите страну";
        input.placeholder = placeholder;
        input.value = "";
        selectedOption = null;
        resetBtn.classList.remove("visible");
        geoDropdown.classList.remove("open");
        searchBtn.classList.toggle("modeGeo", isFilterMode);
        searchBtn.classList.remove("hasSelection");
        if (isFilterMode && geoList) fillOptionList("");
      }

      function fillOptionList(filterStr) {
        if (!geoList) return;
        const query = (filterStr == null ? "" : String(filterStr)).trim().toLowerCase();
        geoList.innerHTML = "";

        const options = isSlotsPage ? getProviderList() : GEO_LIST;

        options.forEach((label) => {
          if (query && !label.toLowerCase().includes(query)) return;
          const li = document.createElement("li");
          li.textContent = label;
          li.dataset.value = label;
          li.addEventListener("click", () => {
            selectedOption = label;
            input.value = label;
            geoDropdown.classList.remove("open");
            resetBtn.classList.add("visible");
            searchBtn.classList.add("hasSelection");
          });
          geoList.appendChild(li);
        });
      }

      function toggleReset() {
        const hasText = input.value.trim().length > 0;
        resetBtn.classList.toggle(
          "visible",
          (mode === "brand" && hasText) || (mode !== "brand" && (selectedOption || hasText))
        );
      }

      tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));

      input.addEventListener("input", () => {
        if (mode !== "brand") {
          selectedOption = null;
          searchBtn.classList.remove("hasSelection");
          fillOptionList(input.value);
          geoDropdown.classList.add("open");
        }
        toggleReset();
      });

      input.addEventListener("focus", () => {
        if (mode !== "brand") {
          fillOptionList(input.value);
          geoDropdown.classList.add("open");
        }
      });

      resetBtn.addEventListener("click", () => {
        input.value = "";
        selectedOption = null;
        resetBtn.classList.remove("visible");
        geoDropdown.classList.remove("open");
        searchBtn.classList.remove("hasSelection");
        if (mode === "brand") input.focus();
      });

      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (mode === "brand") return; // submit brand search
        if (mode !== "brand") {
          if (searchBtn.classList.contains("hasSelection")) return; // submit geo / provider search
          geoDropdown.classList.toggle("open");
          if (geoDropdown.classList.contains("open")) {
            fillOptionList(input.value);
            input.focus();
          }
        }
      });

      document.addEventListener("click", (e) => {
        if (geoDropdown?.classList.contains("open") && !hero.contains(e.target)) {
          geoDropdown.classList.remove("open");
        }
      });

      setMode("brand");
    }
  }
  //hero search geo / provider script END//

  //catalog filters script START//
  const filterWrap = document.querySelector(".filterWrap");
  if (filterWrap) {
    const fields = Array.from(filterWrap.querySelectorAll(".filterField"));
    const resetBtn = filterWrap.querySelector(".reset");

    const updateResetVisibility = () => {
      if (!resetBtn) return;
      const hasValue = fields.some((field) => {
        const inputEl = field.querySelector(".filterInput");
        return inputEl && inputEl.value.trim().length > 0;
      });
      resetBtn.classList.toggle("visible", hasValue);
    };

    const closeAll = () => {
      fields.forEach((field) => field.classList.remove("is-open"));
    };

    const createRenderer = (field, type) => {
      const options = FILTER_OPTIONS[type] || [];
      const listEl = field.querySelector(".filterDropdownList");
      const inputEl = field.querySelector(".filterInput");

      if (!listEl || !inputEl) return () => {};

      return (query) => {
        const q = (query || "").trim().toLowerCase();
        listEl.innerHTML = "";
        options.forEach((opt) => {
          if (q && !opt.toLowerCase().includes(q)) return;
          const li = document.createElement("li");
          li.textContent = opt;
          li.dataset.value = opt;
          li.addEventListener("click", () => {
            inputEl.value = opt;
            field.classList.remove("is-open");
            updateResetVisibility();
          });
          listEl.appendChild(li);
        });
      };
    };

    fields.forEach((field) => {
      const type = field.dataset.filterType;
      const toggleBtn = field.querySelector(".filterToggleBtn");
      const inputEl = field.querySelector(".filterInput");
      const render = createRenderer(field, type);

      if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const isOpen = field.classList.contains("is-open");
          closeAll();
          if (!isOpen) {
            field.classList.add("is-open");
            render(inputEl ? inputEl.value : "");
            if (inputEl) inputEl.focus();
          }
        });
      }

      if (inputEl) {
        inputEl.addEventListener("input", () => {
          if (!field.classList.contains("is-open")) {
            field.classList.add("is-open");
          }
          render(inputEl.value);
          updateResetVisibility();
        });
        inputEl.addEventListener("focus", () => {
          field.classList.add("is-open");
          render(inputEl.value);
        });
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        fields.forEach((field) => {
          const inputEl = field.querySelector(".filterInput");
          if (inputEl) inputEl.value = "";
        });
        closeAll();
        updateResetVisibility();
      });
    }

    document.addEventListener("click", (e) => {
      if (!filterWrap.contains(e.target)) {
        closeAll();
      }
    });

    updateResetVisibility();
  }
  //catalog filters script END//

  //faq accordion script START//
  document.querySelectorAll(".faqItem").forEach((item) => {
    const trigger = item.querySelector(".trigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => item.classList.toggle("open"));
  });
  //faq accordion script END//

  //story accordion script START//
  document.querySelectorAll(".storyItem").forEach((item) => {
    const trigger = item.querySelector(".storyTrigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => item.classList.toggle("open"));
  });
  //story accordion script END//

  //profile card expand script START//
  const profileWrap = document.querySelector(".profileWrap");
  if (profileWrap) {
    profileWrap.querySelectorAll(".profileCard--expandable").forEach((card) => {
      const wrap = card.querySelector(".cardContent");
      const btn = card.querySelector(".showAllBtn");
      const list = card.querySelector(".keywordList");
      if (!wrap || !btn || !list) return;
      const collapsedRows = parseInt(wrap.dataset.collapsedHeight || "4", 10);
      const itemCount = list.querySelectorAll("li").length;
      if (itemCount <= collapsedRows) {
        card.classList.add("profileCard--noExpand");
        wrap.classList.add("is-expanded");
        return;
      }
      btn.addEventListener("click", () => {
        const expanded = wrap.classList.toggle("is-expanded");
        btn.setAttribute("aria-expanded", expanded);
        btn.textContent = expanded ? btn.dataset.labelHide : btn.dataset.labelShow;
      });
    });
  }
  //profile card expand script END//

  //header nav dropdown script START//
  const header = document.querySelector(".header");
  if (header) {
    header.querySelectorAll(".nav-toggle").forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const item = toggle.closest(".nav-item");
        if (!item) return;
        const isOpen = item.classList.contains("is-open");
        header.querySelectorAll(".nav-item.is-open").forEach((openItem) => openItem.classList.remove("is-open"));
        if (!isOpen) item.classList.add("is-open");
      });
    });

    document.addEventListener("click", (e) => {
      if (!header.contains(e.target)) {
        header.querySelectorAll(".nav-item.is-open").forEach((item) => item.classList.remove("is-open"));
      }
    });
  }
  //header nav dropdown script END//

  //warning tooltip script START//
  const isTablet = () => window.matchMedia("(max-width: 1024px)").matches;
  document.querySelectorAll(".warningWrapper").forEach((wrapper) => {
    const trigger = wrapper.querySelector(".warningIco") || wrapper;
    trigger.addEventListener("click", (e) => {
      if (!isTablet()) return;
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = wrapper.classList.contains("is-open");
      document.querySelectorAll(".warningWrapper.is-open").forEach((w) => w.classList.remove("is-open"));
      if (!wasOpen) wrapper.classList.add("is-open");
    });
  });

  document.addEventListener("click", () => {
    if (isTablet()) {
      document.querySelectorAll(".warningWrapper.is-open").forEach((w) => w.classList.remove("is-open"));
    }
  });
  //warning tooltip script END//


  //Swiper-slider script START (for posts)//
  var mirrorButtonState = function (sourceBtn, extraButtons) {
    if (!sourceBtn || !extraButtons.length) return;
    var sync = function () {
      extraButtons.forEach(function (btn) {
        btn.className = sourceBtn.className;
        var aria = sourceBtn.getAttribute('aria-disabled');
        if (aria == null) {
          btn.removeAttribute('aria-disabled');
        } else {
          btn.setAttribute('aria-disabled', aria);
        }
      });
    };
    sync();
    var observer = new MutationObserver(sync);
    observer.observe(sourceBtn, { attributes: true, attributeFilter: ['class', 'aria-disabled'] });
  };

  var postSliderSection = document.getElementById('postSlider');
  if (postSliderSection) {
    var postSliderEl = postSliderSection.querySelector('.swiper');
    if (postSliderEl) {
      var isInsidePageSeparator = postSliderSection.closest('.pageSeparator');
      var navPrev = postSliderSection.querySelector('.postSliderPrev');
      var navNext = postSliderSection.querySelector('.postSliderNext');

      var bindExtraNavButtons = function (section, swiper, navPrev, navNext) {
        var extraPrev = [];
        var extraNext = [];

        section.querySelectorAll('.postSliderPrev').forEach(function (btn) {
          if (btn !== navPrev) {
            extraPrev.push(btn);
            btn.addEventListener('click', function () {
              navPrev.click();
            });
          }
        });
        section.querySelectorAll('.postSliderNext').forEach(function (btn) {
          if (btn !== navNext) {
            extraNext.push(btn);
            btn.addEventListener('click', function () {
              navNext.click();
            });
          }
        });

        mirrorButtonState(navPrev, extraPrev);
        mirrorButtonState(navNext, extraNext);
      };

      if (isInsidePageSeparator) {
        var containerEl = postSliderEl.closest('.postSliderTrack') || postSliderEl.parentElement;
        var getSlidesPerViewByWidth = function (w) {
          if (w < 620) return 1;
          if (w < 1024) return 2;
          if (w < 1280) return 3;
          return 4;
        };
        var getWidth = function () { return containerEl.offsetWidth; };
        var slidesPerView = getSlidesPerViewByWidth(getWidth());
        var swiperPosts = new Swiper('#postSlider .swiper', {
          direction: 'horizontal',
          slidesPerView: slidesPerView,
          spaceBetween: 24,
          loop: false,
          navigation: { nextEl: navNext, prevEl: navPrev },
        });
        bindExtraNavButtons(postSliderSection, swiperPosts, navPrev, navNext);
        var ro = new ResizeObserver(function () {
          var next = getSlidesPerViewByWidth(getWidth());
          if (next !== swiperPosts.params.slidesPerView) {
            swiperPosts.params.slidesPerView = next;
            swiperPosts.update();
          }
        });
        ro.observe(containerEl);
      } else {
        var swiperPosts = new Swiper('#postSlider .swiper', {
          direction: 'horizontal',
          slidesPerView: 1,
          spaceBetween: 24,
          loop: false,
          navigation: { nextEl: navNext, prevEl: navPrev },
          breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          },
        });
        bindExtraNavButtons(postSliderSection, swiperPosts, navPrev, navNext);
      }
    }
  }
  //Swiper-slider script END (for posts)//

  //Swiper-slider script START (for catalog agencies)//
  var agencySliderSection = document.getElementById('agencySlider');
  if (agencySliderSection) {
    var agencySliderEl = agencySliderSection.querySelector('.swiper');
    if (agencySliderEl) {
      var agencyNavPrev = agencySliderSection.querySelector('.postSliderPrev');
      var agencyNavNext = agencySliderSection.querySelector('.postSliderNext');

      var bindAgencyNavButtons = function (section, swiper, navPrev, navNext) {
        var extraPrev = [];
        var extraNext = [];

        section.querySelectorAll('.postSliderPrev').forEach(function (btn) {
          if (btn !== navPrev) {
            extraPrev.push(btn);
            btn.addEventListener('click', function () {
              agencyNavPrev.click();
            });
          }
        });
        section.querySelectorAll('.postSliderNext').forEach(function (btn) {
          if (btn !== navNext) {
            extraNext.push(btn);
            btn.addEventListener('click', function () {
              agencyNavNext.click();
            });
          }
        });

        mirrorButtonState(navPrev, extraPrev);
        mirrorButtonState(navNext, extraNext);
      };

      var swiperAgency = new Swiper('#agencySlider .swiper', {
        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 24,
        loop: false,
        navigation: { nextEl: agencyNavNext, prevEl: agencyNavPrev },
        breakpoints: {
          1024: { slidesPerView: 2 },
        },
      });

      bindAgencyNavButtons(agencySliderSection, swiperAgency, agencyNavPrev, agencyNavNext);
    }
  }
  //Swiper-slider script END (for catalog agencies)//
});
