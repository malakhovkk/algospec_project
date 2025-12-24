import Login from '../../pages/Login/Login';

export const metadata = {
  title: 'Вход | AlgoSpec',
  description: 'Войдите в свой аккаунт AlgoSpec или зарегистрируйтесь для доступа к курсу подготовки к интервью по алгоритмам',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <Login />;
}

