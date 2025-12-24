'use client';

import './Pricing.css';

const Pricing = () => {
  const features = [
    '100 разобранных задач',
    'Полноценный видео-разбор',
    'Курс на 4 языках программирования',
    'Сложность алгоритма и ресурсозатратность'
  ];

  return (
    <section className="join" id="join">
      <div className="join__title">Присоединиться</div>
      <div className="join__content">
        <div className="join__block">
          <div className="join__title2">На полгода</div>
          <ul className="join__desc">
            {features.map((feature, index) => (
              <li key={index} className="join__desc__item">
                {feature}
              </li>
            ))}
          </ul>
          <div className="join__lr">
            <div className="join__price">1 500₽</div>
            <div className="join__purchase">Приобрести</div>
          </div>
        </div>
        <div className="join__block">
          <div className="join__title2">На год</div>
          <ul className="join__desc">
            {features.map((feature, index) => (
              <li key={index} className="join__desc__item">
                {feature}
              </li>
            ))}
          </ul>
          <div className="join__lr">
            <div className="join__price">2 200₽</div>
            <div className="join__purchase">Приобрести</div>
          </div>
        </div>
      </div>
      <div className="join__alert">
        Курсы отличаются только длительностью доступа.
      </div>
    </section>
  );
};

export default Pricing;

