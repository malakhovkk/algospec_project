import React from 'react';
import girlImage from '../../assets/img/girl.png';
import './Hero.css';

const Hero = () => {
  const join = () => {
    const joinSection = document.getElementById('join');
      if (joinSection) {
        joinSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  return (
    <section className="one_step">
      <div className="one_step__left">
        <p className="one_step__first">Остался один шаг на пути к мечте.</p>
        <p className="one_step__second">Отточите навыки программирования перед важным интервью.</p>
        <div className="one_step__join">
          <a className="one_step__caption" onClick={join}>Присоединиться</a>
        </div>
      </div>
      <div className="one_step__right">
        <img className="one_step__girl" src={girlImage} alt="Girl" />
      </div>
    </section>
  );
};

export default Hero;

