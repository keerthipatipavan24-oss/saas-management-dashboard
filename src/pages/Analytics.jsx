import { useEffect, useState } from "react";
import "./Analytics.css";

const sampleUsers = [
  { id: 1, joinedDate: "2026-10-01" },
  { id: 2, joinedDate: "2026-09-28" },
  { id: 3, joinedDate: "2026-09-25" },
  { id: 4, joinedDate: "2026-08-20" },
  { id: 5, joinedDate: "2026-10-03" },
  { id: 6, joinedDate: "2026-09-15" },
  { id: 7, joinedDate: "2026-07-10" },
  { id: 8, joinedDate: "2026-10-05" },
  { id: 9, joinedDate: "2026-08-30" },
  { id: 10, joinedDate: "2026-06-18" },
];

const sampleCustomers = [
  { id: "CUS1001", createdAt: "2026-10-12" },
  { id: "CUS1002", createdAt: "2026-10-08" },
  { id: "CUS1003", createdAt: "2026-09-20" },
  { id: "CUS1004", createdAt: "2026-08-15" },
  { id: "CUS1005", createdAt: "2026-07-20" },
];

const sampleSubscriptions = [
  { id: 1001, status: "Active", amount: 999, date: "2026-10-01", startDate: "2026-10-01", plan: "Pro" },
  { id: 1002, status: "Trial", amount: 299, date: "2026-10-05", startDate: "2026-10-05", plan: "Basic" },
  { id: 1003, status: "Active", amount: 19999, date: "2026-09-25", startDate: "2026-09-25", plan: "Premium" },
  { id: 1004, status: "Cancelled", amount: 299, date: "2026-08-20", startDate: "2026-08-20", plan: "Basic" },
  { id: 1005, status: "Active", amount: 999, date: "2026-10-03", startDate: "2026-10-03", plan: "Pro" },
  { id: 1006, status: "Expired", amount: 1999, date: "2026-09-15", startDate: "2026-09-15", plan: "Premium" },
  { id: 1007, status: "Active", amount: 299, date: "2026-10-02", startDate: "2026-10-02", plan: "Basic" },
  { id: 1008, status: "Trial", amount: 999, date: "2026-10-06", startDate: "2026-10-06", plan: "Pro" },
  { id: 1009, status: "Active", amount: 19999, date: "2026-09-30", startDate: "2026-09-30", plan: "Premium" },
  { id: 1010, status: "Cancelled", amount: 299, date: "2026-07-18", startDate: "2026-07-18", plan: "Basic" },
];

