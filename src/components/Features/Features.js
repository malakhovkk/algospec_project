import React from 'react';
import icon1 from '../../assets/img/icon1.png';
import icon2 from '../../assets/img/icon2.png';
import icon3 from '../../assets/img/icon3.png';
import icon4 from '../../assets/img/icon4.png';
import './Features.css';

const Features = ({ title, items }) => {
  const features = items || [
    {
      icon: icon1,
      title: '100 задач для интеревью',
      description: 'Подготовка к интервью — это сложная задача, котороая под силу не каждому программисту. Именно эту задачу мы решаем. Мы сделали разбор 100 лучших задач для удачного прохождения интервью.'
    },
    {
      icon: icon2,
      title: '30+ часов объяснений',
      description: 'Алгоритмы порой даются трудно, записав их объяснение на листочке. Поэтому мы решили сделать подробное видео-объяснение каждой задачи. Общая продолжительность всех видео - больше 30 часов.'
    },
    {
      icon: icon3,
      title: 'Решения на 4 языках',
      description: 'Каждый язык создан для разных целей. А программисты решают разные задачи. По этой причине мы разобрали задачи на 4 языках программирования: JS, C++, Python, Java.'
    },
    {
      icon: icon4,
      title: 'Сложность алгоритма и ресурсозатратность',
      description: 'Понимание того, сколько времени и сколько памяти занимает тот или иной алгоритм - невероятно важно. Объяснение каждой задачи включает себя это.'
    }
  ];

  return (
    <section className="whatcontains">
      <div className="whatcontains__title">
        <p>{title || 'Из чего состоит курс?'}</p>
      </div>
      <div className="whatcontains__content">
        <ul className="whatcontains__tasks">
          {features.map((feature, index) => (
            <li key={index} className="whatcontains__item">
              <img className="whatcontains__image" src={feature.icon} alt={feature.title} />
              <p className="whatcontains__title2">{feature.title}</p>
              <p className="whatcontains__description">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
