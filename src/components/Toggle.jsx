import React, { useState } from 'react';

const ToggleSwitch = ({ status, onToggle }) => {
    return (
      <div className="flex items-center justify-start gap-3">
        <div 
          className={`relative inline-block w-12 h-7 rounded-full cursor-pointer transition-all duration-300 ${
            status ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onClick={onToggle}
        >
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
              status ? 'left-6' : 'left-1'
            }`}
          />
        </div>
      </div>
    );
  };


export default ToggleSwitch;