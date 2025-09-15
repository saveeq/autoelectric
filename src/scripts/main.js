// Импорт модулей
import { initStepsSlider } from "./steps-slider.js";
import { initCalculatorForms } from "./calculator.js";
import { initFinalForm } from "./final-form.js";
import { initModal } from "./modal.js";

// Инициализация после загрузки DOM
document.addEventListener("DOMContentLoaded", function () {
  initStepsSlider();
  initCalculatorForms();
  initFinalForm();
  initModal();
  initHeaderScroll();
  initSmoothScroll();
  initReasonsAnimation();
  initAdvantagesAnimation();
});

// Функция инициализации скролла header'а
function initHeaderScroll() {
  const header = document.querySelector(".header");
  const logoImg = document.querySelector(".header .logo__img");

  if (!header || !logoImg) {
    console.warn("Header or logo element not found");
    return;
  }

  let isScrolled = false;

  // Пути к логотипам
  const whiteLogo = "./src/assets/img/white-logo.svg";
  const darkLogo = "./src/assets/img/logo.svg";

  // Функция обработки скролла
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Если скролл больше 0 и header еще не имеет класс
    if (scrollTop > 0 && !isScrolled) {
      header.classList.add("header--scrolled");
      logoImg.src = darkLogo; // Меняем на темный логотип
      isScrolled = true;
    }
    // Если скролл равен 0 и header имеет класс
    else if (scrollTop === 0 && isScrolled) {
      header.classList.remove("header--scrolled");
      logoImg.src = whiteLogo; // Возвращаем белый логотип
      isScrolled = false;
    }
  }

  // Добавляем обработчик события скролла с throttling для производительности
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }

  function onScroll() {
    ticking = false;
    requestTick();
  }

  // Добавляем слушатель события скролла
  window.addEventListener("scroll", onScroll, { passive: true });

  // Проверяем начальное состояние при загрузке страницы
  handleScroll();
}

// Функция инициализации плавного скролла
function initSmoothScroll() {
  // Обрабатываем ссылки в header и footer
  const navLinks = document.querySelectorAll('.header__nav-link[href^="#"], .footer__nav-link[href^="#"]');

  if (!navLinks.length) {
    return;
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Получаем актуальную высоту header'а
        const header = document.querySelector(".header");
        const headerHeight = header ? header.offsetHeight : 0;
        
        // Получаем позицию секции относительно документа
        const targetRect = targetSection.getBoundingClientRect();
        const targetPosition = window.pageYOffset + targetRect.top - headerHeight - 20; // 20px дополнительный отступ

        // Плавная прокрутка с учетом высоты header'а
        window.scrollTo({
          top: Math.max(0, targetPosition), // Убеждаемся, что не прокручиваем выше начала страницы
          behavior: "smooth",
        });
      }
    });
  });
}

// Функция инициализации анимации карточек reasons
function initReasonsAnimation() {
  console.log("initReasonsAnimation called");
  
  const reasonsCards = document.querySelectorAll(".reasons__card");
  console.log("Found reasons cards:", reasonsCards.length);

  if (!reasonsCards.length) {
    console.warn("Reasons cards not found");
    return;
  }

  // Функция проверки видимости элемента
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Элемент считается видимым, когда его верхняя часть находится в области видимости
    return rect.top < windowHeight * 0.9 && rect.bottom > 0;
  }
  
  // Функция обработки скролла
  function handleScroll() {
    reasonsCards.forEach((card, index) => {
      if (!card.classList.contains("reasons__card--animated") && isElementInViewport(card)) {
        console.log("Animating card", index);
        setTimeout(() => {
          card.classList.add("reasons__card--animated");
        }, index * 200);
      }
    });
  }
  
  // Добавляем обработчик скролла с throttling для производительности
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }
  
  function onScroll() {
    ticking = false;
    requestTick();
  }
  
  window.addEventListener("scroll", onScroll, { passive: true });
  
  // Проверяем начальное состояние
  handleScroll();
}


// Функция инициализации анимации карточек advantages
function initAdvantagesAnimation() {
  document.querySelectorAll(".advantages__item-inner").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
    });
  });
}

// Дополнительная функция для инициализации других компонентов (если понадобится)
function initOtherComponents() {
  // Здесь можно добавить инициализацию других компонентов
  // например, слайдеров, модальных окон и т.д.
}
