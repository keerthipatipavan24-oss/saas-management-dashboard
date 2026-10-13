import { useState, useEffect } from "react";
import "./Dashboard.css";

const initialUsers = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
];

const initialSubscriptions = [
  { status: "Active", amount: 999, date: "2026-10-01", plan: "Pro" },
  { status: "Trial", amount: 299, date: "2026-10-05", plan: "Basic" },
  { status: "Active", amount: 19999, date: "2026-09-25", plan: "Premium" },
  { status: "Cancelled", amount: 299, date: "2026-08-20", plan: "Basic" },
  { status: "Active", amount: 999, date: "2026-10-03", plan: "Pro" },
  { status: "Expired", amount: 1999, date: "2026-09-15", plan: "Premium" },
  { status: "Active", amount: 299, date: "2026-10-02", plan: "Basic" },
  { status: "Trial", amount: 999, date: "2026-10-06", plan: "Pro" },
  { status: "Active", amount: 19999, date: "2026-09-30", plan: "Premium" },
  { status: "Cancelled", amount: 299, date: "2026-07-18", plan: "Basic" },
];

const getSavedData = (key, fallback) => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallback;
  } catch {
    return fallback;
  }
};

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function Dashboard() {
  const [plans, setPlans] = useState(() =>
    getSavedData("plans", [
      { id: "PL1001" },
      { id: "PL1002" },
      { id: "PL1003" },
    ]),
  );

  const [customers, setCustomers] = useState(() =>
    getSavedData("customers", [
      { revenue: 999 },
      { revenue: 299 },
      { revenue: 299 },
      { revenue: 19999 },
      { revenue: 19999 },
    ]),
  );

  useEffect(() => {
    const updateData = () => {
      setPlans(
        getSavedData("plans", [
          { id: "PL1001" },
          { id: "PL1002" },
          { id: "PL1003" },
        ]),
      );

      setCustomers(
        getSavedData("customers", [
          { revenue: 999 },
          { revenue: 299 },
          { revenue: 299 },
          { revenue: 19999 },
          { revenue: 19999 },
        ]),
      );
    };

    window.addEventListener("storage", updateData);

    return () => {
      window.removeEventListener("storage", updateData);
    };
  }, []);

  const users = initialUsers;
  const subscriptions = initialSubscriptions;

  const totalUsers = users.length;
  const totalPlans = plans.length;
  const totalCustomers = customers.length;

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Active",
  ).length;

  const trialSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Trial",
  ).length;

  const cancelledSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Cancelled",
  ).length;

  const expiredSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Expired",
  ).length;

  // Value of active subscriptions only.
  const activeSubscriptionValue = subscriptions
    .filter((subscription) => subscription.status === "Active")
    .reduce(
      (total, subscription) => total + Number(subscription.amount || 0),
      0,
    );

  const subscriptionStatuses = [
    {
      label: "Active",
      count: activeSubscriptions,
      className: "active",
    },
    {
      label: "Trial",
      count: trialSubscriptions,
      className: "trial",
    },
    {
      label: "Cancelled",
      count: cancelledSubscriptions,
      className: "cancelled",
    },
    {
      label: "Expired",
      count: expiredSubscriptions,
      className: "expired",
    },
  ];

  const maxSubscriptions = Math.max(
    ...subscriptionStatuses.map((item) => item.count),
    1,
  );

  // Section 3: Revenue Analytics
  const monthlyRevenue = ["Jul", "Aug", "Sep", "Oct"].map((month) => {
    const monthNumber = {
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
    }[month];

    const revenue = subscriptions
      .filter(
        (subscription) =>
          subscription.status === "Active" &&
          subscription.date?.startsWith(`2026-${monthNumber}`),
      )
      .reduce(
        (total, subscription) => total + Number(subscription.amount || 0),
        0,
      );

    return { month, revenue };
  });

  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1);

  const planDistribution = ["Basic", "Pro", "Premium"].map((plan) => {
    const count = subscriptions.filter(
      (subscription) =>
        subscription.plan === plan &&
        ["Active", "Trial"].includes(subscription.status),
    ).length;

    return { plan, count };
  });

  const maxPlanCount = Math.max(
    ...planDistribution.map((item) => item.count),
    1,
  );

  return (
    <main className="dashboard-page">
      {/* Welcome section */}
      <section className="dashboard-welcome">
        <div className="dashboard-header">
          <h2>Welcome back, Pavan</h2>
          <p>Here's your SaaS management overview.</p>
        </div>
      </section>

      {/* Section 1: Summary cards */}
      <section className="dashboard-summary">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p>Total Users</p>
              <h2>{totalUsers}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <p>Active Subscriptions</p>
              <h2>{activeSubscriptions}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <p>Total Plans</p>
              <h2>{totalPlans}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <p>Total Customers</p>
              <h2>{totalCustomers}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p>Active Subscription Value</p>
              <h2>{formatCurrency(activeSubscriptionValue)}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Subscription Status */}
      <section className="subscription-analytics">
        <div className="section-heading">
          <h2>Subscription Analytics</h2>
          <p>Overview of current subscription status.</p>
        </div>

        <div className="subscription-content">
          <div className="subscription-status-chart-card">
            <h3>Subscription Status</h3>

            <div className="subscription-chart">
              {subscriptionStatuses.map((item) => (
                <div className="subscription-row" key={item.label}>
                  <div className="subscription-label">
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>

                  <div className="subscription-bar">
                    <div
                      className={`subscription-bar-fill ${item.className}`}
                      style={{
                        width: `${(item.count / maxSubscriptions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Revenue Analytics */}

      <section className="revenue-analytics-section">
        <div className="revenue-analytics-card">
          <div className="revenue-analytics-header">
            <h2>Revenue Analytics</h2>
            <p>Active subscription value by month</p>
          </div>

          <div className="revenue-analytics-chart">
            {monthlyRevenue.map((item) => (
              <div className="revenue-analytics-column" key={item.month}>
                <span className="revenue-analytics-amount">
                  {formatCurrency(item.revenue)}
                </span>

                <div className="revenue-analytics-track">
                  <div
                    className="revenue-analytics-bar"
                    style={{
                      height: `${(item.revenue / maxRevenue) * 100}%`,
                    }}
                  />
                </div>

                <span className="revenue-analytics-month">
                  {item.month} 2026
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* plan distribution */}
      <section className="plan-distribution-section">
        <div className="plan-distribution-card">
          <div className="plan-distribution-header">
            <h2>Plan Distribution</h2>
            <p>Active and trial subscriptions by plan</p>
          </div>

          <div className="plan-distribution-chart">
            {planDistribution.map((item) => (
              <div className="plan-distribution-row" key={item.plan}>
                <div className="plan-distribution-label">
                  <span>{item.plan}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="plan-distribution-track">
                  <div
                    className={`plan-distribution-bar ${item.plan.toLowerCase()}`}
                    style={{
                      width: `${(item.count / maxPlanCount) * 100}%`,
                    }}
                  />
                </div>

                <p className="plan-distribution-description">
                  {item.count}{" "}
                  {item.count === 1 ? "subscription" : "subscriptions"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
