import React from 'react';
import SignIn from './components/SignIn';

const WelcomeScreen = ({ onGuestMode }) => {
  return (
    <>
      <SignIn />
      <button onClick={onGuestMode}>Guest Mode</button>
    </>
  );
};

export default WelcomeScreen;
