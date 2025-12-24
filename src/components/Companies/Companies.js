import React from 'react';
import job1 from '../../assets/img/job1.png';
import job2 from '../../assets/img/job2.png';
import job3 from '../../assets/img/job3.png';
import job4 from '../../assets/img/job4.png';
import job5 from '../../assets/img/job5.png';
import job6 from '../../assets/img/job6.png';
import './Companies.css';

const Companies = () => {
  const companies = [job1, job2, job3, job4, job5, job6];

  return (
    <section className="job">
      <div className="job__title">Изучив наш курс, у вас будет возможность попасть в</div>
      <div className="job__content">
        {companies.map((company, index) => (
          <div key={index} className="job__item">
            <img src={company} alt={`Company ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Companies;
