'use client';

import Image from 'next/image';
import './Companies.css';

const Companies = () => {
  const companies = ['/img/job1.png', '/img/job2.png', '/img/job3.png', '/img/job4.png', '/img/job5.png', '/img/job6.png'];

  return (
    <section className="job">
      <div className="job__title">Изучив наш курс, у вас будет возможность попасть в</div>
      <div className="job__content">
        {companies.map((company, index) => (
          <div key={index} className="job__item">
            <Image src={company} alt={`Company ${index + 1}`} width={150} height={80} unoptimized />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Companies;

