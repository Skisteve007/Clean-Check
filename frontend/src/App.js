import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import CleanCheckApp from '@/components/CleanCheckApp';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CleanCheckApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
