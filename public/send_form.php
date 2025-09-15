<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);

// Если данные не в JSON формате, получаем из $_POST
if (!$input) {
    $input = $_POST;
}

// Функция для очистки данных
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Функция для валидации email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Функция для валидации телефона
function isValidPhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return preg_match('/^(\+7|7|8)?[0-9]{10}$/', $phone);
}

// Функция для форматирования телефона
function formatPhone($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($phone) === 11) {
        if ($phone[0] === '8') {
            $phone = '7' . substr($phone, 1);
        }
        return '+7 (' . substr($phone, 1, 3) . ') ' . substr($phone, 4, 3) . '-' . substr($phone, 7, 2) . '-' . substr($phone, 9, 2);
    }
    return $phone;
}

// Валидация обязательных полей
$errors = [];

// Проверяем тип формы
$formType = isset($input['form_type']) ? cleanInput($input['form_type']) : 'unknown';

if ($formType === 'calculator') {
    // Валидация для формы калькулятора
    $problem = isset($input['problem']) ? cleanInput($input['problem']) : '';
    $brand = isset($input['brand']) ? cleanInput($input['brand']) : '';
    $model = isset($input['model']) ? cleanInput($input['model']) : '';
    $phone = isset($input['phone']) ? cleanInput($input['phone']) : '';
    
    if (empty($problem)) {
        $errors[] = 'Проблема не указана';
    }
    if (empty($brand)) {
        $errors[] = 'Марка автомобиля не указана';
    }
    if (empty($model)) {
        $errors[] = 'Модель автомобиля не указана';
    }
    if (empty($phone)) {
        $errors[] = 'Телефон не указан';
    } elseif (!isValidPhone($phone)) {
        $errors[] = 'Некорректный номер телефона';
    }
    
    $formData = [
        'problem' => $problem,
        'brand' => $brand,
        'model' => $model,
        'phone' => formatPhone($phone)
    ];
    
} elseif ($formType === 'final') {
    // Валидация для финальной формы
    $name = isset($input['name']) ? cleanInput($input['name']) : '';
    $phone = isset($input['phone']) ? cleanInput($input['phone']) : '';
    $car = isset($input['car']) ? cleanInput($input['car']) : '';
    $model = isset($input['model']) ? cleanInput($input['model']) : '';
    $problem = isset($input['problem']) ? cleanInput($input['problem']) : '';
    
    if (empty($name)) {
        $errors[] = 'Имя не указано';
    }
    if (empty($phone)) {
        $errors[] = 'Телефон не указан';
    } elseif (!isValidPhone($phone)) {
        $errors[] = 'Некорректный номер телефона';
    }
    if (empty($car)) {
        $errors[] = 'Марка автомобиля не указана';
    }
    if (empty($model)) {
        $errors[] = 'Модель автомобиля не указана';
    }
    if (empty($problem)) {
        $errors[] = 'Проблема не описана';
    }
    
    $formData = [
        'name' => $name,
        'phone' => formatPhone($phone),
        'car' => $car,
        'model' => $model,
        'problem' => $problem
    ];
    
} else {
    $errors[] = 'Неизвестный тип формы';
}

// Если есть ошибки валидации, возвращаем их
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ошибки валидации', 'errors' => $errors]);
    exit;
}

// Настройки для отправки email
$to = 'service-avto@mail.ru'; // Замените на ваш email
$subject = 'Новая заявка с сайта - ' . ($formType === 'calculator' ? 'Калькулятор' : 'Финальная форма');

// Формируем содержимое письма
$message = "Новая заявка с сайта\n\n";
$message .= "Тип формы: " . ($formType === 'calculator' ? 'Калькулятор стоимости' : 'Запись на диагностику') . "\n";
$message .= "Дата и время: " . date('d.m.Y H:i:s') . "\n\n";

if ($formType === 'calculator') {
    $message .= "Детали заявки:\n";
    $message .= "Проблема: " . $formData['problem'] . "\n";
    $message .= "Марка автомобиля: " . $formData['brand'] . "\n";
    $message .= "Модель автомобиля: " . $formData['model'] . "\n";
    $message .= "Телефон: " . $formData['phone'] . "\n";
} else {
    $message .= "Детали заявки:\n";
    $message .= "Имя: " . $formData['name'] . "\n";
    $message .= "Телефон: " . $formData['phone'] . "\n";
    $message .= "Марка автомобиля: " . $formData['car'] . "\n";
    $message .= "Модель автомобиля: " . $formData['model'] . "\n";
    $message .= "Проблема: " . $formData['problem'] . "\n";
}

$message .= "\n---\n";
$message .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "\n";
$message .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";

// Заголовки для email
$headers = [
    'From: noreply@servavto.ru',
    'Reply-To: noreply@servavto.ru',
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// Отправляем email
$mailSent = mail($to, $subject, $message, implode("\r\n", $headers));

if ($mailSent) {
    // Логируем успешную отправку
    $logMessage = date('Y-m-d H:i:s') . " - Успешно отправлена заявка типа: $formType\n";
    $logMessage .= "Данные: " . json_encode($formData, JSON_UNESCAPED_UNICODE) . "\n\n";
    file_put_contents('form_submissions.log', $logMessage, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
    ]);
} else {
    // Логируем ошибку
    $logMessage = date('Y-m-d H:i:s') . " - Ошибка отправки email для заявки типа: $formType\n";
    $logMessage .= "Данные: " . json_encode($formData, JSON_UNESCAPED_UNICODE) . "\n";
    $logMessage .= "Ошибка: " . error_get_last()['message'] . "\n\n";
    file_put_contents('form_errors.log', $logMessage, FILE_APPEND | LOCK_EX);
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.'
    ]);
}
?>
