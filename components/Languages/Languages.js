'use client';

import Features from '../Features/Features';

const Languages = () => {
  const languages = [
    {
      icon: '/img/l1.png',
      title: 'JavaScript',
      description: 'Для веб-разработчиков'
    },
    {
      icon: '/img/l2.png',
      title: 'С++',
      description: 'Для разработчиков микропроцессоров'
    },
    {
      icon: '/img/l3.png',
      title: 'Python',
      description: 'Для специалистов в области машинного обучения.'
    },
    {
      icon: '/img/l4.png',
      title: 'Java',
      description: 'Для Android-разработчиков'
    }
  ];

  return (
    <Features 
      title="4 языка программирования"
      items={languages}
    />
  );
};

export default Languages;

