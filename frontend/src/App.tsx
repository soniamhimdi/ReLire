// import './App.css'
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkAuthProvider } from './contexts/ClerkAuthProvider';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
// Pages
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetailPage from './pages/BookDetail';
import ListingsPage from './pages/Listing';
import ListingDetailPage from './pages/ListingDetail';
import ListingForm from './components/Listings/ListingForm';
import ListingEditPage from './pages/ListingEdit';
import ProfilePage from './pages/Profile';

// import { useAuth } from "@clerk/clerk-react";
// import { useEffect } from "react";
// import { api } from "./services/api";

// function App() {
  // const { getToken, isSignedIn } = useAuth();

  // useEffect(() => {
  //   if (!isSignedIn) {
  //     api.setAuthToken(null);
  //     return;
  //   }

  //   const setupAuth = async () => {
  //     const token = await getToken();
  //     api.setAuthToken(token);
  //   };

  //   setupAuth();
  // }, [getToken, isSignedIn]);

function App() {
  return (
    <ClerkAuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<ListingForm />} />
            <Route path="/listings/:id/edit" element={<ListingEditPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
        <Footer />
      </Router>
    </ClerkAuthProvider>
  );
}

export default App