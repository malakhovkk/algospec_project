'use client';

import Image from 'next/image';
import './Hero.css';

const Hero = () => {
  const handleJoin = (e) => {
    e.preventDefault();
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
          <a className="one_step__caption" href="#join" onClick={handleJoin}>Присоединиться</a>
        </div>
      </div>
      <div className="one_step__right">
        <Image className="one_step__girl" src="/img/girl.png" alt="Girl" width={500} height={500} unoptimized />
      </div>
    </section>
  );
};

export default Hero;

