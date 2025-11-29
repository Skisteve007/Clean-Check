import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import CleanCheckApp from '@/components/CleanCheckApp';
import AdminPanel from '@/components/AdminPanel';
import HostingCheckout from '@/components/HostingCheckout';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CleanCheckApp />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/hosting-checkout" element={<HostingCheckout />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
