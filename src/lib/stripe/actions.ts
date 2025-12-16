"use server";

import Stripe from "stripe";
import { RevenueData } from "./types";

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
function convertPlanIdToPlanName(planId: string) {
  switch (planId) {
    case "price_1R9cJGGDhfLOWXTQqXLlQkyG":
      return "Starter";
    case "price_1R9cJDGDhfLOWXTQElWLjrX4":
      return "Pro";
    case "price_1R9cJBGDhfLOWXTQmmvq7Wtc":
      return "Enterprise";
    default:
      return "Unknown";
  }
}

export async function getProjectedRevenue(apiKey: string): Promise<{ success: boolean; error: string | null; } & RevenueData> {
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

    console.log(upcomingInvoices.filter((sub) => sub.items.data[0].plan.id !== "price_1R9cJGGDhfLOWXTQqXLlQkyG"));

    const revenueByDate: { [key: string]: number } = {};
    const planBreakdown: { [planName: string]: number } = {};

    upcomingInvoices.forEach((sub) => {
        const periodStart = sub.billing_cycle_anchor;
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
        const nextInvoiceDate = new Date((sub.billing_cycle_anchor) * 1000);
        nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
        const nextInvoiceDateStr = nextInvoiceDate.toISOString().split("T")[0];
        if (!revenueByDate[nextInvoiceDateStr]) {
          revenueByDate[nextInvoiceDateStr] = 0;
        }
        revenueByDate[nextInvoiceDateStr] += sub.items.data.reduce((total, item) => {
          return total + (item.price?.unit_amount ?? 0);
        }, 0) / 100;

        // Add to plan breakdown
        sub.items.data.forEach((item) => {
          const planName = convertPlanIdToPlanName(item.plan.id);
          if (!planBreakdown[planName]) {
            planBreakdown[planName] = 0;
          }
          planBreakdown[planName] += (item.price?.unit_amount ?? 0) / 100;
        });
    });

    // sort planBreakdowns Starter -> Pro -> Enterprise and drop "Unknown"s
    const sortedPlanBreakdown = Object.entries(planBreakdown).sort((a, b) => {
      if (a[0] === "Starter") return -1;
      if (b[0] === "Starter") return 1;
      if (a[0] === "Pro") return -1;
      if (b[0] === "Pro") return 1;
      if (a[0] === "Enterprise") return -1;
      if (b[0] === "Enterprise") return 1;
      return 0;
    }).reduce((acc, [planName, amount]) => {
      acc[planName] = amount;
      return acc;
    }, {} as { [planName: string]: number });

    // Delete "unknown" from sortedPlanBreakdown
    delete sortedPlanBreakdown["Unknown"];

    // Calculate unique users
    const uniqueUsers = new Set();
    upcomingInvoices.forEach((sub) => {
      uniqueUsers.add(sub.customer);
    });
    const uniqueUsersCount = uniqueUsers.size;

    return { success: true, error: null, data: revenueByDate, uniqueUsersCount, totalMRR: Object.values(upcomingInvoices).reduce((total, sub) => {
      return total + sub.items.data.reduce((total, item) => {
        return total + (item.price?.unit_amount ?? 0);
      }, 0) / 100;
    }, 0), planBreakdown: sortedPlanBreakdown };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message, data: {}, uniqueUsersCount: 0, totalMRR: 0, planBreakdown: {} };
    }
    return { success: false, error: "An unknown error occurred.", data: {}, uniqueUsersCount: 0, totalMRR: 0, planBreakdown: {} };
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
    const planBreakdown: { [planName: string]: number } = {};
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

      // Add to plan breakdown if date is in the future
      if (dateStr > new Date().toISOString().split("T")[0]) {
        const planId = sub.items.data[0].plan.id;
        const planName = convertPlanIdToPlanName(planId);
        if (!planBreakdown[planName]) {
          planBreakdown[planName] = 0;
        }
        planBreakdown[planName] += costOfChurn;
      }
    });

    // sort plans Starter -> Pro -> Enterprise and drop "Unknown"s
    const sortedPlanBreakdown = Object.entries(planBreakdown).sort((a, b) => {
      if (a[0] === "Starter") return -1;
      if (b[0] === "Starter") return 1;
      if (a[0] === "Pro") return -1;
      if (b[0] === "Pro") return 1;
      if (a[0] === "Enterprise") return -1;
      if (b[0] === "Enterprise") return 1;
      return 0;
    }).reduce((acc, [planName, amount]) => {
      acc[planName] = amount;
      return acc;
    }, {} as { [planName: string]: number });
    // Delete "unknown" from sortedPlanBreakdown
    delete sortedPlanBreakdown["Unknown"];

    return {
      success: true,
      data: {
        cancelingUsersCount,
        mrrAtRisk,
        churnsByDate,
        planBreakdown: sortedPlanBreakdown,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message, data: null };
    }
    return { success: false, error: "An unknown error occurred.", data: null };
  }
}
