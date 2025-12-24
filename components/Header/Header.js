'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout, previousPath, updatePreviousPath } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    // Перенаправляем на главную страницу после выхода
    // if (pathname === '/problems' || pathname === '/profile') {
    //   router.push('/');
    // }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePurchaseClick = (e) => {
    e.preventDefault();
    if (pathname === '/') {
      const joinSection = document.getElementById('join');
      if (joinSection) {
        joinSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push('/#join');
      setTimeout(() => {
        const joinSection = document.getElementById('join');
        if (joinSection) {
          joinSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <header className="algospec">
      <div className="algospec__logo">
        <Link href="/">
          <Image className="algospec__img" src="/img/logo.png" alt="AlgoSpec Logo" width={150} height={50} unoptimized />
        </Link>
      </div>
      <ul className="navigation">
        <li className="navigation__item">
          <Link href="/">Что такое AlgoSpec?</Link>
        </li>
        <li className="navigation__item">
          <Link href="/problems">Содержание</Link>
        </li>
        <li className="navigation__item">
          <a href="#join" onClick={handlePurchaseClick}>Покупка</a>
        </li>
        {isAuthenticated ? (
          <li className="navigation__item navigation__user-wrapper" ref={menuRef}>
            <div className="navigation__user-container" onClick={toggleMenu}>
              <svg 
                className="navigation__user-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="navigation__user">{user?.name || user?.email}</span>
            </div>
            {isMenuOpen && (
              <div className="navigation__dropdown">
                <div className="navigation__dropdown-item">
                  <span className="navigation__dropdown-email">{user?.email}</span>
                  {user?.name && (
                    <span className="navigation__dropdown-name">{user?.name}</span>
                  )}
                </div>
                <div className="navigation__dropdown-divider"></div>
                <Link 
                  href="/profile" 
                  className="navigation__dropdown-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg 
                    className="navigation__dropdown-link-icon" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Редактировать профиль
                </Link>
                <div className="navigation__dropdown-divider"></div>
                <button className="navigation__dropdown-logout" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            )}
          </li>
        ) : (
          <li className="navigation__item">
            <Link href="/login">Войти</Link>
          </li>
        )}
      </ul>
    </header>
  );
};

export default Header;

