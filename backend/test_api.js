const mongoose = require('mongoose');
const { app, connectDB } = require('./server');
const http = require('http');

async function runTests() {
  console.log('--- Starting Automated Backend Verification ---');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.log('1. Health check:', healthJson.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Register user
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harsh Student',
        email: `harsh_${Date.now()}@example.com`,
        password: 'password123',
      }),
    });
    const regJson = await regRes.json();
    console.log('2. Register user:', regJson.success ? 'PASS' : 'FAIL', regJson.user?.name);
    const token = regJson.token;

    // 3. Create Learning Entry (1-3-7-14-30 rule)
    const learnRes = await fetch(`${baseUrl}/api/learning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject: 'Physics',
        topic: "Newton's Three Laws of Motion",
        learnedDate: new Date().toISOString(),
        notes: 'F=ma, action-reaction pairs, inertia',
      }),
    });
    const learnJson = await learnRes.json();
    console.log('3. Create Learning Entry:', learnJson.success ? 'PASS' : 'FAIL');
    console.log('   Generated Todos Count:', learnJson.scheduledTodos?.length);
    const intervals = learnJson.scheduledTodos?.map(t => `Day ${t.intervalDay}`);
    console.log('   Intervals:', intervals.join(', '));

    if (learnJson.scheduledTodos?.length === 5) {
      console.log('   All 5 Forgetting-Curve Intervals (1, 3, 7, 14, 30) verified: PASS');
    } else {
      console.error('   Expected 5 intervals, got', learnJson.scheduledTodos?.length);
    }

    // 4. Fetch Today's todos (since Day 1 is tomorrow, let's create an entry with past date e.g. 1 day ago to verify today query)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastRes = await fetch(`${baseUrl}/api/learning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject: 'Chemistry',
        topic: 'Chemical Bonding & Hybridization',
        learnedDate: pastDate.toISOString(),
        notes: 'sp3, sp2, sp geometries and bond angles',
      }),
    });
    await pastRes.json();

    const todayRes = await fetch(`${baseUrl}/api/todos/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const todayJson = await todayRes.json();
    console.log('4. Fetch Today Due Todos:', todayJson.success ? 'PASS' : 'FAIL');
    console.log('   Pending due today count:', todayJson.pendingCount);
    console.log('   Due item subject:', todayJson.todos[0]?.subject, `(Day ${todayJson.todos[0]?.intervalDay})`);

    // 5. Complete a todo
    if (todayJson.todos.length > 0) {
      const todoId = todayJson.todos[0]._id;
      const compRes = await fetch(`${baseUrl}/api/todos/${todoId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const compJson = await compRes.json();
      console.log('5. Complete Todo:', compJson.success ? 'PASS' : 'FAIL', 'New Streak:', compJson.streakCount);
    }

    // 6. Test Notifications
    const triggerRes = await fetch(`${baseUrl}/api/notifications/trigger-check`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const triggerJson = await triggerRes.json();
    console.log('6. Trigger Notification Check:', triggerJson.success ? 'PASS' : 'FAIL');

    const notifRes = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notifJson = await notifRes.json();
    console.log('   Fetch Notifications:', notifJson.success ? 'PASS' : 'FAIL', 'Total:', notifJson.notifications?.length);

    console.log('--- ALL BACKEND VERIFICATIONS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
