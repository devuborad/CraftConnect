async function test() {
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Radha Ben Vankar',
      email: 'radha.test@craftconnect.ai',
      phone: '+919876543299',
      password: 'password123',
      role: 'artisan',
      businessName: 'Radha Handloom Creations',
      craftType: 'Patola Double Ikkat',
      experienceYears: 15,
      location: 'Patan, Gujarat'
    })
  });
  const data = await res.json();
  console.log('Register API Response:', JSON.stringify(data, null, 2));
}

test();
