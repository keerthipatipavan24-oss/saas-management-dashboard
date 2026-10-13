
import { useEffect, useState } from "react";
import "./Users.css";

const initialUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", plan: "Pro", status: "Active", joinedDate: "2026-10-01" },
  { id: 2, name: "Priya Reddy", email: "priya@gmail.com", plan: "Basic", status: "Active", joinedDate: "2026-09-28" },
  { id: 3, name: "Anjali Kumar", email: "anjali@gmail.com", plan: "Premium", status: "Active", joinedDate: "2026-09-25" },
  { id: 4, name: "Kiran Rao", email: "kiran@gmail.com", plan: "Basic", status: "Inactive", joinedDate: "2026-08-20" },
  { id: 5, name: "Suresh Kumar", email: "suresh@gmail.com", plan: "Pro", status: "Active", joinedDate: "2026-10-03" },
  { id: 6, name: "Neha Singh", email: "neha@gmail.com", plan: "Premium", status: "Active", joinedDate: "2026-09-15" },
  { id: 7, name: "Arjun Reddy", email: "arjun@gmail.com", plan: "Basic", status: "Inactive", joinedDate: "2026-07-10" },
  { id: 8, name: "Meena Devi", email: "meena@gmail.com", plan: "Pro", status: "Active", joinedDate: "2026-10-05" },
  { id: 9, name: "Vikram Singh", email: "vikram@gmail.com", plan: "Premium", status: "Active", joinedDate: "2026-08-30" },
  { id: 10, name: "Divya Rao", email: "divya@gmail.com", plan: "Basic", status: "Inactive", joinedDate: "2026-06-18" },
];

// Load saved users and add missing joined dates.
const getSavedUsers = () => {
  try {
    const savedUsers = localStorage.getItem("users");

    if (savedUsers === null) {
      return initialUsers;
    }

    const parsedUsers = JSON.parse(savedUsers);

    if (!Array.isArray(parsedUsers)) {
      return initialUsers;
    }

    return parsedUsers.map((user) => {
      const sampleUser = initialUsers.find(
        (item) => String(item.id) === String(user.id)
      );

      return {
        ...user,
        joinedDate:
          user.joinedDate ||
          sampleUser?.joinedDate ||
          new Date().toISOString().slice(0, 10),
      };
    });
  } catch (error) {
    console.error("Unable to load users:", error);
    return initialUsers;
  }
};

