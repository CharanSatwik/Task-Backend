const app = require('./app');
const taskModel = require('./models/taskModel');

async function runTests() {
  taskModel.reset();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/tasks`;
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` PASS: ${message}`);
      passed++;
    } else {
      console.error(` FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. GET /api/tasks initially empty
    let res = await fetch(baseUrl);
    let data = await res.json();
    assert(res.status === 200 && Array.isArray(data) && data.length === 0, 'GET /api/tasks returns empty array initially');

    // 2. POST /api/tasks without body or non-object -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(['array', 'not', 'object'])
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('valid JSON object'), 'POST /api/tasks with array body returns 400');

    // 3. POST /api/tasks with client-supplied id or created_at -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Task', id: 50 })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('auto-generated'), 'POST /api/tasks with client id returns 400');

    // 4. POST /api/tasks without title -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'No title provided' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Title is required'), 'POST /api/tasks with missing title returns 400');

    // 5. POST /api/tasks with empty or whitespace-only title -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('non-empty string'), 'POST /api/tasks with empty title returns 400');

    // 6. POST /api/tasks with non-string description -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Valid title', description: 12345 })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Description must be a string'), 'POST /api/tasks with non-string description returns 400');

    // 7. POST /api/tasks with invalid status -> 400
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Task 1', status: 'archived' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Status must be one of'), 'POST /api/tasks with invalid status returns 400');

    // 8. POST /api/tasks with invalid Content-Type -> 415
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'plain text'
    });
    assert(res.status === 415, 'POST /api/tasks with text/plain Content-Type returns 415');

    // 9. POST /api/tasks valid with default status -> 201
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy groceries', description: 'Milk and eggs' })
    });
    data = await res.json();
    assert(
      res.status === 201 &&
      data.id === 1 &&
      data.title === 'Buy groceries' &&
      data.description === 'Milk and eggs' &&
      data.status === 'pending' &&
      Boolean(data.created_at),
      'POST /api/tasks creates task with default status "pending" and created_at timestamp'
    );
    const task1Id = data.id;

    // 10. POST /api/tasks with explicit valid status -> 201
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Write unit tests', status: 'in-progress' })
    });
    data = await res.json();
    assert(res.status === 201 && data.id === 2 && data.status === 'in-progress', 'POST /api/tasks creates task with explicit status');

    // 11. GET /api/tasks returns all tasks
    res = await fetch(baseUrl);
    data = await res.json();
    assert(res.status === 200 && data.length === 2, 'GET /api/tasks returns all tasks');

    // 12. GET /api/tasks?status=in-progress filters tasks
    res = await fetch(`${baseUrl}?status=in-progress`);
    data = await res.json();
    assert(res.status === 200 && data.length === 1 && data[0].status === 'in-progress', 'GET /api/tasks?status=in-progress returns filtered tasks');

    // 13. GET /api/tasks?status=invalid -> 400
    res = await fetch(`${baseUrl}?status=invalid-status`);
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Invalid status query parameter'), 'GET /api/tasks?status=invalid returns 400');

    // 14. GET /api/tasks/:id with invalid ID format (non-integer) -> 400
    res = await fetch(`${baseUrl}/abc`);
    data = await res.json();
    assert(res.status === 400 && data.error.includes('positive integer'), 'GET /api/tasks/:id with non-numeric ID returns 400');

    // 15. GET /api/tasks/:id with invalid ID format (negative integer) -> 400
    res = await fetch(`${baseUrl}/-5`);
    data = await res.json();
    assert(res.status === 400 && data.error.includes('positive integer'), 'GET /api/tasks/:id with negative ID returns 400');

    // 16. GET /api/tasks/:id with non-existent numeric ID -> 404
    res = await fetch(`${baseUrl}/999`);
    data = await res.json();
    assert(res.status === 404 && data.error.includes('not found'), 'GET /api/tasks/:id with non-existent ID returns 404');

    // 17. GET /api/tasks/:id with valid ID -> 200
    res = await fetch(`${baseUrl}/${task1Id}`);
    data = await res.json();
    assert(res.status === 200 && data.id === task1Id && data.title === 'Buy groceries', 'GET /api/tasks/:id returns single task');

    // 18. PUT /api/tasks/:id with invalid ID -> 400
    res = await fetch(`${baseUrl}/xyz`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('positive integer'), 'PUT /api/tasks/:id with invalid ID returns 400');

    // 19. PUT /api/tasks/:id with immutable fields (id/created_at) -> 400
    res = await fetch(`${baseUrl}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 99 })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('immutable'), 'PUT /api/tasks/:id with immutable field returns 400');

    // 20. PUT /api/tasks/:id with empty body -> 400
    res = await fetch(`${baseUrl}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('At least one field'), 'PUT /api/tasks/:id with empty body returns 400');

    // 21. PUT /api/tasks/:id with empty title -> 400
    res = await fetch(`${baseUrl}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Title must be a non-empty string'), 'PUT /api/tasks/:id with empty title returns 400');

    // 22. PUT /api/tasks/:id with invalid status -> 400
    res = await fetch(`${baseUrl}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'not-a-valid-status' })
    });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('Status must be one of'), 'PUT /api/tasks/:id with invalid status returns 400');

    // 23. PUT /api/tasks/:id with non-existent ID -> 404
    res = await fetch(`${baseUrl}/999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    data = await res.json();
    assert(res.status === 404 && data.error.includes('not found'), 'PUT /api/tasks/:id with non-existent ID returns 404');

    // 24. PUT /api/tasks/:id valid update -> 200
    res = await fetch(`${baseUrl}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', description: 'Bought eggs and milk' })
    });
    data = await res.json();
    assert(
      res.status === 200 &&
      data.status === 'completed' &&
      data.description === 'Bought eggs and milk' &&
      data.title === 'Buy groceries',
      'PUT /api/tasks/:id successfully updates task fields'
    );

    // 25. DELETE /api/tasks/:id with invalid ID format -> 400
    res = await fetch(`${baseUrl}/invalid-id`, { method: 'DELETE' });
    data = await res.json();
    assert(res.status === 400 && data.error.includes('positive integer'), 'DELETE /api/tasks/:id with invalid ID format returns 400');

    // 26. DELETE /api/tasks/:id with non-existent ID -> 404
    res = await fetch(`${baseUrl}/999`, { method: 'DELETE' });
    data = await res.json();
    assert(res.status === 404 && data.error.includes('not found'), 'DELETE /api/tasks/:id with non-existent ID returns 404');

    // 27. DELETE /api/tasks/:id with valid ID -> 200
    res = await fetch(`${baseUrl}/${task1Id}`, { method: 'DELETE' });
    data = await res.json();
    assert(res.status === 200 && data.task.id === task1Id, 'DELETE /api/tasks/:id successfully deletes task');

    // 28. Verify task deleted -> 404
    res = await fetch(`${baseUrl}/${task1Id}`);
    assert(res.status === 404, 'GET /api/tasks/:id on deleted task returns 404');

    // 29. 404 on unhandled route
    res = await fetch(`http://localhost:${port}/non-existent-route`);
    data = await res.json();
    assert(res.status === 404 && data.error.includes('Route not found'), 'Unknown route returns 404 JSON response');

    console.log(`\nAll tests completed: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
  }
}

runTests();
