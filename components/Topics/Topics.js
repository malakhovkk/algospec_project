'use client';

import Image from 'next/image';
import './Topics.css';

const Topics = () => {
  const topics = [
    { image: '/img/task1.png', name: 'Бинарные деревья поиска' },
    { image: '/img/task2.png', name: 'Бинарные деревья' },
    { image: '/img/task3.png', name: 'Стек' },
    { image: '/img/task4.png', name: 'Куча' },
    { image: '/img/task5.png', name: 'Рекурсия' },
    { image: '/img/task6.png', name: 'Сортировка' },
    { image: '/img/task7.png', name: 'Динамическое программирование' },
    { image: '/img/task8.png', name: 'Графы' },
    { image: '/img/task9.png', name: 'Массивы' },
    { image: '/img/task10.png', name: 'Строки' }
  ];

  return (
    <section className="topic">
      <div className="topic__title">Задачи будут посвящены следующим темам</div>
      <ul className="topic__questions">
        {topics.map((topic, index) => (
          <li key={index} className="topic__question">
            <Image src={topic.image} alt={topic.name} width={80} height={80} unoptimized />
            <div className="topic__name">{topic.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Topics;

