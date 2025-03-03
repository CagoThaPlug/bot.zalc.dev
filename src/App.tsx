import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { API_BASE_URL } from './config';

// Add this to make the API URL available globally
window.API_BASE_URL = API_BASE_URL;

function App() {



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Login />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
