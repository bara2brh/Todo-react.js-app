import React, { useState } from 'react';
import './css/Popup.css';

const Popup = ({ isOpen, togglePopup, children }) => {
  return (
    <>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              {children}
              <button onClick={togglePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}    
    </>
  );
};

export default Popup;
