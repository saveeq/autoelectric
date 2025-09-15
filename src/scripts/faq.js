// FAQ Accordion functionality
class FAQAccordion {
  constructor() {
    this.init();
  }

  init() {
    this.faqItems = document.querySelectorAll('.faq__item');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.faqItems.forEach(item => {
      const question = item.querySelector('.faq__question');
      
      if (question) {
        question.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleItem(item);
        });

        // Добавляем поддержку клавиатуры
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleItem(item);
          }
        });
      }
    });
  }

  toggleItem(item) {
    const isActive = item.classList.contains('faq__item--active');
    
    // Закрываем все открытые элементы
    this.closeAllItems();
    
    // Если элемент был закрыт, открываем его
    if (!isActive) {
      this.openItem(item);
    }
  }

  openItem(item) {
    const answer = item.querySelector('.faq__answer');
    const icon = item.querySelector('.faq__icon');
    
    if (!answer) return;

    // Добавляем класс для анимации
    item.classList.add('faq__item--opening');
    
    // Устанавливаем активный класс
    item.classList.add('faq__item--active');
    
    // Получаем высоту контента для плавной анимации
    const contentHeight = answer.scrollHeight;
    
    // Устанавливаем максимальную высоту для анимации
    answer.style.maxHeight = contentHeight + 'px';
    
    // Убираем класс анимации после завершения
    setTimeout(() => {
      item.classList.remove('faq__item--opening');
      answer.style.maxHeight = 'none'; // Убираем ограничение высоты
    }, 400);

    // Анимация иконки
    if (icon) {
      icon.style.transform = 'rotate(180deg)';
    }

    // Прокручиваем к элементу для лучшего UX
    this.scrollToItem(item);
  }

  closeItem(item) {
    const answer = item.querySelector('.faq__answer');
    const icon = item.querySelector('.faq__icon');
    
    if (!answer) return;

    // Убираем активный класс
    item.classList.remove('faq__item--active');
    
    // Сбрасываем высоту для анимации закрытия
    answer.style.maxHeight = answer.scrollHeight + 'px';
    
    // Принудительно перерисовываем
    answer.offsetHeight;
    
    // Анимируем закрытие
    answer.style.maxHeight = '0px';
    
    // Анимация иконки
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
  }

  closeAllItems() {
    this.faqItems.forEach(item => {
      this.closeItem(item);
    });
  }

  scrollToItem(item) {
    const itemRect = item.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Если элемент не полностью виден, прокручиваем к нему
    if (itemRect.top < 100 || itemRect.bottom > windowHeight - 100) {
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  // Метод для открытия конкретного элемента по индексу
  openItemByIndex(index) {
    if (index >= 0 && index < this.faqItems.length) {
      this.toggleItem(this.faqItems[index]);
    }
  }

  // Метод для получения состояния всех элементов
  getState() {
    return Array.from(this.faqItems).map((item, index) => ({
      index,
      isOpen: item.classList.contains('faq__item--active')
    }));
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  new FAQAccordion();
});

// Экспорт для возможного использования в других модулях
export default FAQAccordion;
