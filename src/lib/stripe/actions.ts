'use server';

import Stripe from 'stripe';

export async function validateStripeApiKey(apiKey: string) {
  if (!apiKey) {
    return { isValid: false, error: 'API key is required.' };
  }

  try {
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
    await stripe.customers.list({ limit: 1 });
    return { isValid: true, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
        return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'An unknown error occurred.' };
  }
}

export async function getProjectedRevenue(apiKey: string) {
    if (!apiKey) {
        throw new Error('A valid Stripe API key is required.');
    }

    const stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16',
    });

    try {
        const upcomingInvoices = await stripe.invoices.list({
            status: 'open',
            due_date: {
              gte: Math.floor(Date.now() / 1000),
              lt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            },
            limit: 100,
        });

        const revenueByDate: { [key: string]: number } = {};

        upcomingInvoices.data.forEach(invoice => {
            if (invoice.due_date) {
                const date = new Date(invoice.due_date * 1000).toISOString().split('T')[0];
                if (!revenueByDate[date]) {
                    revenueByDate[date] = 0;
                }
                revenueByDate[date] += invoice.total / 100;
            }
        });

        return { success: true, data: revenueByDate };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
}

export async function getChurnMetrics(apiKey: string) {
    if (!apiKey) {
        throw new Error('A valid Stripe API key is required.');
    }

    const stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16',
    });

    try {
        const subscriptions = await stripe.subscriptions.list({
            status: 'active',
            cancel_at_period_end: true,
            limit: 100,
        });

        const cancelingUsersCount = subscriptions.data.length;
        const mrrAtRisk = subscriptions.data.reduce((total, sub) => {
            sub.items.data.forEach(item => {
                if (item.price?.recurring) {
                    const interval = item.price.recurring.interval;
                    const amount = item.price.unit_amount || 0;
                    const quantity = item.quantity || 1;
                    if (interval === 'month') {
                        total += amount * quantity;
                    } else if (interval === 'year') {
                        total += (amount * quantity) / 12;
                    }
                }
            });
            return total;
        }, 0) / 100;

        return {
            success: true,
            data: {
                cancelingUsersCount,
                mrrAtRisk,
            }
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
}
