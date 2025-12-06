"use server";

import Stripe from "stripe";

export async function validateStripeApiKey(apiKey: string) {
  if (!apiKey) {
    return { isValid: false, error: "API key is required." };
  }

  try {
    const stripe = new Stripe(apiKey, {
      apiVersion: "2025-11-17.clover",
    });
    await stripe.customers.list({ limit: 1 });
    return { isValid: true, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: "An unknown error occurred." };
  }
}

export async function getProjectedRevenue(apiKey: string) {
  if (!apiKey) {
    throw new Error("A valid Stripe API key is required.");
  }

  const stripe = new Stripe(apiKey, {
    apiVersion: "2025-11-17.clover",
  });

  try {
    const allSubscriptions = await stripe.subscriptions.list({
      status: "active",
      expand: ["data.plan", "data.latest_invoice"],
      limit: 100,
    });

    const upcomingInvoices = allSubscriptions.data
      .filter((sub) => sub.cancel_at_period_end === false);

    console.log(upcomingInvoices);

    const revenueByDate: { [key: string]: number } = {};

    upcomingInvoices.forEach((sub) => {
        const latestInvoice = sub.latest_invoice as Stripe.Invoice;
        const periodStart = latestInvoice.period_start ?? 0;
        const date = new Date(periodStart * 1000);
        date.setMonth(date.getMonth() + 1);
        const dateStr = date.toISOString().split("T")[0];
        if (!revenueByDate[dateStr]) {
          revenueByDate[dateStr] = 0;
        }
        revenueByDate[dateStr] += sub.items.data.reduce((total, item) => {
          return total + (item.price?.unit_amount ?? 0);
        }, 0) / 100;

        // Also add the next invoice
        const nextInvoiceDate = new Date((latestInvoice.period_end ?? 0) * 1000);
        nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
        const nextInvoiceDateStr = nextInvoiceDate.toISOString().split("T")[0];
        if (!revenueByDate[nextInvoiceDateStr]) {
          revenueByDate[nextInvoiceDateStr] = 0;
        }
        revenueByDate[nextInvoiceDateStr] += sub.items.data.reduce((total, item) => {
          return total + (item.price?.unit_amount ?? 0);
        }, 0) / 100;
    });
    
    return { success: true, data: revenueByDate, totalMRR: Object.values(upcomingInvoices).reduce((total, sub) => {
      return total + sub.items.data.reduce((total, item) => {
        return total + (item.price?.unit_amount ?? 0);
      }, 0) / 100;
    }, 0) };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message, data: null };
    }
    return { success: false, error: "An unknown error occurred.", data: null };
  }
}

export async function getChurnMetrics(apiKey: string) {
  if (!apiKey) {
    throw new Error("A valid Stripe API key is required.");
  }

  const stripe = new Stripe(apiKey, {
    apiVersion: "2025-11-17.clover",
  });

  try {
    const stillActiveSubscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    const alreadyChurnedSubscriptions = await stripe.subscriptions.list({
      status: "canceled",
      limit: 100,
    });

    const _stillActiveSubscriptions = [...stillActiveSubscriptions.data].filter((sub) => sub.cancel_at_period_end);

    const churnedSubscriptions = [..._stillActiveSubscriptions, ...alreadyChurnedSubscriptions.data];

    const cancelingUsersCount = _stillActiveSubscriptions.length;
    const mrrAtRisk =
      _stillActiveSubscriptions.reduce((total, sub) => {
        sub.items.data.forEach((item) => {
          if (item.price?.recurring) {
            const interval = item.price.recurring.interval;
            const amount = item.price.unit_amount || 0;
            const quantity = item.quantity || 1;
            if (interval === "month") {
              total += amount * quantity;
            } else if (interval === "year") {
              total += (amount * quantity) / 12;
            }
          }
        });
        return total;
      }, 0) / 100;

    const churnsByDate: { [key: string]: number } = {};
    churnedSubscriptions.forEach((sub: Stripe.Subscription) => {
      const billingCycleAnchor = sub.cancel_at!;
      const date = new Date(billingCycleAnchor * 1000);
      // date.setMonth(date.getMonth() + 1);
      const dateStr = date.toISOString().split("T")[0];
      const costOfChurn = sub.items.data.reduce((total, item) => {
        if (item.price?.recurring) {
          const interval = item.price.recurring.interval;
          const amount = item.price.unit_amount || 0;
          const quantity = item.quantity || 1;
          if (interval === "month") {
            total += amount * quantity;
          } else if (interval === "year") {
            total += (amount * quantity) / 12;
          }
        }
        return total;
      }, 0) / 100;
      if (!churnsByDate[dateStr]) {
        churnsByDate[dateStr] = 0;
      }
      churnsByDate[dateStr] += costOfChurn;
    });

    return {
      success: true,
      data: {
        cancelingUsersCount,
        mrrAtRisk,
        churnsByDate,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message, data: null };
    }
    return { success: false, error: "An unknown error occurred.", data: null };
  }
}
