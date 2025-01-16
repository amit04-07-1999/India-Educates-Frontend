import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../studentCompt/StudentHeader';
import StudentSidebar from '../studentCompt/StudentSidebar';

const YourForms = () => {
 
  return (
    <div id="mytask-layout">
      <StudentSidebar />
      <div className="main px-lg-4 px-md-4">
        <StudentHeader />
        <div className="body d-flex py-lg-3 py-md-2">
          <div className="container-xxl">
            <h1>Your Forms</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourForms;
