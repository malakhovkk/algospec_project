'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Problems.css';

const Problems = () => {
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState('category');

  const problems = [
    {
      theme: 'Бинарные деревья поиска',
      icon: '/img/binary_search_tree.png',
      color: '#00AAFF',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    },
    {
      theme: 'Бинарные деревья',
      icon: '/img/binary_tree.png',
      color: '#F2336C',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    },
    {
      theme: 'Стек',
      icon: '/img/stack.png',
      color: '#FFB82E',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    },
    {
      theme: 'Куча',
      icon: '/img/heap.png',
      color: '#15D361',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    },
    {
      theme: 'Рекурсия',
      icon: '/img/recur.png',
      color: '#4B5DFD',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    },
    {
      theme: 'Сортировка',
      icon: '/img/sort.png',
      color: '#F2E14C',
      items: [
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'green' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'yellow' },
        { name: 'Массивы', difficulty: 'red' },
        { name: 'Массивы', difficulty: 'red' }
      ]
    }
  ];

  const getStarIcon = (difficulty) => {
    switch (difficulty) {
      case 'green':
        return '/img/star_green.png';
      case 'yellow':
        return '/img/star_yellow.png';
      case 'red':
        return '/img/star_red.png';
      default:
        return '/img/star_green.png';
    }
  };

  return (
    <div className="wrapper">
      <Header />
      <section className="main">
        <div className="title">Задачи для подготовки к собеседованию</div>
        <div className="sort">
          <div className="sort__by">
            <div className="sort__by__caption">Сортировать по:</div>
            <div className="sort__by__choice">
              <div
                className={`sort__by__choice__category ${sortBy === 'category' ? 'active' : ''}`}
                onClick={() => setSortBy('category')}
              >
                категории
              </div>
              <div
                className={`sort__by__choice__difficulty ${sortBy === 'difficulty' ? 'active' : ''}`}
                onClick={() => setSortBy('difficulty')}
              >
                сложности
              </div>
            </div>
          </div>
        </div>
        <div className="problems">
          {problems.map((problem, index) => (
            <div key={index} className="problem">
              <div className="problem__theme" style={{ color: problem.color }}>
                <div className="problem__icon">
                  <Image src={problem.icon} alt={problem.theme} width={40} height={40} unoptimized />
                </div>
                {problem.theme}
              </div>
              {problem.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`problem__content ${!isAuthenticated ? 'closed' : ''}`}>
                  <div className="problem__content__star">
                    <Image src={getStarIcon(item.difficulty)} alt={item.difficulty} width={20} height={20} unoptimized />
                  </div>
                  <div className="problem__content__name">{item.name}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Problems;

