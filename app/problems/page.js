import Problems from '../../pages/Problems/Problems';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

export const metadata = {
  title: 'Задачи для подготовки к собеседованию | AlgoSpec',
  description: 'Список задач для подготовки к техническому интервью. Бинарные деревья, стеки, кучи, рекурсия, сортировка и другие темы алгоритмов.',
  keywords: 'задачи алгоритмы, подготовка к интервью, программирование, бинарные деревья, стек, куча, рекурсия, сортировка',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProblemsPage() {
  return (
    // <ProtectedRoute>
      <Problems />
    // </ProtectedRoute>
  );
}
