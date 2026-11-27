import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NewBooking from "./pages/NewBooking";
import MatchDetails from "./pages/MatchDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/new-booking"
        element={
          <ProtectedRoute>
          <NewBooking />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/matches/:id"
        element={
          <ProtectedRoute>
            <MatchDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}