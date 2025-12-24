import React from 'react';
import Features from '../Features/Features';
import l1 from '../../assets/img/l1.png';
import l2 from '../../assets/img/l2.png';
import l3 from '../../assets/img/l3.png';
import l4 from '../../assets/img/l4.png';

const Languages = () => {
  const languages = [
    {
      icon: l1,
      title: 'JavaScript',
      description: 'Для веб-разработчиков'
    },
    {
      icon: l2,
      title: 'С++',
      description: 'Для разработчиков микропроцессоров'
    },
    {
      icon: l3,
      title: 'Python',
      description: 'Для специалистов в области машинного обучения.'
    },
    {
      icon: l4,
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
