// Функция инициализации форм калькулятора
export function initCalculatorForms() {
  const calculateButton = document.querySelector(
    ".calculator__button--calculate"
  );
  const forms = document.querySelectorAll(".calculator__form");
  const loader = document.querySelector(".calculator__loader");
  const firstForm = document.getElementById("calculator-first-form");
  const secondForm = document.getElementById("calculator-second-form");
  const phoneInput = document.getElementById("phone");

  if (!calculateButton || !forms.length || !loader || !firstForm || !secondForm) {
    console.warn("Calculator elements not found");
    return;
  }

  let isAnimating = false;

  // Инициализация валидации первой формы
  initFirstFormValidation();
  
  // Инициализация маски телефона
  if (phoneInput) {
    initPhoneMask();
  }

  // Добавить обработчик события на кнопку расчета
  calculateButton.addEventListener("click", function (e) {
    e.preventDefault();

    if (isAnimating) {
      return;
    }

    // Проверяем валидность формы перед переключением
    if (firstForm.checkValidity()) {
      switchToSecondForm();
    } else {
      // Показываем ошибки валидации
      showValidationErrors();
    }
  });

  // Обработчик отправки второй формы
  secondForm.addEventListener("submit", function(e) {
    e.preventDefault();
    handleSecondFormSubmit();
  });

  // Функция инициализации валидации первой формы
  function initFirstFormValidation() {
    const inputs = firstForm.querySelectorAll('input[required]');
    
    // Функция проверки валидности всех полей
    function checkFormValidity() {
      let allValid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          allValid = false;
        }
      });
      
      calculateButton.disabled = !allValid;
      
      if (allValid) {
        calculateButton.classList.remove('calculator__button--disabled');
      } else {
        calculateButton.classList.add('calculator__button--disabled');
      }
    }

    // Добавляем обработчики на каждое поле
    inputs.forEach(input => {
      input.addEventListener('input', checkFormValidity);
      input.addEventListener('blur', checkFormValidity);
    });

    // Проверяем начальное состояние
    checkFormValidity();
  }

  // Функция показа ошибок валидации
  function showValidationErrors() {
    const inputs = firstForm.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('calculator__input--error');
        
        // Убираем класс ошибки при вводе
        input.addEventListener('input', function() {
          this.classList.remove('calculator__input--error');
        }, { once: true });
      }
    });
  }

  // Функция инициализации маски телефона
  function initPhoneMask() {
    const phoneWrapper = phoneInput.closest('.calculator__phone-wrapper');
    const phoneMask = phoneWrapper.querySelector('.calculator__phone-mask');
    
    if (!phoneMask) return;

    // Показываем маску когда поле пустое
    function updateMaskVisibility() {
      if (phoneInput.value === '') {
        phoneMask.style.display = 'block';
      } else {
        phoneMask.style.display = 'none';
      }
    }

    // Обработчик ввода
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, ''); // Убираем все не-цифры
      
      // Ограничиваем длину
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      // Форматируем номер
      let formattedValue = '';
      if (value.length > 0) {
        if (value[0] === '8') {
          value = '7' + value.slice(1); // Заменяем 8 на 7
        }
        if (value[0] === '7') {
          formattedValue = '+7';
          if (value.length > 1) {
            formattedValue += ' (' + value.slice(1, 4);
          }
          if (value.length >= 5) {
            formattedValue += ') ' + value.slice(4, 7);
          }
          if (value.length >= 8) {
            formattedValue += '-' + value.slice(7, 9);
          }
          if (value.length >= 10) {
            formattedValue += '-' + value.slice(9, 11);
          }
        } else if (value.length > 0) {
          formattedValue = '+7 (' + value;
        }
      }

      e.target.value = formattedValue;
      updateMaskVisibility();
    });

    // Обработчик фокуса
    phoneInput.addEventListener('focus', function() {
      if (this.value === '') {
        this.value = '+7 (';
        updateMaskVisibility();
      }
    });

    // Обработчик потери фокуса
    phoneInput.addEventListener('blur', function() {
      if (this.value === '+7 (' || this.value === '') {
        this.value = '';
        updateMaskVisibility();
      }
    });

    // Инициализация
    updateMaskVisibility();
  }

  // Функция переключения на вторую форму
  function switchToSecondForm() {
    isAnimating = true;

    // Скрыть первую форму
    hideForm(firstForm, () => {
      // Показать лоадер
      showLoader(() => {
        // Имитация загрузки (2 секунды)
        setTimeout(() => {
          // Скрыть лоадер
          hideLoader(() => {
            // Показать вторую форму
            showForm(secondForm, () => {
              isAnimating = false;
              // Фокусируемся на поле телефона
              if (phoneInput) {
                phoneInput.focus();
              }
            });
          });
        }, 2000);
      });
    });
  }

  // Функция обработки отправки второй формы
  function handleSecondFormSubmit() {
    const phoneValue = phoneInput.value.replace(/\D/g, '');
    
    // Проверяем корректность номера
    if (phoneValue.length !== 11 || !phoneValue.startsWith('7')) {
      phoneInput.classList.add('calculator__input--error');
      phoneInput.focus();
      return;
    }

    // Показываем индикатор загрузки
    showLoadingState();

    // Подготавливаем данные для отправки
    const data = {
      form_type: 'calculator',
      problem: document.getElementById('problem').value.trim(),
      brand: document.getElementById('brand').value.trim(),
      model: document.getElementById('model').value.trim(),
      phone: phoneInput.value.trim()
    };

    // Отправляем данные на сервер
    sendFormData(data)
      .then(response => {
        hideLoadingState();
        if (response.success) {
          showSuccessMessage();
        } else {
          showErrorMessage(response.message || 'Произошла ошибка при отправке заявки');
        }
      })
      .catch(error => {
        hideLoadingState();
        console.error('Ошибка отправки формы:', error);
        showErrorMessage('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
      });
  }

  // Функция показа сообщения об успехе
  function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'calculator__success';
    successMessage.innerHTML = `
      <div class="calculator__success-content">
        <h3>Спасибо за заявку!</h3>
        <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время для уточнения деталей.</p>
      </div>
    `;
    
    secondForm.style.display = 'none';
    secondForm.parentNode.appendChild(successMessage);
    
    // Анимация появления
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      successMessage.style.transition = 'all 0.3s ease-out';
      successMessage.style.opacity = '1';
      successMessage.style.transform = 'translateY(0)';
    });
  }

  // Функция показа сообщения об ошибке
  function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'calculator__error';
    errorMessage.innerHTML = `
      <div class="calculator__error-content">
        <h3>Ошибка отправки</h3>
        <p>${message}</p>
        <button type="button" class="calculator__error-close">Закрыть</button>
      </div>
    `;
    
    secondForm.parentNode.appendChild(errorMessage);
    
    // Анимация появления
    errorMessage.style.opacity = '0';
    errorMessage.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      errorMessage.style.transition = 'all 0.3s ease-out';
      errorMessage.style.opacity = '1';
      errorMessage.style.transform = 'translateY(0)';
    });

    // Обработчик закрытия ошибки
    const closeButton = errorMessage.querySelector('.calculator__error-close');
    closeButton.addEventListener('click', () => {
      errorMessage.style.transition = 'all 0.3s ease-out';
      errorMessage.style.opacity = '0';
      errorMessage.style.transform = 'translateY(20px)';
      setTimeout(() => {
        errorMessage.remove();
      }, 300);
    });
  }

  // Функция показа состояния загрузки
  function showLoadingState() {
    const submitButton = secondForm.querySelector('.calculator__button');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';
    submitButton.classList.add('calculator__button--loading');
  }

  // Функция скрытия состояния загрузки
  function hideLoadingState() {
    const submitButton = secondForm.querySelector('.calculator__button');
    
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить заявку';
    submitButton.classList.remove('calculator__button--loading');
  }

  // Функция отправки данных на сервер
  async function sendFormData(data) {
    const response = await fetch('send_form.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Функция показа формы
  function showForm(form, callback) {
    form.style.display = "flex";
    form.style.opacity = "0";

    // Небольшая задержка для корректного применения стилей
    requestAnimationFrame(() => {
      form.style.transition = "opacity 0.4s ease-in-out";
      form.style.opacity = "1";

      // Вызвать callback после завершения анимации
      setTimeout(() => {
        if (callback) callback();
      }, 400);
    });
  }

  // Функция скрытия формы
  function hideForm(form, callback) {
    form.style.transition = "opacity 0.4s ease-in-out";
    form.style.opacity = "0";

    // Скрыть элемент после завершения анимации
    setTimeout(() => {
      form.style.display = "none";
      if (callback) callback();
    }, 400);
  }

  // Функция показа лоадера
  function showLoader(callback) {
    loader.style.display = "flex";
    loader.style.opacity = "0";

    // Небольшая задержка для корректного применения стилей
    requestAnimationFrame(() => {
      loader.style.transition = "opacity 0.3s ease-in-out";
      loader.style.opacity = "1";

      // Вызвать callback после завершения анимации
      setTimeout(() => {
        if (callback) callback();
      }, 300);
    });
  }

  // Функция скрытия лоадера
  function hideLoader(callback) {
    loader.style.transition = "opacity 0.3s ease-in-out";
    loader.style.opacity = "0";

    // Скрыть элемент после завершения анимации
    setTimeout(() => {
      loader.style.display = "none";
      if (callback) callback();
    }, 300);
  }
}
