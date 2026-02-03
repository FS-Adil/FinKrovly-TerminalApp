import React, { createContext, useState, useContext, useCallback } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';

const KeyboardContext = createContext();

export const useKeyboard = () => useContext(KeyboardContext);

export const KeyboardProvider = ({ children }) => {
  const [keyboardState, setKeyboardState] = useState({
    isVisible: false,
    currentValue: '',
    onChange: null,
    inputType: 'text',
    fieldName: ''
  });

  const showKeyboard = useCallback((currentValue, onChange, inputType = 'text', fieldName = '') => {
    setKeyboardState({
      isVisible: true,
      currentValue: currentValue || '',
      onChange,
      inputType,
      fieldName
    });
  }, []);

  const hideKeyboard = useCallback(() => {
    setKeyboardState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleKeyboardInput = useCallback((value) => {
    if (keyboardState.onChange) {
      const fakeEvent = {
        target: {
          name: keyboardState.fieldName,
          value: value,
          type: keyboardState.inputType
        }
      };
      keyboardState.onChange(fakeEvent);
    }
  }, [keyboardState]);

  return (
    <KeyboardContext.Provider value={{ showKeyboard, hideKeyboard }}>
      {children}
      {keyboardState.isVisible && (
        <VirtualKeyboard
          isVisible={keyboardState.isVisible}
          onClose={hideKeyboard}
          onInput={handleKeyboardInput}
          currentValue={keyboardState.currentValue}
          inputType={keyboardState.inputType}
          fieldName={keyboardState.fieldName}
        />
      )}
    </KeyboardContext.Provider>
  );
};