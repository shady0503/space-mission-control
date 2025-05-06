'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/auth/login');
    } else {
      const msg = await res.text();
      setError(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24">
      <h1 className="text-2xl font-bold">Create an Account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="text" placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 border rounded" />
        <input type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-2 border rounded" />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}
