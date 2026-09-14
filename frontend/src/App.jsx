import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { DrawerMenu } from './components/DrawerMenu';
import { AddLearningModal } from './components/AddLearningModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { BottomNav } from './components/BottomNav';

import { HomeView } from './views/HomeView';
import { LearningHistoryView } from './views/LearningHistoryView';
import { TodoHistoryView } from './views/TodoHistoryView';
import { ProfileView } from './views/ProfileView';

import { api } from './services/api';

function AppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [currentView, setCurrentView] = useState('home'); // 'home', 'learning', 'history', 'profile'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(typeof window !== 'undefined' ? window.innerWidth > 640 : true);

  // Data states
  const [todayData, setTodayData] = useState({ todos: [], completedToday: [], streakCount: 0 });
  const [learningEntries, setLearningEntries] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch today's revision todos and learning history
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingData(true);
      const [todayRes, learnRes] = await Promise.all([
        api.getTodayTodos(),
        api.getLearningHistory(),
      ]);

      if (todayRes.success) {
        setTodayData(todayRes);
      }
      if (learnRes.success) {
        setLearningEntries(learnRes.entries || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Mark todo complete
  const handleCompleteTodo = async (todoId) => {
    try {
      const res = await api.completeTodo(todoId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to complete todo:', err);
    }
  };

  // Uncomplete todo
  const handleUncompleteTodo = async (todoId) => {
    try {
      const res = await api.uncompleteTodo(todoId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to uncomplete todo:', err);
    }
  };

  return (
    <div className="app-wrapper">
      <div className={`device-frame ${isWideMode ? 'wide-mode' : ''}`}>
        {/* Top Navigation Bar */}
        <Navbar
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenProfile={() => {
            if (isAuthenticated) {
              setCurrentView('profile');
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          isWideMode={isWideMode}
          onToggleWideMode={() => setIsWideMode(!isWideMode)}
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
        />

        {/* Not authenticated banner / prompt */}
        {!isAuthenticated && !authLoading && (
          <div
            style={{
              margin: 16,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
              border: '1px solid var(--border-focus)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🧠 RetainCurve</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>
              Never Forget What You Study
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              Sign in or test instant demo mode to save your 1-3-7-14-30 forgetting curve revisions to MongoDB.
            </p>
            <button
              id="open-auth-modal-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
              style={{ maxWidth: 220, margin: '0 auto' }}
            >
              Sign In / Try Demo
            </button>
          </div>
        )}

        {/* View Switcher Router */}
        {currentView === 'home' && (
          <HomeView
            todayData={todayData}
            learningEntries={learningEntries}
            onCompleteTodo={handleCompleteTodo}
            onUncompleteTodo={handleUncompleteTodo}
            onOpenAddModal={() => {
              if (!isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                setIsAddModalOpen(true);
              }
            }}
            onSelectLearningEntry={(entry) => setCurrentView('learning')}
          />
        )}

        {currentView === 'learning' && (
          <LearningHistoryView
            entries={learningEntries}
            onRefresh={loadData}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onCompleteTodo={handleCompleteTodo}
            onUncompleteTodo={handleUncompleteTodo}
          />
        )}

        {currentView === 'history' && (
          <TodoHistoryView onTodoChanged={loadData} />
        )}

        {currentView === 'profile' && (
          <ProfileView />
        )}

        {/* Bottom Navigation Bar (Mobile / Compact View) */}
        <BottomNav
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          onOpenAddModal={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
            } else {
              setIsAddModalOpen(true);
            }
          }}
        />

        {/* Hamburger Drawer Menu */}
        <DrawerMenu
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentView={currentView}
          onSelectView={(viewId) => {
            if (viewId === 'notifications') {
              setIsNotificationModalOpen(true);
            } else {
              setCurrentView(viewId);
            }
          }}
        />

        {/* Add Learning Modal ("Aaj kya padha" 1-3-7-14-30 auto-scheduler) */}
        <AddLearningModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />

        {/* Notification Center Modal */}
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
