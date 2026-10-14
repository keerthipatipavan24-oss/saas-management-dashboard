
import { useState, useEffect } from "react";
import "./Customers.css";

const initialCustomers = [
  {
    id: "CUS1001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    plan: "Pro",
    status: "Active",
    revenue: 999,
    createdAt: "2026-10-12",
  },
  {
    id: "CUS1002",
    name: "Priya Reddy",
    email: "priya@gmail.com",
    plan: "Basic",
    status: "Active",
    revenue: 299,
    createdAt: "2026-10-08",
  },
  {
    id: "CUS1003",
    name: "Kiran Rao",
    email: "kiran@gmail.com",
    plan: "Basic",
    status: "Inactive",
    revenue: 299,
    createdAt: "2026-09-20",
  },
  {
    id: "CUS1004",
    name: "Anjali Kumar",
    email: "anjali@gmail.com",
    plan: "Premium",
    status: "Active",
    revenue: 19999,
    createdAt: "2026-08-15",
  },
  {
    id: "CUS1005",
    name: "Vikram Singh",
    email: "vikram@gmail.com",
    plan: "Premium",
    status: "Active",
    revenue: 19999,
    createdAt: "2026-07-20",
  },
];

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

// Load existing records and add missing sample dates.
function getSavedCustomers() {
  try {
    const savedCustomers = localStorage.getItem("customers");

    if (savedCustomers === null) {
      return initialCustomers;
    }

    const parsedCustomers = JSON.parse(savedCustomers);

    if (!Array.isArray(parsedCustomers)) {
      return initialCustomers;
    }

    return parsedCustomers.map((customer) => {
      const sampleCustomer = initialCustomers.find(
        (item) => item.id === customer.id
      );

      return {
        ...customer,
        createdAt:
          customer.createdAt ||
          sampleCustomer?.createdAt ||
          new Date().toISOString().slice(0, 10),
      };
    });
  } catch {
    return initialCustomers;
  }
}

export default function Customers() {
  const [customers, setCustomers] = useState(getSavedCustomers);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const customersPerPage = 3;

  // Persist customer data, including createdAt.
  useEffect(() => {
    try {
      localStorage.setItem("customers", JSON.stringify(customers));
      window.dispatchEvent(new Event("saasDataUpdated"));
    } catch (error) {
      console.error("Unable to save customers:", error);
    }
  }, [customers]);

  // Synchronize updates from other pages or browser tabs.
  useEffect(() => {
    const syncCustomers = () => {
      setCustomers(getSavedCustomers());
    };

    window.addEventListener("storage", syncCustomers);
    window.addEventListener("saasDataUpdated", syncCustomers);

    return () => {
      window.removeEventListener("storage", syncCustomers);
      window.removeEventListener("saasDataUpdated", syncCustomers);
    };
  }, []);

  // Keep the selected customer details synchronized.
  useEffect(() => {
    if (!selectedCustomer) return;

    const updatedCustomer = customers.find(
      (customer) => customer.id === selectedCustomer.id
    );

    if (!updatedCustomer) {
      setSelectedCustomer(null);
    } else if (updatedCustomer !== selectedCustomer) {
      setSelectedCustomer(updatedCustomer);
    }
  }, [customers, selectedCustomer]);

  // Summary calculations.
  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const totalRevenue = customers.reduce(
    (total, customer) => total + Number(customer.revenue || 0),
    0
  );

  // Search and filters.
  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(customer.name || "").toLowerCase().includes(search) ||
      String(customer.email || "").toLowerCase().includes(search) ||
      String(customer.id || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || customer.status === statusFilter;

    const matchesPlan =
      planFilter === "All" || customer.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalPages = Math.ceil(
    filteredCustomers.length / customersPerPage
  );

  // Reset pagination when search or filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter]);

  // Keep pagination within the available pages.
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  const indexOfFirstCustomer = (currentPage - 1) * customersPerPage;

  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfFirstCustomer + customersPerPage
  );

  const firstResult =
    filteredCustomers.length === 0 ? 0 : indexOfFirstCustomer + 1;

  const lastResult = Math.min(
    indexOfFirstCustomer + customersPerPage,
    filteredCustomers.length
  );

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>Customers</h1>
        <p>Manage and monitor your customers.</p>
      </div>

      {/* Customer Summary Cards */}
      <div className="customer-summary-grid">
        <div className="customer-summary-card">
          <h3>Total Customers</h3>
          <h2>{totalCustomers}</h2>
        </div>

        <div className="customer-summary-card">
          <h3>Active Customers</h3>
          <h2>{activeCustomers}</h2>
        </div>

        <div className="customer-summary-card">
          <h3>Inactive Customers</h3>
          <h2>{inactiveCustomers}</h2>
        </div>

        <div className="customer-summary-card">
          <h3>Total Revenue</h3>
          <h2>{formatCurrency(totalRevenue)}</h2>
        </div>
      </div>

      {/* Customers List */}
      <div className="customers-list-section">
        <div className="customers-list-header">
          <div>
            <h2>Customers List</h2>
            <p>View and manage your customer records.</p>
          </div>

          <span className="customer-count">
            {filteredCustomers.length} Customers
          </span>
        </div>
 
        {/* Search and Filters */}
        <div className="customers-list-controls">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            aria-label="Search customers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          /> 

          <select
            aria-label="Filter by customer status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            aria-label="Filter by plan"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {/* Customers Table */}
        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>

                    <td>
                      <div className="customer-name">
                        {customer.name}
                      </div>
                      <div className="customer-email">
                        {customer.email}
                      </div>
                    </td>

                    <td>{customer.plan}</td>

                    <td>
                      <span
                        className={`customer-status ${
                          customer.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>{formatCurrency(customer.revenue)}</td>

                    <td>
                      <button
                        type="button"
                        className="customer-view-button"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="customers-empty">
                    No customers found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Results Count and Pagination */}
        <div className="customers-pagination-footer">
          <p className="customers-results-count">
            Showing {firstResult}–{lastResult} of{" "}
            {filteredCustomers.length} customers
          </p>

          {totalPages > 1 && (
            <div className="customers-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  type="button"
                  key={index + 1}
                  className={
                    currentPage === index + 1 ? "active" : ""
                  }
                  aria-current={
                    currentPage === index + 1 ? "page" : undefined
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Customer Modal */}
      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <h2 id="customer-modal-title">Customer Details</h2>

              <button
                type="button"
                className="customer-modal-close"
                aria-label="Close customer details"
                onClick={() => setSelectedCustomer(null)}
              >
                &times;
              </button>
            </div>

            <div className="customer-modal-body">
              <p>
                <strong>Customer ID:</strong> {selectedCustomer.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedCustomer.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedCustomer.email}
              </p>
              <p>
                <strong>Plan:</strong> {selectedCustomer.plan}
              </p>
              <p>
                <strong>Status:</strong> {selectedCustomer.status}
              </p>
              <p>
                <strong>Revenue:</strong>{" "}
                {formatCurrency(selectedCustomer.revenue)}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedCustomer.createdAt}
              </p>
            </div>

            <div className="customer-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 