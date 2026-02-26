import { useState, useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Custom hook for keyboard state
 */
export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (e) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismiss = () => {
    Keyboard.dismiss();
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    dismiss,
  };
};

export default useKeyboard;
