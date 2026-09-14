import React from 'react';
import { Home, BookOpen, Plus, Award, User } from 'lucide-react';

export const BottomNav = ({ currentView, onSelectView, onOpenAddModal }) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      <button
        id="bottom-nav-home"
        className={`bottom-nav-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => onSelectView('home')}
        title="Today's Tasks"
      >
        <Home size={20} />
        <span>Today</span>
      </button>

      <button
        id="bottom-nav-learning"
        className={`bottom-nav-item ${currentView === 'learning' ? 'active' : ''}`}
        onClick={() => onSelectView('learning')}
        title="Learning History"
      >
        <BookOpen size={20} />
        <span>History</span>
      </button>

      {/* Floating Center Action Button (+) */}
      <button
        id="bottom-nav-add"
        className="bottom-nav-fab"
        onClick={onOpenAddModal}
        title="Log Today's Study"
        aria-label="Log Today's Study"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <button
        id="bottom-nav-history"
        className={`bottom-nav-item ${currentView === 'history' ? 'active' : ''}`}
        onClick={() => onSelectView('history')}
        title="Retention & Stats"
      >
        <Award size={20} />
        <span>Stats</span>
      </button>

      <button
        id="bottom-nav-profile"
        className={`bottom-nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectView('profile')}
        title="Profile & Settings"
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