const samplePlans = [
  { id: "PL1001", name: "Basic", status: "Active" },
  { id: "PL1002", name: "Pro", status: "Active" },
  { id: "PL1003", name: "Premium", status: "Active" },
];

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) return fallback;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  if (!value) return null;

  const dateString = String(value).slice(0, 10);
  const date = new Date(`${dateString}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return "—";

  const date = parseDate(value);

  return date
    ? date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const getDateRange = (range, customStart, customEnd) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start = new Date(today);
  let end = new Date(today);

  if (range === "7") {
    start.setDate(today.getDate() - 6);
  } else if (range === "30") {
    start.setDate(today.getDate() - 29);
  } else if (range === "90") {
    start.setDate(today.getDate() - 89);
  } else if (range === "custom") {
    start = parseDate(customStart) || new Date(today);
    end = parseDate(customEnd) || new Date(today);
  }

  return { start, end };
};

const isWithinRange = (value, start, end) => {
  const date = parseDate(value);

  if (!date) return false;

  return date >= start && date <= end;
};

const getPreviousRange = (start, end) => {
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const numberOfDays =
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - numberOfDays + 1);

  return { start: previousStart, end: previousEnd };
};

const getChangeLabel = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? "No change" : "New activity";
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);

  return `${rounded > 0 ? "+" : ""}${rounded}% vs previous period`;
};

const getTodayActivities = (activities) => {
  const today = localDateString(new Date());

  return activities.filter((activity) => {
    const date = new Date(activity.timestamp);

    return (
      !Number.isNaN(date.getTime()) &&
      localDateString(date) === today
    );
  }).length;
};

const getWeekActivities = (activities) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monday = new Date(today);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

  return activities.filter((activity) => {
    const date = new Date(activity.timestamp);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= monday &&
      date <= new Date()
    );
  }).length;
};

const formatActivityTime = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");

  const [customStart, setCustomStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return localDateString(date);
  });

  const [customEnd, setCustomEnd] = useState(() =>
    localDateString(new Date())
  );

  const [users, setUsers] = useState(() =>
    readStorage("users", sampleUsers)
  );

  const [customers, setCustomers] = useState(() =>
    readStorage("customers", sampleCustomers)
  );

  const [subscriptions, setSubscriptions] = useState(() =>
    readStorage("subscriptions", sampleSubscriptions)
  );

  const [plans, setPlans] = useState(() =>
    readStorage("plans", samplePlans)
  );

  const [activities, setActivities] = useState(() =>
    readStorage("usageActivities", [])
  );

  // Refresh saved data when another page updates it.
  useEffect(() => {
    const refreshData = () => {
      setUsers(readStorage("users", sampleUsers));
      setCustomers(readStorage("customers", sampleCustomers));
      setSubscriptions(
        readStorage("subscriptions", sampleSubscriptions)
      );
      setPlans(readStorage("plans", samplePlans));
      setActivities(readStorage("usageActivities", []));
    };

    window.addEventListener("storage", refreshData);
    window.addEventListener("saasDataUpdated", refreshData);
    window.addEventListener("usageActivitiesUpdated", refreshData);
    window.addEventListener("focus", refreshData);

    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("saasDataUpdated", refreshData);
      window.removeEventListener("usageActivitiesUpdated", refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  // Usage Analytics calculations.
  const totalActivities = activities.length;
  const todayActivities = getTodayActivities(activities);
  const weekActivities = getWeekActivities(activities);
  const recentActivities = activities.slice(0, 5);

  // Calculate the selected and previous date ranges directly.
  const { start, end } = getDateRange(
    dateRange,
    customStart,
    customEnd
  );

  const validRange = start <= end;

  const previousRange = getPreviousRange(start, end);

  // Filter users, customers, and subscriptions for the selected period.
  const filteredUsers = validRange
    ? users.filter((user) =>
        isWithinRange(user.joinedDate, start, end)
      )
    : [];

  const filteredCustomers = validRange
    ? customers.filter((customer) =>
        isWithinRange(customer.createdAt, start, end)
      )
    : [];

  const filteredSubscriptions = validRange
    ? subscriptions.filter((subscription) =>
        isWithinRange(
          subscription.startDate || subscription.date,
          start,
          end
        )
      )
    : [];

  // Filter records for the previous equivalent period.
  const previousUsers = users.filter((user) =>
    isWithinRange(
      user.joinedDate,
      previousRange.start,
      previousRange.end
    )
  );

  const previousCustomers = customers.filter((customer) =>
    isWithinRange(
      customer.createdAt,
      previousRange.start,
      previousRange.end
    )
  );

  const previousSubscriptions = subscriptions.filter((subscription) =>
    isWithinRange(
      subscription.startDate || subscription.date,
      previousRange.start,
      previousRange.end
    )
  );

  // Calculate active subscription value, not confirmed collected revenue.
  const subscriptionValue = filteredSubscriptions
    .filter((subscription) => subscription.status === "Active")
    .reduce(
      (total, subscription) =>
        total + Number(subscription.amount || 0),
      0
    );

  const previousSubscriptionValue = previousSubscriptions
    .filter((subscription) => subscription.status === "Active")
    .reduce(
      (total, subscription) =>
        total + Number(subscription.amount || 0),
      0
    );

  // Count subscriptions under each plan.
  const planCounts = {};

  filteredSubscriptions.forEach((subscription) => {
    const plan = subscription.plan || "Unknown";
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });

  const subscriptionCountsByPlan = Object.entries(planCounts).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  // Build daily user and customer registration trends.
  const registrationTrend = [];

  if (validRange) {
    const cursor = new Date(start);

    while (cursor <= end) {
      const day = localDateString(cursor);

      const usersCount = users.filter(
        (user) => user.joinedDate === day
      ).length;

      const customersCount = customers.filter(
        (customer) => customer.createdAt === day
      ).length;

      registrationTrend.push({
        date: day,
        label: cursor.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        users: usersCount,
        customers: customersCount,
      });

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const displayedTrend = registrationTrend.slice(-14);

  const maxTrendValue = Math.max(
    1,
    ...displayedTrend.flatMap((item) => [
      item.users,
      item.customers,
    ])
  );

  const maxPlanCount = Math.max(
    1,
    ...subscriptionCountsByPlan.map((item) => item.count)
  );

  return (
    <main className="analytics-page">
      <section className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Monitor registrations and subscription activity across your SaaS platform.
          </p>
        </div>
      </section>

      {/* Usage Analytics */}
      <section className="analytics-summary-section">
        <div className="analytics-section-heading">
          <div>
            <h2>Usage Analytics</h2>
            <p>Track plan management activities in your dashboard.</p>
          </div>
        </div>

        <div className="analytics-summary-grid">
          <article className="analytics-summary-card">
            <div className="analytics-card-icon users-icon">📊</div>
            <p>Total Activities</p>
            <h3>{totalActivities}</h3>
            <span>Recorded plan actions</span>
          </article>

          <article className="analytics-summary-card">
            <div className="analytics-card-icon customers-icon">📅</div>
            <p>Today's Activities</p>
            <h3>{todayActivities}</h3>
            <span>Actions recorded today</span>
          </article>

          <article className="analytics-summary-card">
            <div className="analytics-card-icon subscriptions-icon">🗓️</div>
            <p>This Week's Activities</p>
            <h3>{weekActivities}</h3>
            <span>Since Monday</span>
          </article>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="analytics-panel">
        <div className="analytics-section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>The five most recent recorded plan actions.</p>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <div className="analytics-empty-state">
            <h3>No activities yet</h3>
            <p>
              Add, edit, or delete a plan to see activity records here.
            </p>
          </div>
        ) : (
          <div className="usage-activity-list">
            {recentActivities.map((activity) => (
              <div
                className="usage-activity-item"
                key={activity.id}
              >
                <div className="usage-activity-icon">✓</div>

                <div className="usage-activity-details">
                  <strong>{activity.action}</strong>
                  <span>{activity.details}</span>
                </div>

                <time className="usage-activity-time">
                  {formatActivityTime(activity.timestamp)}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Date Range Filter */}
      <section className="analytics-filter-section">
        <div className="analytics-section-heading">
          <div>
            <h2>Date Range</h2>
            <p>Choose the period for your analytics.</p>
          </div>

          <span className="analytics-date-label">
            {validRange
              ? `${formatDate(localDateString(start))} – ${formatDate(
                  localDateString(end)
                )}`
              : "Invalid date range"}
          </span>
        </div>

        <div className="analytics-date-controls">
          <div className="analytics-range-options">
            {[
              ["today", "Today"],
              ["7", "Last 7 Days"],
              ["30", "Last 30 Days"],
              ["90", "Last 90 Days"],
              ["custom", "Custom Range"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={dateRange === value ? "active" : ""}
                aria-pressed={dateRange === value}
                onClick={() => setDateRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="analytics-custom-dates">
              <label>
                Start date
                <input
                  type="date"
                  value={customStart}
                  max={customEnd}
                  onChange={(event) =>
                    setCustomStart(event.target.value)
                  }
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  max={localDateString(new Date())}
                  onChange={(event) =>
                    setCustomEnd(event.target.value)
                  }
                />
              </label>
            </div>
          )}
        </div>
      </section>

      {!validRange ? (
        <div className="analytics-empty-state">
          <h3>Invalid date range</h3>
          <p>
            Please select an end date that is on or after the start date.
          </p>
          <button
            type="button"
            onClick={() => {
              const today = localDateString(new Date());
              setCustomStart(today);
              setCustomEnd(today);
            }}
          >
            Reset dates
          </button>
        </div>
      ) : (
        <>
          {/* Analytics Summary */}
          <section className="analytics-summary-section">
            <div className="analytics-section-heading">
              <div>
                <h2>Analytics Summary</h2>
                <p>New records created or started in this period.</p>
              </div>
            </div>

            <div className="analytics-summary-grid">
              <article className="analytics-summary-card">
                <div className="analytics-card-icon users-icon">👥</div>
                <p>New Users</p>
                <h3>{filteredUsers.length}</h3>
                <span>
                  {getChangeLabel(
                    filteredUsers.length,
                    previousUsers.length
                  )}
                </span>
              </article>

              <article className="analytics-summary-card">
                <div className="analytics-card-icon customers-icon">🤝</div>
                <p>New Customers</p>
                <h3>{filteredCustomers.length}</h3>
                <span>
                  {getChangeLabel(
                    filteredCustomers.length,
                    previousCustomers.length
                  )}
                </span>
              </article>

              <article className="analytics-summary-card">
                <div className="analytics-card-icon subscriptions-icon">🔄</div>
                <p>New Subscriptions</p>
                <h3>{filteredSubscriptions.length}</h3>
                <span>
                  {getChangeLabel(
                    filteredSubscriptions.length,
                    previousSubscriptions.length
                  )}
                </span>
              </article>

              <article className="analytics-summary-card">
                <div className="analytics-card-icon value-icon">₹</div>
                <p>Active Subscription Value</p>
                <h3>{formatCurrency(subscriptionValue)}</h3>
                <span>
                  {getChangeLabel(
                    subscriptionValue,
                    previousSubscriptionValue
                  )}
                </span>
              </article>

              <article className="analytics-summary-card">
                <div className="analytics-card-icon plans-icon">💳</div>
                <p>Current Plans</p>
                <h3>{plans.length}</h3>
                <span>All-time current total</span>
              </article>
            </div>
          </section>

          {/* Registration Trends */}
          <section className="analytics-panel">
            <div className="analytics-section-heading">
              <div>
                <h2>Registration Trends</h2>
                <p>
                  Daily new users and customers. Showing up to the latest 14 days.
                </p>
              </div>
            </div>

            <div className="analytics-legend">
              <span><i className="legend-users" /> New Users</span>
              <span><i className="legend-customers" /> New Customers</span>
            </div>

            <div className="analytics-trend-chart">
              {displayedTrend.map((item) => (
                <div className="analytics-trend-column" key={item.date}>
                  <div className="analytics-bars">
                    <div
                      className="analytics-bar legend-users"
                      style={{
                        height: `${(item.users / maxTrendValue) * 100}%`,
                      }}
                      title={`${item.users} new users`}
                    />
                    <div
                      className="analytics-bar legend-customers"
                      style={{
                        height: `${(item.customers / maxTrendValue) * 100}%`,
                      }}
                      title={`${item.customers} new customers`}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {displayedTrend.every(
              (item) => item.users === 0 && item.customers === 0
            ) && (
              <p className="analytics-note">
                No user or customer registrations were recorded in this period.
              </p>
            )}
          </section>

          {/* Subscription Distribution */}
          <section className="analytics-panel">
            <div className="analytics-section-heading">
              <div>
                <h2>Subscriptions by Plan</h2>
                <p>
                  Subscription records started during the selected period.
                </p>
              </div>
            </div>

            {subscriptionCountsByPlan.length === 0 ? (
              <div className="analytics-empty-state">
                <h3>No subscription data</h3>
                <p>No subscriptions were started in this period.</p>
              </div>
            ) : (
              <div className="analytics-plan-chart">
                {subscriptionCountsByPlan.map((item) => (
                  <div className="analytics-plan-row" key={item.name}>
                    <div className="analytics-plan-label">
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <div className="analytics-plan-track">
                      <div
                        className="analytics-plan-fill"
                        style={{
                          width: `${(item.count / maxPlanCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Period Comparison */}
          <section className="analytics-panel">
            <div className="analytics-section-heading">
              <div>
                <h2>Period Comparison</h2>
                <p>
                  Selected period compared with the previous equivalent period.
                </p>
              </div>
            </div>

            <div className="analytics-comparison-grid">
              <div className="analytics-comparison-card">
                <p>New Users</p>
                <strong>{filteredUsers.length}</strong>
                <span>Previous period: {previousUsers.length}</span>
              </div>

              <div className="analytics-comparison-card">
                <p>New Customers</p>
                <strong>{filteredCustomers.length}</strong>
                <span>Previous period: {previousCustomers.length}</span>
              </div>

              <div className="analytics-comparison-card">
                <p>New Subscriptions</p>
                <strong>{filteredSubscriptions.length}</strong>
                <span>
                  Previous period: {previousSubscriptions.length}
                </span>
              </div>

              <div className="analytics-comparison-card">
                <p>Active Subscription Value</p>
                <strong>{formatCurrency(subscriptionValue)}</strong>
                <span>
                  Previous period: {formatCurrency(previousSubscriptionValue)}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
} 