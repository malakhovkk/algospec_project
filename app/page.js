import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import Companies from '@/components/Companies/Companies';
import Topics from '@/components/Topics/Topics';
import Languages from '@/components/Languages/Languages';
import Pricing from '@/components/Pricing/Pricing';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'AlgoSpec - Подготовка к интервью по алгоритмам | Главная',
  description: 'Остался один шаг на пути к мечте. Отточите навыки программирования перед важным интервью. 100 задач для интервью, 30+ часов объяснений.',
};

export default function HomePage() {
  return (
    <div className="wrapper">
      <Header />
      <Hero />
      <Features />
      <Companies />
      <Topics />
      <Languages />
      <Pricing />
      <Footer />
    </div>
  );
}