export default function Users() {
  const [users, setUsers] = useState(getSavedUsers);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Default");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const usersPerPage = 5;

  // Save users and notify other pages.
  useEffect(() => {
    try {
      localStorage.setItem("users", JSON.stringify(users));
      window.dispatchEvent(new Event("saasDataUpdated"));
    } catch (error) {
      console.error("Unable to save users:", error);
    }
  }, [users]);

  // Listen for changes from other browser tabs.
  useEffect(() => {
    const refreshUsers = () => {
      setUsers(getSavedUsers());
    };

    window.addEventListener("storage", refreshUsers);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", refreshUsers);
    };
  }, []);

  // Keep selected user details synchronized.
  useEffect(() => {
    if (!selectedUser) return;

    const updatedUser = users.find(
      (user) => String(user.id) === String(selectedUser.id)
    );

    if (!updatedUser) {
      setSelectedUser(null);
    } else if (updatedUser !== selectedUser) {
      setSelectedUser(updatedUser);
    }
  }, [users, selectedUser]);

  // Search, filter, and sort users without useMemo.
  let filteredUsers = [...users];

  if (searchTerm.trim()) {
    const search = searchTerm.trim().toLowerCase();

    filteredUsers = filteredUsers.filter(
      (user) =>
        String(user.id).toLowerCase().includes(search) ||
        (user.name || "").toLowerCase().includes(search) ||
        (user.email || "").toLowerCase().includes(search)
    );
  }

  if (statusFilter !== "All") {
    filteredUsers = filteredUsers.filter(
      (user) => user.status === statusFilter
    );
  }

  if (planFilter !== "All") {
    filteredUsers = filteredUsers.filter(
      (user) => user.plan === planFilter
    );
  }

  if (sortBy === "Name A-Z") {
    filteredUsers.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }

  if (sortBy === "Name Z-A") {
    filteredUsers.sort((a, b) =>
      (b.name || "").localeCompare(a.name || "")
    );
  }

  if (sortBy === "Newest") {
    filteredUsers.sort(
      (a, b) =>
        new Date(b.joinedDate) - new Date(a.joinedDate)
    );
  }

  if (sortBy === "Oldest") {
    filteredUsers.sort(
      (a, b) =>
        new Date(a.joinedDate) - new Date(b.joinedDate)
    );
  }

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  // Reset pagination when filters or sorting change.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter, sortBy]);

  // Keep pagination within the valid range.
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPlanFilter("All");
    setSortBy("Default");
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handlePlanChange = (event) => {
    setPlanFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <main className="users-page">
      <section className="users-header-section">
        <div className="users-header">
          <div>
            <h2>User Management</h2>
            <p>
              View and monitor users registered on the SaaS platform.
            </p>
          </div>
        </div>
      </section>

      <section className="users-summary-section">
        <div className="users-summary">
          <div className="user-summary-card">
            <div className="user-summary-icon">👥</div>
            <div>
              <p>Total Users</p>
              <h3>{users.length}</h3>
            </div>
          </div>

          <div className="user-summary-card">
            <div className="user-summary-icon">🟢</div>
            <div>
              <p>Active Users</p>
              <h3>{activeUsers}</h3>
            </div>
          </div>

          <div className="user-summary-card">
            <div className="user-summary-icon">⚪</div>
            <div>
              <p>Inactive Users</p>
              <h3>{inactiveUsers}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="user-management-section">
        <div className="user-management-header">
          <div>
            <h2>Users</h2>
            <p>Search, filter and view registered users.</p>
          </div>
        </div>

        <div className="user-management-filters">
          <div className="user-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by ID, name or email"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={planFilter}
            onChange={handlePlanChange}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="Default">Sort By</option>
            <option value="Name A-Z">Name A-Z</option>
            <option value="Name Z-A">Name Z-A</option>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="users-table-wrapper">
          {loading ? (
            <div className="users-state">
              <h3>Loading users...</h3>
              <p>Please wait.</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="users-state">
              <h3>No users found</h3>
              <p>Try changing your search or filters.</p>
              <button
                type="button"
                className="clear-state-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>

                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {(user.name || "?").charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span className="plan-badge">{user.plan}</span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${(user.status || "").toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>{user.joinedDate}</td>

                    <td>
                      <button
                        type="button"
                        className="view-user-button"
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="users-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
            >
              Previous
            </button>

            <div className="pagination-pages">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  aria-current={
                    currentPage === page ? "page" : undefined
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

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
      </section>

      {selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <div className="user-modal-header">
              <div>
                <h2>User Details</h2>
                <p>Registered user information</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className="user-details">
              <div className="user-detail-avatar">
                {(selectedUser.name || "?").charAt(0)}
              </div>

              <div className="user-detail-item">
                <span>User ID</span>
                <strong>#{selectedUser.id}</strong>
              </div>

              <div className="user-detail-item">
                <span>Name</span>
                <strong>{selectedUser.name}</strong>
              </div>

              <div className="user-detail-item">
                <span>Email</span>
                <strong>{selectedUser.email}</strong>
              </div>

              <div className="user-detail-item">
                <span>Plan</span>
                <strong>{selectedUser.plan}</strong>
              </div>

              <div className="user-detail-item">
                <span>Status</span>
                <strong>{selectedUser.status}</strong>
              </div>

              <div className="user-detail-item">
                <span>Joined Date</span>
                <strong>{selectedUser.joinedDate}</strong>
              </div>
            </div>

            <div className="user-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
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
 