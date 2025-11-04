import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PaymentsPage from '../pages/PaymentsPage/PaymentsPage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <nav style={{ padding: 8 }}>
                <Link to="/">Home</Link> | <Link to="/payments">Payments</Link>
            </nav>

            <Routes>
                <Route
                    path="/"
                    element={
                        <div style={{ padding: 20 }}>
                            <h1>Home</h1>
                        </div>
                    }
                />
                <Route path="/payments" element={<PaymentsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
