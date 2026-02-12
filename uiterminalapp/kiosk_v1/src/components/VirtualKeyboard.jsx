import React, { useState, useEffect } from 'react';

const VirtualKeyboard = ({ isVisible, onClose, onInput, currentValue, inputType = 'text', fieldName = '' }) => {
  const [input, setInput] = useState(currentValue || '');
  const [isCaps, setIsCaps] = useState(false);
  const [isNumeric, setIsNumeric] = useState(inputType === 'number' || inputType === 'tel');
  const [isEnglish, setIsEnglish] = useState(false);
  const [isSymbols, setIsSymbols] = useState(false);

  // Определяем, нужно ли использовать английскую раскладку для логина/пароля
  useEffect(() => {
    const isLoginField = fieldName === 'username' || fieldName === 'password';
    setIsEnglish(isLoginField);
  }, [fieldName]);

  const numericLayout = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  const qwertyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '⌫'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '↵'],
    ['↑', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?'],
    ['123', 'space', 'Готово']
  ];

  const russianLayout = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', '⌫'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', '↵'],
    ['↑', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.', ','],
    ['123', 'space', 'Готово']
  ];

  const symbolLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
    ['@', '#', '$', '%', '&', '*', '(', ')', '-', '+', '↵'],
    ['↑', '!', '"', "'", ':', ';', '/', '?', ',', '.', '_'],
    ['ABC', 'space', 'Готово']
  ];

  // Функция для получения текущей раскладки
  const getCurrentLayout = () => {
    if (isNumeric) return numericLayout;
    if (isSymbols) return symbolLayout;
    return isEnglish ? qwertyLayout : russianLayout;
  };

  useEffect(() => {
    setInput(currentValue || '');
    // Сбрасываем режимы при смене типа поля
    if (inputType === 'number' || inputType === 'tel') {
      setIsNumeric(true);
      setIsSymbols(false);
    } else {
      setIsNumeric(false);
      setIsSymbols(false);
    }
  }, [currentValue, inputType]);

  const handleKeyPress = (key) => {
    let newInput = input;
    
    switch(key) {
      case '⌫':
        newInput = input.slice(0, -1);
        break;
      case 'space':
        newInput = input + ' ';
        break;
      case '↵':
        newInput = input + '\n';
        break;
      case '↑':
        setIsCaps(!isCaps);
        return;
      case '123':
        setIsSymbols(true);
        setIsNumeric(false);
        return;
      case 'ABC':
        setIsSymbols(false);
        setIsNumeric(false);
        return;
      case 'Готово':
        onInput(input);
        onClose();
        return;
      default:
        if (isCaps) {
          newInput = input + key.toUpperCase();
        } else {
          newInput = input + key;
        }
    }
    
    setInput(newInput);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('keyboard-overlay')) {
      onClose();
    }
  };

  const handleToggleLanguage = () => {
    const newIsEnglish = !isEnglish;
    setIsEnglish(newIsEnglish);
    // Не сбрасываем input и другие состояния
  };

  const handleToggleNumeric = () => {
    const newIsNumeric = !isNumeric;
    setIsNumeric(newIsNumeric);
    if (newIsNumeric) {
      setIsSymbols(false);
    } else {
      // При возврате с цифровой клавиатуры возвращаемся к буквенной раскладке
      setIsSymbols(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="keyboard-overlay" onClick={handleOutsideClick}>
      <div className="virtual-keyboard">
        <div className="keyboard-header">
          <div className="keyboard-input-preview">
            <input 
              type="text" 
              value={input} 
              readOnly 
              placeholder="Введите текст..."
              className="keyboard-preview-input"
            />
          </div>
          <button className="keyboard-close-btn" onClick={() => {
            onInput(input);
            onClose();
          }}>
            ✓
          </button>
        </div>
        
        <div className="keyboard-layout">
          {getCurrentLayout().map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key, keyIndex) => {
                let keyClass = 'keyboard-key';
                if (['⌫', '↵', '↑', 'space', 'Готово', '123', 'ABC'].includes(key)) {
                  keyClass += ' special-key';
                }
                if (key === 'space') keyClass += ' space-key';
                if (key === 'Готово') keyClass += ' done-key';
                
                return (
                  <button
                    key={keyIndex}
                    className={keyClass}
                    onClick={() => handleKeyPress(key)}
                  >
                    {key === 'space' ? 'Пробел' : 
                     key === '↑' ? (isCaps ? '⇪' : '↑') : 
                     key === '⌫' ? '⌫' :
                     key === '↵' ? 'Ввод' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="keyboard-footer">
          <button 
            className="keyboard-toggle-btn"
            onClick={handleToggleNumeric}
          >
            {isNumeric ? (isEnglish ? 'ABC' : 'АБВ') : '123'}
          </button>
          <button 
            className="keyboard-toggle-btn"
            onClick={handleToggleLanguage}
            disabled={isNumeric || isSymbols}
            style={isNumeric || isSymbols ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {isEnglish ? 'RU' : 'EN'}
          </button>
          <button 
            className="keyboard-clear-btn"
            onClick={() => setInput('')}
          >
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;