// Функция инициализации слайдера этапов с GSAP анимацией
export function initStepsSlider() {
  const stepsButtons = document.querySelectorAll(".steps__button");
  const stepsItems = document.querySelectorAll(".steps__item");

  if (!stepsButtons.length || !stepsItems.length) {
    console.warn("Steps elements not found");
    return;
  }

  let currentStep = 0;
  let isAnimating = false;

  // Настройка начального состояния для GSAP
  gsap.set(stepsItems, {
    x: "100%",
    opacity: 0,
    display: "none"
  });

  // Показать первый этап при загрузке
  gsap.set(stepsItems[0], {
    x: 0,
    opacity: 1,
    display: "flex"
  });

  // Добавить обработчики событий на кнопки
  stepsButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
      if (index === currentStep || isAnimating) {
        return;
      }

      switchToStep(index);
    });
  });

  // Функция переключения на определенный этап с GSAP анимацией
  function switchToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= stepsItems.length || isAnimating) {
      return;
    }

    isAnimating = true;

    // Определяем направление анимации
    const direction = stepIndex > currentStep ? 1 : -1;
    const currentItem = stepsItems[currentStep];
    const nextItem = stepsItems[stepIndex];

    // Обновляем активную кнопку
    stepsButtons[currentStep].classList.remove("steps__button--active");
    stepsButtons[stepIndex].classList.add("steps__button--active");

    // Создаем timeline для плавной анимации
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      }
    });

    // Настройка следующего элемента
    gsap.set(nextItem, {
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      display: "flex"
    });

    // Анимация: текущий элемент уходит, новый приходит
    tl.to(currentItem, {
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    })
    .to(nextItem, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut"
    }, "-=0.2") // Начинаем анимацию входа немного раньше
    .set(currentItem, {
      display: "none"
    });

    currentStep = stepIndex;
  }

  // Функция показа этапа (для совместимости)
  function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= stepsItems.length) {
      return;
    }

    // Скрываем все этапы
    stepsItems.forEach((item, index) => {
      if (index === stepIndex) {
        gsap.set(item, {
          x: 0,
          opacity: 1,
          display: "flex"
        });
      } else {
        gsap.set(item, {
          x: "100%",
          opacity: 0,
          display: "none"
        });
      }
    });
  }

  // Возвращаем функции для внешнего использования
  return {
    switchToStep,
    showStep,
    currentStep: () => currentStep
  };
}
