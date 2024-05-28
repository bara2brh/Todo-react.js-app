import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from './AuthProvider.js';
import { AuthProvider } from './AuthProvider';
import SignIn from './components/SignIn';
import WelcomeScreen from './WelcomeScreen.js';

function App() {
  const [user, setUser] = useState(null);
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
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };
/*
 {user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <img src={user.photoURL} alt="profile" />
          <SignIn />
        </div>
      ) : (
        <SignIn />
      )}
      
*/
  return (
    <div className="App">
        <AuthProvider>
        <button onClick={toggleDarkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <MainComponent /> 
    </AuthProvider>
    
  
   
    </div>
  );
  
}
const MainComponent = () => {
  const { currentUser } = useAuth();

  return currentUser ?  <>
  <SignIn/>
  
  <TodoList /></> : <WelcomeScreen />;
};
export default App;
