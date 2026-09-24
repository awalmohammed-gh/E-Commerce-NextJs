import { Checkout } from "@/models/Checkout";
import { Users } from "@/models/User";
import { Product } from "@/models/Product";

/* ------------------------------------------------------------------
   Revenue rules
   An order counts toward revenue when it has been paid and has not
   been cancelled. Each Checkout document is one order, so summing
   totalAmount never double-counts.
------------------------------------------------------------------ */
const REVENUE_MATCH = { payment: true, orderStatus: { $ne: "Cancelled" } };

const REVENUE_EXPR = {
  $and: [{ $eq: ["$payment", true] }, { $ne: ["$orderStatus", "Cancelled"] }],
};

// Ghana is UTC+0 with no daylight saving, so day/month buckets line up with UTC
const TIMEZONE = "Africa/Accra";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHANGE_WINDOW_DAYS = 30;

const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

// No previous data to compare against -> no percentage (never invent one)
function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildChange(current, previous) {
  return {
    current,
    previous,
    percent: percentChange(current, previous),
    windowDays: CHANGE_WINDOW_DAYS,
  };
}

// New documents created in the current vs previous 30-day window
async function countWindows(Model, currentStart, previousStart) {
  const [current, previous] = await Promise.all([
    Model.countDocuments({ createdAt: { $gte: currentStart } }),
    Model.countDocuments({
      createdAt: { $gte: previousStart, $lt: currentStart },
    }),
  ]);
  return { current, previous };
}

/* ------------------------------------------------------------------
   Overview: stats, recent orders, recent users, order statistics
------------------------------------------------------------------ */
export async function getDashboardOverview() {
  const now = Date.now();
  const currentStart = new Date(now - CHANGE_WINDOW_DAYS * DAY_MS);
  const previousStart = new Date(now - 2 * CHANGE_WINDOW_DAYS * DAY_MS);

  const windowTotals = (from, to) => [
    { $match: { createdAt: to ? { $gte: from, $lt: to } : { $gte: from } } },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        revenue: { $sum: { $cond: [REVENUE_EXPR, "$totalAmount", 0] } },
      },
    },
  ];

  const [
    totalUsers,
    totalProducts,
    userWindows,
    productWindows,
    [orderFacet],
    recentOrderDocs,
    recentUserDocs,
  ] = await Promise.all([
    Users.countDocuments(),
    Product.countDocuments(),
    countWindows(Users, currentStart, previousStart),
    countWindows(Product, currentStart, previousStart),

    // One pass over orders for every order-based number
    Checkout.aggregate([
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }],
          revenue: [
            { $match: REVENUE_MATCH },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          current: windowTotals(currentStart),
          previous: windowTotals(previousStart, currentStart),
        },
      },
    ]),

    Checkout.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "user address.fullName totalAmount payment paymentMethod orderStatus createdAt",
      )
      .populate("user", "fullName")
      .lean(),

    Users.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email createdAt")
      .lean(),
  ]);

  const totalOrders = orderFacet.totalOrders[0]?.count || 0;
  const totalRevenue = orderFacet.revenue[0]?.total || 0;
  const currentOrders = orderFacet.current[0] || { orders: 0, revenue: 0 };
  const previousOrders = orderFacet.previous[0] || { orders: 0, revenue: 0 };

  const orderStatistics = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status.toLowerCase(), 0]),
  );
  for (const { _id, count } of orderFacet.byStatus) {
    const key = String(_id || "").toLowerCase();
    if (key in orderStatistics) orderStatistics[key] = count;
  }

  const recentOrders = recentOrderDocs.map((order) => ({
    _id: String(order._id),
    customerName: order.address?.fullName || order.user?.fullName || null,
    totalAmount: order.totalAmount || 0,
    isPaid: Boolean(order.payment),
    paymentMethod: order.paymentMethod,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  }));

  // Everyone in the Users collection is a customer; admins sign in separately
  const recentUsers = recentUserDocs.map((user) => ({
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: "Customer",
    createdAt: user.createdAt,
  }));

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
    },
    changes: {
      users: buildChange(userWindows.current, userWindows.previous),
      orders: buildChange(currentOrders.orders, previousOrders.orders),
      products: buildChange(productWindows.current, productWindows.previous),
      revenue: buildChange(currentOrders.revenue, previousOrders.revenue),
    },
    recentOrders,
    recentUsers,
    orderStatistics,
  };
}

/* ------------------------------------------------------------------
   Revenue series for the chart
------------------------------------------------------------------ */
export const REVENUE_PERIODS = {
  "7d": { unit: "day", count: 7 },
  "30d": { unit: "day", count: 30 },
  "12m": { unit: "month", count: 12 },
};

function buildBuckets(unit, count) {
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();

  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;

    if (unit === "month") {
      const date = new Date(Date.UTC(y, m - offset, 1));
      return {
        date,
        key: date.toISOString().slice(0, 7), // YYYY-MM
        label: date.toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
      };
    }

    const date = new Date(Date.UTC(y, m, d - offset));
    return {
      date,
      key: date.toISOString().slice(0, 10), // YYYY-MM-DD
      label: date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
    };
  });
}

export async function getRevenueSeries(period) {
  const { unit, count } = REVENUE_PERIODS[period];
  const buckets = buildBuckets(unit, count);

  const rows = await Checkout.aggregate([
    {
      $match: {
        ...REVENUE_MATCH,
        createdAt: { $gte: buckets[0].date },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            format: unit === "month" ? "%Y-%m" : "%Y-%m-%d",
            timezone: TIMEZONE,
          },
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
  ]);

  const byKey = new Map(rows.map((row) => [row._id, row]));

  // Fill empty days/months with 0 so the chart has a continuous axis
  const points = buckets.map(({ key, label }) => ({
    key,
    label,
    revenue: byKey.get(key)?.revenue || 0,
    orders: byKey.get(key)?.orders || 0,
  }));

  return {
    period,
    unit,
    points,
    totalRevenue: points.reduce((sum, p) => sum + p.revenue, 0),
    totalOrders: points.reduce((sum, p) => sum + p.orders, 0),
  };
}
