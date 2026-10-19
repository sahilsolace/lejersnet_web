import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/lib/store';
import { AppLayout } from '@/components/AppLayout';
import { AuthScreen } from '@/components/AuthScreen';
import { ToastProvider } from '@/components/Toast';
import { HomePage } from '@/pages/HomePage';
import { AddressesPage } from '@/pages/AddressesPage';
import { UploadPage } from '@/pages/UploadPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { PicturesPage } from '@/pages/PicturesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SubscriptionsPage } from '@/pages/SubscriptionsPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ContactPage } from '@/pages/ContactPage';
import { SubscribePage } from '@/pages/SubscribePage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/signin"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthScreen />}
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/upload/:addressId/:moveType" element={<UploadPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/pictures" element={<PicturesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/profile/addresses" element={<AddressesPage />} />
                <Route path="/profile/orders" element={<OrdersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/subscribe" element={<SubscribePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
