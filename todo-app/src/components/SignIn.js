// src/components/SignIn.js
import React from 'react';
import { auth, provider, signInWithPopup, signOut } from '../firebase';
import { db, doc, setDoc } from '../firebase';
import { useAuth } from '../AuthProvider.js';
import { AuthProvider } from '../AuthProvider';

const SignIn = () => {
  const { currentUser } = useAuth();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid
      };
      
      localStorage.setItem('uid', user.uid);
      localStorage.removeItem('guestMode');
      localStorage.setItem('uid', user.uid);

      await setDoc(doc(db, 'users', user.uid), userData);

    } catch (error) {
      console.error("Error signing in with Google:", error);
      console.error("Error adding user:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.setItem('guestMode', JSON.stringify(true));

    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      {!currentUser ?<button onClick={handleSignIn}>Sign in with Google</button>: <button onClick={handleSignOut}>Sign out</button> }
     
    </div>
  );
};

export default SignIn;
