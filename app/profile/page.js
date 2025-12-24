import Profile from '../../pages/Profile/Profile';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

export const metadata = {
  title: 'Редактирование профиля | AlgoSpec',
  description: 'Редактируйте свой профиль AlgoSpec: измените email, имя или пароль',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    // <ProtectedRoute>
      <Profile />
    // </ProtectedRoute>
  );
}
