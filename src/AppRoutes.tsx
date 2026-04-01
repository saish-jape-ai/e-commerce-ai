import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import Page from "@/components/Page";
import ScrollToTop from "@/components/ScrollToTop";
import AboutPage from "@/pages/AboutPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ContactPage from "@/pages/ContactPage";
import CouponsPage from "@/pages/CouponsPage";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import ProductsPage from "@/pages/ProductsPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import SignupPage from "@/pages/SignupPage";
import WishlistPage from "@/pages/WishlistPage";
import RequireAuth from "@/components/RequireAuth";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Layout>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Index /></Page>} />
            <Route path="/products" element={<Page><ProductsPage /></Page>} />
            <Route path="/product/:id" element={<Page><ProductDetailPage /></Page>} />
            <Route path="/cart" element={<Page><CartPage /></Page>} />
            <Route path="/wishlist" element={<Page><WishlistPage /></Page>} />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Page><CheckoutPage /></Page>
                </RequireAuth>
              }
            />
            <Route path="/order-success" element={<Page><OrderSuccessPage /></Page>} />
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <Page><LoginPage /></Page>
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthed>
                  <Page><SignupPage /></Page>
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Page><ProfilePage /></Page>
                </RequireAuth>
              }
            />
            <Route path="/search" element={<Page><SearchPage /></Page>} />
            <Route path="/contact" element={<Page><ContactPage /></Page>} />
            <Route path="/about" element={<Page><AboutPage /></Page>} />
            <Route path="/track-order" element={<Page><OrderTrackingPage /></Page>} />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Page><SettingsPage /></Page>
                </RequireAuth>
              }
            />
            <Route path="/coupons" element={<Page><CouponsPage /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </>
  );
};

export default AppRoutes;
