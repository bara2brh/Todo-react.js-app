import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from './AuthProvider.js';
import { AuthProvider } from './AuthProvider';
import SignIn from './components/SignIn';
import WelcomeScreen from './WelcomeScreen.js';

function App() {
  const [user, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(() => JSON.parse(localStorage.getItem('guestMode')) || false);
  const auth = getAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    const body = document.body;
    if (darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isGuestMode) {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [auth, isGuestMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('guestMode', true);
  };

  return (
    <div className="App">
      <AuthProvider>
        <div class="dark-switch">
        <input  defaultChecked={darkMode} onClick={toggleDarkMode} type="checkbox" id="darkmode-toggle"/>
        <label for="darkmode-toggle">
        <i class="fa-light fa-moon moon"></i>
        <i class="fa-light fa-sun-bright sun"></i>
         </label>
        </div>
      
        <MainComponent isGuestMode={isGuestMode} onGuestMode={handleGuestMode} />
      </AuthProvider>
    </div>
  );
}

const MainComponent = ({ isGuestMode, onGuestMode }) => {
  const { currentUser } = useAuth();

  return currentUser || isGuestMode ? (
    <>
      <SignIn />
      <TodoList />
    </>
  ) : (
    <WelcomeScreen onGuestMode={onGuestMode} />
  );
};

export default App;
