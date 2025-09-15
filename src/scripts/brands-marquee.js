
const SCROLL_SPEED = 1; // Пикселей за кадр (увеличьте для более быстрой прокрутки)

class BrandsMarquee {
  constructor() {
    this.container = document.querySelector('.brands__marquee');
    this.track = document.querySelector('.brands__track');
    this.brands = document.querySelectorAll('.brands__item');
    
    if (!this.container || !this.track || !this.brands.length) {
      console.warn('Элементы брендов не найдены');
      return;
    }
    
    this.position = 0;
    this.isPaused = false;
    this.animationId = null;
    this.singleSetWidth = 0;
    
    this.init();
  }
  
  init() {
    // Дублируем бренды для бесконечной прокрутки
    this.duplicateBrands();
    
    // Небольшая задержка для корректного расчета размеров
    setTimeout(() => {
      this.calculateWidth();
      this.startAnimation();
    }, 100);
    
    // Обработчик для паузы при наведении
    this.container.addEventListener('mouseenter', () => this.pauseAnimation());
    this.container.addEventListener('mouseleave', () => this.resumeAnimation());
  }
  
  duplicateBrands() {
    // Создаем копию всех брендов для бесконечной прокрутки
    const brandsHTML = Array.from(this.brands).map(brand => brand.outerHTML).join('');
    this.track.insertAdjacentHTML('beforeend', brandsHTML);
  }
  
  calculateWidth() {
    // Получаем ширину одного набора брендов (без дубликатов)
    const originalBrands = Array.from(this.brands);
    this.singleSetWidth = originalBrands.reduce((total, brand) => {
      return total + brand.offsetWidth + 30; // 30px - gap между элементами
    }, 0);
  }
  
  startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.animate();
  }
  
  animate() {
    if (this.isPaused) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.position -= SCROLL_SPEED;
    
    // Когда прокрутили на ширину одного набора брендов, сбрасываем позицию
    if (Math.abs(this.position) >= this.singleSetWidth) {
      this.position = 0;
    }
    
    this.track.style.transform = `translateX(${this.position}px)`;
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  pauseAnimation() {
    this.isPaused = true;
  }
  
  resumeAnimation() {
    this.isPaused = false;
  }
}

// Добавляем CSS стили
const style = document.createElement('style');
style.textContent = `
  .brands__marquee {
    overflow: hidden;
    white-space: nowrap;
    position: relative;
  }
  
  .brands__track {
    display: inline-flex;
    align-items: center;
    gap: 30px;
    will-change: transform;
  }
  
  .brands__item {
    flex-shrink: 0;
    height: 60px;
    display: flex;
    align-items: center;
  }
  
  .brands__item img {
    height: 60px;
    width: auto;
  }
`;
document.head.appendChild(style);

// Инициализируем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  new BrandsMarquee();
});
