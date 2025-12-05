'use client';

import { useState } from 'react';
import { useStripeApiKey } from '@/contexts/StripeContext';
import { validateStripeApiKey } from '@/lib/stripe/actions';
import { useRouter } from 'next/navigation';

export default function SettingsForm() {
  const { apiKey, setApiKey } = useStripeApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    if (!inputValue) {
      setError('API key is required.');
      setIsSaving(false);
      return;
    }

    const { isValid, error } = await validateStripeApiKey(inputValue);

    if (isValid) {
      setApiKey(inputValue);
      router.push('/dashboard');
    } else {
      setError(error || 'Invalid API key.');
    }

    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
          Stripe Secret Key
        </label>
        <input
          type="password"
          id="apiKey"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="sk_test_..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
