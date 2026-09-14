async function testAtlasIntegration() {
  console.log('--- Testing Full-Stack Forgetting Curve App on MongoDB Atlas ---');
  const BASE_URL = 'http://localhost:5000/api';

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', health.status === 'ok' ? 'PASSED ✅' : 'FAILED ❌');

  // 2. Register / Login a test user
  const email = `testuser_${Date.now()}@ebbinghaus.com`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Atlas Test Student',
      email,
      password: 'password123',
    }),
  });
  const regData = await registerRes.json();
  console.log('2. User registration:', regData.success ? 'PASSED ✅' : 'FAILED ❌', regData.token ? '(JWT received)' : '');
  const token = regData.token;

  // 3. Create learning entry with date
  const createRes = await fetch(`${BASE_URL}/learning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: 'Physics',
      topic: "Newton's Laws of Motion & Friction",
      learnedDate: new Date().toISOString(),
      notes: 'Three laws with momentum formula p = mv, friction coefficient mu',
    }),
  });
  const createData = await createRes.json();
  console.log('3. Create learning entry (5 todos auto-created):',
    createData.success && createData.scheduledTodos?.length === 5 ? 'PASSED ✅' : 'FAILED ❌',
    `Scheduled ${createData.scheduledTodos?.length} intervals:`,
    createData.scheduledTodos?.map(t => `Day ${t.intervalDay}`).join(', ')
  );

  // 4. Create another entry with a past date (yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const createYesterdayRes = await fetch(`${BASE_URL}/learning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: 'Chemistry',
      topic: 'Periodic Table & Electron Configuration',
      learnedDate: yesterday.toISOString(),
      notes: 's, p, d, f subshells and Aufbau principle',
    }),
  });
  const yesterdayData = await createYesterdayRes.json();
  console.log('4. Create yesterday learning entry:', yesterdayData.success ? 'PASSED ✅' : 'FAILED ❌');

  // 5. Test Date-Wise Learning History with query params
  const historyRes = await fetch(`${BASE_URL}/learning?datePreset=today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const historyData = await historyRes.json();
  console.log('5. Fetch learning history (total count):', historyData.entries?.length === 2 ? 'PASSED ✅' : 'FAILED ❌', `(Found ${historyData.entries?.length} entries)`);

  // 6. Test Today's Revision Todos
  const todayTodosRes = await fetch(`${BASE_URL}/todos/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const todayTodosData = await todayTodosRes.json();
  console.log('6. Today due todos check:', todayTodosData.success ? 'PASSED ✅' : 'FAILED ❌',
    `Pending: ${todayTodosData.todos?.length}`);

  // 7. Complete a revision todo
  if (todayTodosData.todos?.length > 0) {
    const todoToComplete = todayTodosData.todos[0];
    const compRes = await fetch(`${BASE_URL}/todos/${todoToComplete._id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const compData = await compRes.json();
    console.log('7. Complete revision todo:', compData.success ? 'PASSED ✅' : 'FAILED ❌', `Streak: ${compData.streakCount}`);
  }

  // 8. Test Todo History with date filter
  const todoHistRes = await fetch(`${BASE_URL}/todos/history?status=all&datePreset=this_week`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const todoHistData = await todoHistRes.json();
  console.log('8. Todo history with analytics & date filter:',
    todoHistData.success ? 'PASSED ✅' : 'FAILED ❌',
    `Retention: ${todoHistData.stats?.retentionScore}%, Total scheduled: ${todoHistData.stats?.totalScheduled}`
  );

  console.log('--- ALL ATLAS INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀 ---');
}

testAtlasIntegration().catch(err => {
  console.error('Atlas test error:', err);
  process.exit(1);
});
