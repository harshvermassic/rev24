import React from 'react';
import { CheckCircle2, BookOpen } from 'lucide-react';

export const ViewToggle = ({ activeTab, onChangeTab, todoCount = 0, learnedCount = 0 }) => {
  return (
    <div className="view-toggle-container">
      <div className="view-toggle-box">
        <button
          id="toggle-todos-tab-btn"
          className={`view-toggle-btn ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => onChangeTab('todos')}
        >
          <CheckCircle2 size={16} />
          <span>Revision ToDo</span>
          {todoCount > 0 && <span className="badge-count">{todoCount}</span>}
        </button>

        <button
          id="toggle-learning-tab-btn"
          className={`view-toggle-btn ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => onChangeTab('learning')}
        >
          <BookOpen size={16} />
          <span>Aaj Kya Padha</span>
          {learnedCount > 0 && <span className="badge-count">{learnedCount}</span>}
        </button>
      </div>
    </div>
  );
};
