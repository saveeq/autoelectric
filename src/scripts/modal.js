// Модальное окно для записи на диагностику
export function initModal() {
  const modal = document.getElementById('appointment-modal');
  const modalForm = document.getElementById('modal-form');
  const closeButton = modal?.querySelector('.modal__close');
  const overlay = modal?.querySelector('.modal__overlay');
  const submitButton = modalForm?.querySelector('.modal__button');
  const buttonText = submitButton?.querySelector('.modal__button-text');
  const buttonLoader = submitButton?.querySelector('.modal__button-loader');

  if (!modal || !modalForm || !closeButton || !overlay || !submitButton) {
    console.warn('Modal elements not found');
    return;
  }

  // Инициализация маски телефона для модального окна
  initModalPhoneMask();

  // Обработчики открытия модального окна
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-modal-open]')) {
      e.preventDefault();
      const modalId = e.target.getAttribute('data-modal-open');
      if (modalId === 'appointment-modal') {
        openModal();
      }
    }
  });

  // Обработчики закрытия модального окна
  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Закрытие по Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
      closeModal();
    }
  });

  // Обработчик отправки формы
  modalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleModalFormSubmit();
  });

  // Функция открытия модального окна
  function openModal() {
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    
    // Фокусируемся на первом поле
    const firstInput = modalForm.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  // Функция закрытия модального окна
  function closeModal() {
    modal.classList.remove('modal--active');
    document.body.style.overflow = ''; // Восстанавливаем скролл
    
    // Очищаем форму и сообщения
    setTimeout(() => {
      modalForm.reset();
      clearMessages();
    }, 300);
  }

  // Функция инициализации маски телефона для модального окна
  function initModalPhoneMask() {
    const phoneInput = modalForm.querySelector('input[type="tel"]');
    
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

  // Функция обработки отправки формы модального окна
  function handleModalFormSubmit() {
    const formData = new FormData(modalForm);
    
    // Получаем значения полей
    const name = formData.get('name')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const car = formData.get('car')?.trim() || '';
    const model = formData.get('model')?.trim() || '';
    const problem = formData.get('problem')?.trim() || '';

    // Валидация полей
    const errors = validateModalForm(name, phone, car, model, problem);
    
    if (errors.length > 0) {
      showMessage('error', errors[0]);
      return;
    }

    // Показываем индикатор загрузки
    showLoadingState();

    // Подготавливаем данные для отправки
    const data = {
      form_type: 'final',
      name: name,
      phone: phone,
      car: car,
      model: model,
      problem: problem
    };

    // Отправляем данные на сервер
    sendFormData(data)
      .then(response => {
        hideLoadingState();
        if (response.success) {
          showMessage('success', response.message);
          modalForm.reset();
          // Закрываем модальное окно через 2 секунды
          setTimeout(() => {
            closeModal();
          }, 2000);
        } else {
          showMessage('error', response.message || 'Произошла ошибка при отправке заявки');
        }
      })
      .catch(error => {
        hideLoadingState();
        console.error('Ошибка отправки формы:', error);
        showMessage('error', 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
      });
  }

  // Функция валидации формы модального окна
  function validateModalForm(name, phone, car, model, problem) {
    const errors = [];

    if (!name) {
      errors.push('Введите ваше имя');
    }

    if (!phone) {
      errors.push('Введите номер телефона');
    } else {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
        errors.push('Введите корректный номер телефона');
      }
    }

    if (!car) {
      errors.push('Введите марку автомобиля');
    }

    if (!model) {
      errors.push('Введите модель автомобиля');
    }

    if (!problem) {
      errors.push('Опишите проблему с автомобилем');
    }

    return errors;
  }

  // Функция показа сообщения
  function showMessage(type, text) {
    clearMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `modal__message modal__message--${type} modal__message--show`;
    messageDiv.textContent = text;
    
    // Вставляем сообщение перед формой
    modalForm.parentNode.insertBefore(messageDiv, modalForm);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.classList.remove('modal__message--show');
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // Функция очистки сообщений
  function clearMessages() {
    const messages = modal.querySelectorAll('.modal__message');
    messages.forEach(message => message.remove());
  }

  // Функция показа состояния загрузки
  function showLoadingState() {
    submitButton.disabled = true;
    submitButton.classList.add('modal__button--loading');
    buttonText.style.opacity = '0';
    buttonLoader.style.display = 'flex';
  }

  // Функция скрытия состояния загрузки
  function hideLoadingState() {
    submitButton.disabled = false;
    submitButton.classList.remove('modal__button--loading');
    buttonText.style.opacity = '1';
    buttonLoader.style.display = 'none';
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
