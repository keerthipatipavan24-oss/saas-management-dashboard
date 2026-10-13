
import { useEffect, useState } from "react";
import "./Subscriptions.css";

const initialSubscriptions = [
  { id: 1001, customer: "Rahul Sharma", email: "rahul@gmail.com", plan: "Pro", billingCycle: "Monthly", amount: 999, status: "Active", startDate: "2026-10-01", renewalDate: "2026-11-01" },
  { id: 1002, customer: "Priya Reddy", email: "priya@gmail.com", plan: "Basic", billingCycle: "Monthly", amount: 299, status: "Trial", startDate: "2026-10-05", renewalDate: "2026-10-19" },
  { id: 1003, customer: "Anjali Kumar", email: "anjali@gmail.com", plan: "Premium", billingCycle: "Yearly", amount: 19999, status: "Active", startDate: "2026-09-25", renewalDate: "2027-09-25" },
  { id: 1004, customer: "Kiran Rao", email: "kiran@gmail.com", plan: "Basic", billingCycle: "Monthly", amount: 299, status: "Cancelled", startDate: "2026-08-20", renewalDate: "2026-09-20" },
  { id: 1005, customer: "Suresh Kumar", email: "suresh@gmail.com", plan: "Pro", billingCycle: "Monthly", amount: 999, status: "Active", startDate: "2026-10-03", renewalDate: "2026-11-03" },
  { id: 1006, customer: "Neha Singh", email: "neha@gmail.com", plan: "Premium", billingCycle: "Monthly", amount: 1999, status: "Expired", startDate: "2026-09-15", renewalDate: "2026-10-01" },
  { id: 1007, customer: "Arjun Reddy", email: "arjun@gmail.com", plan: "Basic", billingCycle: "Monthly", amount: 299, status: "Active", startDate: "2026-10-02", renewalDate: "2026-11-02" },
  { id: 1008, customer: "Meena Devi", email: "meena@gmail.com", plan: "Pro", billingCycle: "Monthly", amount: 999, status: "Trial", startDate: "2026-10-06", renewalDate: "2026-10-20" },
  { id: 1009, customer: "Vikram Singh", email: "vikram@gmail.com", plan: "Premium", billingCycle: "Yearly", amount: 19999, status: "Active", startDate: "2026-09-30", renewalDate: "2027-09-30" },
  { id: 1010, customer: "Divya Rao", email: "divya@gmail.com", plan: "Basic", billingCycle: "Monthly", amount: 299, status: "Cancelled", startDate: "2026-07-18", renewalDate: "2026-08-18" },
];

