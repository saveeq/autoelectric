// Обработчик для финальной формы
export function initFinalForm() {
  const finalForm = document.querySelector('.final__form');
  
  if (!finalForm) {
    console.warn('Final form not found');
    return;
  }

  // Инициализация маски телефона для финальной формы
  initFinalFormPhoneMask();
  
  // Добавляем обработчик отправки формы
  finalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleFinalFormSubmit();
  });

  // Функция инициализации маски телефона для финальной формы
  function initFinalFormPhoneMask() {
    const phoneInput = finalForm.querySelector('input[type="tel"]');
    
    if (!phoneInput) return;

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
    });

    // Обработчик фокуса
    phoneInput.addEventListener('focus', function() {
      if (this.value === '') {
        this.value = '+7 (';
      }
    });

    // Обработчик потери фокуса
    phoneInput.addEventListener('blur', function() {
      if (this.value === '+7 (' || this.value === '') {
        this.value = '';
      }
    });
  }

  // Функция обработки отправки финальной формы
  function handleFinalFormSubmit() {
    const formData = new FormData(finalForm);
    
    // Получаем значения полей
    const name = formData.get('name') || finalForm.querySelector('input[placeholder="Иван"]').value;
    const phone = formData.get('phone') || finalForm.querySelector('input[type="tel"]').value;
    const car = formData.get('car') || finalForm.querySelector('input[placeholder="Toyota"]').value;
    const model = formData.get('model') || finalForm.querySelector('input[placeholder="Camry"]').value;
    const problem = formData.get('problem') || finalForm.querySelector('input[placeholder="Не работает стеклоподъемник"]').value;

    // Валидация полей
    const errors = validateFinalForm(name, phone, car, model, problem);
    
    if (errors.length > 0) {
      showValidationErrors(errors);
      return;
    }

    // Показываем индикатор загрузки
    showLoadingState();

    // Подготавливаем данные для отправки
    const data = {
      form_type: 'final',
      name: name.trim(),
      phone: phone.trim(),
      car: car.trim(),
      model: model.trim(),
      problem: problem.trim()
    };

    // Отправляем данные на сервер
    sendFormData(data)
      .then(response => {
        hideLoadingState();
        if (response.success) {
          showSuccessMessage();
          resetForm();
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

  // Функция валидации финальной формы
  function validateFinalForm(name, phone, car, model, problem) {
    const errors = [];

    if (!name || name.trim() === '') {
      errors.push('Введите ваше имя');
    }

    if (!phone || phone.trim() === '') {
      errors.push('Введите номер телефона');
    } else {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
        errors.push('Введите корректный номер телефона');
      }
    }

    if (!car || car.trim() === '') {
      errors.push('Введите марку автомобиля');
    }

    if (!model || model.trim() === '') {
      errors.push('Введите модель автомобиля');
    }

    if (!problem || problem.trim() === '') {
      errors.push('Опишите проблему с автомобилем');
    }

    return errors;
  }

  // Функция показа ошибок валидации
  function showValidationErrors(errors) {
    // Убираем предыдущие ошибки
    clearValidationErrors();

    // Показываем первую ошибку
    if (errors.length > 0) {
      showErrorMessage(errors[0]);
    }
  }

  // Функция очистки ошибок валидации
  function clearValidationErrors() {
    const existingError = finalForm.querySelector('.final__form-error');
    if (existingError) {
      existingError.remove();
    }
  }

  // Функция показа сообщения об ошибке
  function showErrorMessage(message) {
    clearValidationErrors();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'final__form-error';
    errorDiv.textContent = message;
    
    // Вставляем ошибку перед кнопкой отправки
    const submitButton = finalForm.querySelector('.final__form-button');
    finalForm.insertBefore(errorDiv, submitButton);
    
    // Анимация появления
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      errorDiv.style.transition = 'all 0.3s ease-out';
      errorDiv.style.opacity = '1';
      errorDiv.style.transform = 'translateY(0)';
    });
  }

  // Функция показа сообщения об успехе
  function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'final__form-success';
    successDiv.innerHTML = `
      <div class="final__form-success-content">
        <h3>Спасибо за заявку!</h3>
        <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время для уточнения деталей.</p>
      </div>
    `;
    
    // Заменяем форму на сообщение об успехе
    finalForm.style.display = 'none';
    finalForm.parentNode.appendChild(successDiv);
    
    // Анимация появления
    successDiv.style.opacity = '0';
    successDiv.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      successDiv.style.transition = 'all 0.3s ease-out';
      successDiv.style.opacity = '1';
      successDiv.style.transform = 'translateY(0)';
    });
  }

  // Функция показа состояния загрузки
  function showLoadingState() {
    const submitButton = finalForm.querySelector('.final__form-button');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';
    submitButton.classList.add('final__form-button--loading');
  }

  // Функция скрытия состояния загрузки
  function hideLoadingState() {
    const submitButton = finalForm.querySelector('.final__form-button');
    
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить';
    submitButton.classList.remove('final__form-button--loading');
  }

  // Функция сброса формы
  function resetForm() {
    const inputs = finalForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
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
}
