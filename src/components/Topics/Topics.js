import React from 'react';
import task1 from '../../assets/img/task1.png';
import task2 from '../../assets/img/task2.png';
import task3 from '../../assets/img/task3.png';
import task4 from '../../assets/img/task4.png';
import task5 from '../../assets/img/task5.png';
import task6 from '../../assets/img/task6.png';
import task7 from '../../assets/img/task7.png';
import task8 from '../../assets/img/task8.png';
import task9 from '../../assets/img/task9.png';
import task10 from '../../assets/img/task10.png';
import './Topics.css';

const Topics = () => {
  const topics = [
    { image: task1, name: 'Бинарные деревья поиска' },
    { image: task2, name: 'Бинарные деревья' },
    { image: task3, name: 'Стек' },
    { image: task4, name: 'Куча' },
    { image: task5, name: 'Рекурсия' },
    { image: task6, name: 'Сортировка' },
    { image: task7, name: 'Динамическое программирование' },
    { image: task8, name: 'Графы' },
    { image: task9, name: 'Массивы' },
    { image: task10, name: 'Строки' }
  ];

  return (
    <section className="topic">
      <div className="topic__title">Задачи будут посвящены следующим темам</div>
      <ul className="topic__questions">
        {topics.map((topic, index) => (
          <li key={index} className="topic__question">
            <img src={topic.image} alt={topic.name} />
            <div className="topic__name">{topic.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Topics;