const getSavedSubscriptions = () => {
  try {
    const saved = localStorage.getItem("subscriptions");

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialSubscriptions;
    }

    localStorage.setItem(
      "subscriptions",
      JSON.stringify(initialSubscriptions)
    );

    return initialSubscriptions;
  } catch (error) {
    console.error("Unable to load subscriptions:", error);
    return initialSubscriptions;
  }
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState(
    getSavedSubscriptions
  );

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [billingCycleFilter, setBillingCycleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const subscriptionsPerPage = 6;

  // Refresh subscriptions when shared data changes.
  useEffect(() => {
    const refreshSubscriptions = () => {
      try {
        const saved = localStorage.getItem("subscriptions");

        if (saved !== null) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setSubscriptions(parsed);
          }
        }
      } catch (error) {
        console.error("Unable to refresh subscriptions:", error);
      }
    };

    window.addEventListener("storage", refreshSubscriptions);
    window.addEventListener("saasDataUpdated", refreshSubscriptions);

    return () => {
      window.removeEventListener("storage", refreshSubscriptions);
      window.removeEventListener("saasDataUpdated", refreshSubscriptions);
    };
  }, []);

  // Reset pagination when filters or subscription count changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    planFilter,
    billingCycleFilter,
    sortBy,
    subscriptions.length,
  ]);

  const totalSubscriptions = subscriptions.length;

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Active"
  ).length;

  const trialSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Trial"
  ).length;

  const cancelledSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Cancelled"
  ).length;

  const expiredSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Expired"
  ).length;

  // Search, filter, and sort without useMemo.
  const search = searchTerm.trim().toLowerCase();

  let sortedSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      String(subscription.id).includes(search) ||
      (subscription.customer || "").toLowerCase().includes(search) ||
      (subscription.email || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      subscription.status === statusFilter;

    const matchesPlan =
      planFilter === "All" ||
      subscription.plan === planFilter;

    const matchesBillingCycle =
      billingCycleFilter === "All" ||
      subscription.billingCycle === billingCycleFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPlan &&
      matchesBillingCycle
    );
  });

  sortedSubscriptions = [...sortedSubscriptions].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.customer || "").localeCompare(b.customer || "");
    }

    if (sortBy === "name-desc") {
      return (b.customer || "").localeCompare(a.customer || "");
    }

    if (sortBy === "amount-asc") {
      return Number(a.amount || 0) - Number(b.amount || 0);
    }

    if (sortBy === "amount-desc") {
      return Number(b.amount || 0) - Number(a.amount || 0);
    }

    if (sortBy === "date-asc") {
      return new Date(a.renewalDate) - new Date(b.renewalDate);
    }

    if (sortBy === "date-desc") {
      return new Date(b.renewalDate) - new Date(a.renewalDate);
    }

    return 0;
  });

  const totalPages = Math.ceil(
    sortedSubscriptions.length / subscriptionsPerPage
  );

  const startIndex = (currentPage - 1) * subscriptionsPerPage;

  const currentSubscriptions = sortedSubscriptions.slice(
    startIndex,
    startIndex + subscriptionsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleCloseSubscription = () => {
    setSelectedSubscription(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPlanFilter("All");
    setBillingCycleFilter("All");
    setSortBy("default");
    setCurrentPage(1);
  };

  return (
    <main className="subscriptions-page">
      <section className="subscription-header-section">
        <div className="subscription-header-content">
          <h2>Subscription Management</h2>
          <p>
            View and monitor customer subscriptions, plans, and billing status.
          </p>
        </div>
      </section>

      <section className="subscription-summary-section">
        <div className="subscription-summary-cards">
          <div className="subscription-summary-card">
            <div className="subscription-summary-icon total-icon">📋</div>
            <div className="subscription-summary-content">
              <h3>Total Subscriptions</h3>
              <p>{totalSubscriptions}</p>
            </div>
          </div>

          <div className="subscription-summary-card">
            <div className="subscription-summary-icon active-icon">✅</div>
            <div className="subscription-summary-content">
              <h3>Active Subscriptions</h3>
              <p>{activeSubscriptions}</p>
            </div>
          </div>

          <div className="subscription-summary-card">
            <div className="subscription-summary-icon trial-icon">🆓</div>
            <div className="subscription-summary-content">
              <h3>Trial Subscriptions</h3>
              <p>{trialSubscriptions}</p>
            </div>
          </div>

          <div className="subscription-summary-card">
            <div className="subscription-summary-icon cancelled-icon">❌</div>
            <div className="subscription-summary-content">
              <h3>Cancelled Subscriptions</h3>
              <p>{cancelledSubscriptions}</p>
            </div>
          </div>

          <div className="subscription-summary-card">
            <div className="subscription-summary-icon expired-icon">🔚</div>
            <div className="subscription-summary-content">
              <h3>Expired Subscriptions</h3>
              <p>{expiredSubscriptions}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="subscription-list-header">
        <h2>All Subscriptions</h2>
        <p>Overview of customer plans and subscription status.</p>
      </section>

      <div className="subscription-search-section">
        <input
          type="search"
          name="subscription-search"
          className="subscription-search-input"
          placeholder="Search by ID, customer name, or email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          autoComplete="off"
        />

        {searchTerm && (
          <button
            type="button"
            className="subscription-search-clear"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </button>
        )}
      </div>

      <div className="subscription-filters-section">
        <select
          className="subscription-filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Trial">Trial</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Expired">Expired</option>
        </select>

        <select
          className="subscription-filter-select"
          value={planFilter}
          onChange={(event) => setPlanFilter(event.target.value)}
        >
          <option value="All">All Plans</option>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Premium">Premium</option>
        </select>

        <select
          className="subscription-filter-select"
          value={billingCycleFilter}
          onChange={(event) => setBillingCycleFilter(event.target.value)}
        >
          <option value="All">All Billing Cycles</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>

        <select
          className="subscription-filter-select"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="default">Sort By: Default</option>
          <option value="name-asc">Customer Name: A-Z</option>
          <option value="name-desc">Customer Z-A</option>
          <option value="amount-asc">Amount: Low to High</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="date-asc">Renewal Date: Earliest First</option>
          <option value="date-desc">Renewal Date: Latest First</option>
        </select>

        {(searchTerm ||
          statusFilter !== "All" ||
          planFilter !== "All" ||
          billingCycleFilter !== "All" ||
          sortBy !== "default") && (
          <button
            type="button"
            className="subscription-filter-reset"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        )}
      </div>

      <section className="subscription-cards-section">
        {currentSubscriptions.map((subscription) => (
          <div className="subscription-card" key={subscription.id}>
            <div className="subscription-card-header">
              <div className="subscription-card-customer">
                <div className="subscription-card-avatar">
                  {(subscription.customer || "?").charAt(0)}
                </div>

                <div className="subscription-card-customer-info">
                  <h3>{subscription.customer}</h3>
                  <p>{subscription.id}</p>
                </div>
              </div>

              <span
                className={`subscription-card-status ${(subscription.status || "").toLowerCase()}`}
              >
                {subscription.status}
              </span>
            </div>

            <div className="subscription-card-details">
              <div>
                <span>Plan</span>
                <strong>{subscription.plan}</strong>
              </div>

              <div>
                <span>Billing Cycle</span>
                <strong>{subscription.billingCycle}</strong>
              </div>

              <div>
                <span>Subscription Amount</span>
                <strong>
                  ₹{Number(subscription.amount || 0).toLocaleString("en-IN")}/
                  {subscription.billingCycle === "Monthly" ? "month" : "year"}
                </strong>
              </div>

              <div>
                <span>Renewal / End Date</span>
                <strong>{subscription.renewalDate}</strong>
              </div>
            </div>

            <div className="subscription-card-actions">
              <button
                type="button"
                className="subscription-view-button"
                onClick={() => handleViewSubscription(subscription)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {sortedSubscriptions.length === 0 && (
          <div className="subscription-search-empty">
            <h3>No subscriptions found</h3>
            <p>
              Try changing your search term or selecting different filters.
            </p>
            <button
              type="button"
              className="subscription-empty-reset"
              onClick={handleResetFilters}
            >
              Clear Search and Filters
            </button>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="subscription-pagination">
          <button
            type="button"
            className="subscription-page-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              type="button"
              key={index + 1}
              className={`subscription-page-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            className="subscription-page-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {selectedSubscription && (
        <div
          className="subscription-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseSubscription();
            }
          }}
        >
          <div className="subscription-modal">
            <div className="subscription-modal-header">
              <div>
                <h2>Subscription Details</h2>
                <p>Complete subscription information</p>
              </div>

              <button
                type="button"
                className="subscription-modal-x-button"
                onClick={handleCloseSubscription}
              >
                ×
              </button>
            </div>

            <div className="subscription-modal-body">
              <div className="subscription-modal-customer">
                <div className="subscription-modal-avatar">
                  {(selectedSubscription.customer || "?").charAt(0)}
                </div>

                <div className="subscription-modal-customer-info">
                  <h3>{selectedSubscription.customer}</h3>
                  <p>{selectedSubscription.email}</p>
                </div>
              </div>

              <div className="subscription-modal-status">
                <span>Subscription Status</span>
                <strong
                  className={`subscription-card-status ${(selectedSubscription.status || "").toLowerCase()}`}
                >
                  {selectedSubscription.status}
                </strong>
              </div>

              <div className="subscription-modal-details">
                <div>
                  <span>Subscription ID</span>
                  <strong>{selectedSubscription.id}</strong>
                </div>

                <div>
                  <span>Plan</span>
                  <strong>{selectedSubscription.plan}</strong>
                </div>

                <div>
                  <span>Billing Cycle</span>
                  <strong>{selectedSubscription.billingCycle}</strong>
                </div>

                <div>
                  <span>Subscription Amount</span>
                  <strong>
                    ₹{Number(selectedSubscription.amount || 0).toLocaleString("en-IN")}/
                    {selectedSubscription.billingCycle === "Monthly" ? "month" : "year"}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>{selectedSubscription.startDate}</strong>
                </div>

                <div>
                  <span>Renewal / End Date</span>
                  <strong>{selectedSubscription.renewalDate}</strong>
                </div>
              </div>
            </div>

            <div className="subscription-modal-footer">
              <button
                type="button"
                className="subscription-modal-close-button"
                onClick={handleCloseSubscription}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
 