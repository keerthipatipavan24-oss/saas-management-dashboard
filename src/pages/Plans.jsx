
import { useState, useEffect } from "react";
import Toast from "../components/Toast";
import "./Plans.css";

const initialPlans = [
  {
    id: "PL1001",
    name: "Basic",
    monthlyPrice: 299,
    yearlyPrice: 2999,
    status: "Active",
    subscribers: 25,
    features: [
      "Up to 5 users",
      "5 GB storage",
      "Basic usage analytics",
      "Email support",
    ],
  },
  {
    id: "PL1002",
    name: "Pro",
    monthlyPrice: 999,
    yearlyPrice: 9999,
    status: "Active",
    subscribers: 45,
    features: [
      "Up to 20 users",
      "50 GB storage",
      "Advanced usage analytics",
      "Priority support",
      "Detailed reports",
    ],
  },
  {
    id: "PL1003",
    name: "Premium",
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    status: "Active",
    subscribers: 30,
    features: [
      "Unlimited users",
      "200 GB storage",
      "Advanced usage analytics",
      "Custom reports",
      "24/7 support",
    ],
  },
];

const emptyForm = {
  name: "",
  monthlyPrice: "",
  yearlyPrice: "",
  status: "Active",
  features: "",
};

function getSavedPlans() {
  try {
    const saved = localStorage.getItem("plans");

    if (saved === null) return initialPlans;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialPlans;
  } catch {
    return initialPlans;
  }
}

// Record plan actions for Usage Analytics.
const trackUsage = (action, planName) => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("usageActivities") || "[]"
    );

    const activities = Array.isArray(saved) ? saved : [];

    activities.unshift({
      id: `${Date.now()}-${Math.random()}`,
      action,
      details: planName,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(
      "usageActivities",
      JSON.stringify(activities.slice(0, 500))
    );

    window.dispatchEvent(new Event("usageActivitiesUpdated"));
  } catch (error) {
    console.error("Unable to save usage activity:", error);
  }
};

export default function Plans() {
  const [plans, setPlans] = useState(getSavedPlans);

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletePlan, setDeletePlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const plansPerPage = 3;

  // Save changes in one place, only when an action succeeds.
  const savePlans = (updatedPlans) => {
    try {
      localStorage.setItem("plans", JSON.stringify(updatedPlans));
    } catch (error) {
      console.error("Unable to save plans:", error);

      setToast({
        message: "Unable to save plans. Please try again.",
        type: "error",
      });

      return false;
    }

    setPlans(updatedPlans);

    // Notify other pages, but this component does not listen
    // to this event, so it cannot trigger its own update loop.
    window.dispatchEvent(new Event("saasDataUpdated"));

    return true;
  };

  // Listen only for changes made in another browser tab.
  useEffect(() => {
    const syncPlans = () => {
      setPlans(getSavedPlans());
    };

    window.addEventListener("storage", syncPlans);

    return () => {
      window.removeEventListener("storage", syncPlans);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Automatically close toast notifications.
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required.";
    }

    if (
      formData.monthlyPrice === "" ||
      !Number.isFinite(Number(formData.monthlyPrice)) ||
      Number(formData.monthlyPrice) < 0
    ) {
      newErrors.monthlyPrice =
        "Enter a valid monthly price (0 or more).";
    }

    if (
      formData.yearlyPrice === "" ||
      !Number.isFinite(Number(formData.yearlyPrice)) ||
      Number(formData.yearlyPrice) < 0
    ) {
      newErrors.yearlyPrice =
        "Enter a valid yearly price (0 or more).";
    }

    if (!["Active", "Inactive"].includes(formData.status)) {
      newErrors.status = "Please select a valid status.";
    }

    const features = formData.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (features.length === 0) {
      newErrors.features = "Enter at least one plan feature.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setErrors({});
    setShowPlanForm(false);
    setEditingPlan(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowPlanForm(true);
  };

  const openEditForm = (plan) => {
    setFormData({
      name: plan.name,
      monthlyPrice: String(plan.monthlyPrice),
      yearlyPrice: String(plan.yearlyPrice),
      status: plan.status,
      features: (plan.features || []).join("\n"),
    });

    setErrors({});
    setShowPlanForm(false);
    setEditingPlan(plan);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const maxId = plans.reduce((max, plan) => {
      const numericId = Number(String(plan.id).replace("PL", ""));
      return Math.max(max, numericId || 0);
    }, 1000);

    const newPlan = {
      id: `PL${maxId + 1}`,
      name: formData.name.trim(),
      monthlyPrice: Number(formData.monthlyPrice),
      yearlyPrice: Number(formData.yearlyPrice),
      status: formData.status,
      subscribers: 0,
      features: formData.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
    };

    if (!savePlans([...plans, newPlan])) return;

    trackUsage("Plan Added", newPlan.name);
    resetForm();

    setToast({
      message: "Plan added successfully!",
      type: "success",
    });
  };

  const handleEditPlan = (e) => {
    e.preventDefault();

    if (!editingPlan || !validateForm()) return;

    const updatedPlans = plans.map((plan) =>
      plan.id === editingPlan.id
        ? {
            ...plan,
            name: formData.name.trim(),
            monthlyPrice: Number(formData.monthlyPrice),
            yearlyPrice: Number(formData.yearlyPrice),
            status: formData.status,
            features: formData.features
              .split("\n")
              .map((feature) => feature.trim())
              .filter(Boolean),
          }
        : plan
    );

    if (!savePlans(updatedPlans)) return;

    trackUsage("Plan Updated", formData.name.trim());
    resetForm();

    setToast({
      message: "Plan updated successfully!",
      type: "success",
    });
  };

  const handleDeletePlan = () => {
    if (!deletePlan) return;

    const deletedPlan = deletePlan;

    const updatedPlans = plans.filter(
      (plan) => plan.id !== deletedPlan.id
    );

    if (!savePlans(updatedPlans)) return;

    trackUsage("Plan Deleted", deletedPlan.name);
    setDeletePlan(null);

    setToast({
      message: "Plan deleted successfully!",
      type: "success",
    });
  };

  const filteredPlans = plans.filter((plan) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      plan.name.toLowerCase().includes(search) ||
      plan.id.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || plan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.monthlyPrice - b.monthlyPrice;
      case "price-desc":
        return b.monthlyPrice - a.monthlyPrice;
      case "subscribers-asc":
        return a.subscribers - b.subscribers;
      case "subscribers-desc":
        return b.subscribers - a.subscribers;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedPlans.length / plansPerPage);
  const startIndex = (currentPage - 1) * plansPerPage;

  const currentPlans = sortedPlans.slice(
    startIndex,
    startIndex + plansPerPage
  );

  const mostPopularPlan = plans.reduce(
    (popular, plan) =>
      !popular || plan.subscribers > popular.subscribers
        ? plan
        : popular,
    null
  );

  return (
    <div className="plans-page">
      <section className="plans-header-section">
        <div className="plans-header-content">
          <h1>Plans</h1>
          <p>
            Manage subscription plans, pricing, features, and billing cycles.
          </p>
        </div>

        <button
          type="button"
          className="add-plan-button"
          onClick={openAddForm}
        >
          Add New Plan
        </button>
      </section>

      <section className="plans-summary-section">
        <div className="plans-summary-cards">
          <div className="plans-summary-card">
            <div className="plans-summary-info">
              <p>Total Plans</p>
              <h2>{plans.length}</h2>
            </div>
            <span className="plans-summary-icon total-plans-icon">💳</span>
          </div>

          <div className="plans-summary-card">
            <div className="plans-summary-info">
              <p>Active Plans</p>
              <h2>{plans.filter((plan) => plan.status === "Active").length}</h2>
            </div>
            <span className="plans-summary-icon active-plans-icon">✓</span>
          </div>

          <div className="plans-summary-card">
            <div className="plans-summary-info">
              <p>Inactive Plans</p>
              <h2>{plans.filter((plan) => plan.status === "Inactive").length}</h2>
            </div>
            <span className="plans-summary-icon inactive-plans-icon">🔴</span>
          </div>

          <div className="plans-summary-card">
            <div className="plans-summary-info">
              <p>Most Popular Plan</p>
              <h2>{mostPopularPlan?.name || "—"}</h2>
            </div>
            <span className="plans-summary-icon popular-plans-icon">★</span>
          </div>
        </div>
      </section>

      <section className="plans-listing-section">
        <div className="plans-listing-header">
          <div>
            <h2>Available Plans</h2>
            <p>Explore pricing, features, and subscription details.</p>
          </div>

          <input
            type="search"
            className="plans-search-input"
            placeholder="Search by plan name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search plans by name or ID"
          />

          <select
            className="plans-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter plans by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="plans-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort plans"
          >
            <option value="default">Default Order</option>
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="subscribers-desc">Subscribers: Most First</option>
            <option value="subscribers-asc">Subscribers: Fewest First</option>
          </select>
        </div>

        <div className="plans-listing-grid">
          {currentPlans.map((plan) => (
            <article className="plan-card" key={plan.id}>
              <div className="plan-card-header">
                <div>
                  <h3>{plan.name}</h3>
                  <p className="plan-id">{plan.id}</p>
                </div>

                <span className={`plan-status ${plan.status.toLowerCase()}`}>
                  {plan.status}
                </span>
              </div>

              <div className="plan-price">
                <div>
                  <h2>₹{plan.monthlyPrice.toLocaleString("en-IN")}</h2>
                  <span>/ month</span>
                </div>
                <div>
                  <h2>₹{plan.yearlyPrice.toLocaleString("en-IN")}</h2>
                  <span>/ year</span>
                </div>
              </div>

              <div className="plan-features">
                <h4>Features include</h4>
                <ul>
                  {(plan.features || []).map((feature, index) => (
                    <li key={`${plan.id}-${index}`}>
                      <span className="plan-feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-subscriber-info">
                <span>Subscribers</span>
                <strong>{plan.subscribers}</strong>
              </div>

              <div className="plan-card-actions">
                <button
                  type="button"
                  className="plan-view-button"
                  onClick={() => setSelectedPlan(plan)}
                >
                  View
                </button>
                <button
                  type="button"
                  className="plan-edit-button"
                  onClick={() => openEditForm(plan)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="plan-delete-button"
                  onClick={() => setDeletePlan(plan)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <p className="plans-empty-message">
            No plans found. Try another search.
          </p>
        )}
      </section>

      {sortedPlans.length > 0 && (
        <div className="plans-pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span>
            Page {Math.min(currentPage, totalPages)} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      {(showPlanForm || editingPlan) && (
        <div className="plan-modal-overlay">
          <div
            className="plan-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-form-title"
          >
            <h2 id="plan-form-title">
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </h2>

            <form
              noValidate
              onSubmit={editingPlan ? handleEditPlan : handleAddPlan}
            >
              <label htmlFor="plan-name">Plan Name</label>
              <input
                id="plan-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter plan name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "plan-name-error" : undefined}
              />
              {errors.name && <p id="plan-name-error" className="form-error">{errors.name}</p>}

              <label htmlFor="monthly-price">Monthly Price</label>
              <input
                id="monthly-price"
                type="number"
                name="monthlyPrice"
                value={formData.monthlyPrice}
                onChange={handleFormChange}
                placeholder="Enter monthly price"
                min="0"
                step="any"
                aria-invalid={Boolean(errors.monthlyPrice)}
                aria-describedby={errors.monthlyPrice ? "monthly-price-error" : undefined}
              />
              {errors.monthlyPrice && <p id="monthly-price-error" className="form-error">{errors.monthlyPrice}</p>}

              <label htmlFor="yearly-price">Yearly Price</label>
              <input
                id="yearly-price"
                type="number"
                name="yearlyPrice"
                value={formData.yearlyPrice}
                onChange={handleFormChange}
                placeholder="Enter yearly price"
                min="0"
                step="any"
                aria-invalid={Boolean(errors.yearlyPrice)}
                aria-describedby={errors.yearlyPrice ? "yearly-price-error" : undefined}
              />
              {errors.yearlyPrice && <p id="yearly-price-error" className="form-error">{errors.yearlyPrice}</p>}

              <label htmlFor="plan-status">Status</label>
              <select
                id="plan-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                aria-invalid={Boolean(errors.status)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <p className="form-error">{errors.status}</p>}

              <label htmlFor="plan-features">Features (one per line)</label>
              <textarea
                id="plan-features"
                name="features"
                value={formData.features}
                onChange={handleFormChange}
                placeholder={"Email support\n5 GB storage\nBasic reports"}
                aria-invalid={Boolean(errors.features)}
                aria-describedby={errors.features ? "plan-features-error" : undefined}
              />
              {errors.features && <p id="plan-features-error" className="form-error">{errors.features}</p>}

              <div className="plan-modal-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-button">
                  {editingPlan ? "Save Changes" : "Add Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="plan-modal-overlay">
          <div
            className="plan-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-plan-title"
          >
            <h2 id="view-plan-title">Plan Details</h2>
            <p><strong>Plan ID:</strong> {selectedPlan.id}</p>
            <p><strong>Plan Name:</strong> {selectedPlan.name}</p>
            <p><strong>Monthly Price:</strong> ₹{selectedPlan.monthlyPrice.toLocaleString("en-IN")}</p>
            <p><strong>Yearly Price:</strong> ₹{selectedPlan.yearlyPrice.toLocaleString("en-IN")}</p>
            <p><strong>Status:</strong> {selectedPlan.status}</p>
            <p><strong>Subscribers:</strong> {selectedPlan.subscribers}</p>

            <h3>Features</h3>
            <ul>
              {(selectedPlan.features || []).map((feature, index) => (
                <li key={`${selectedPlan.id}-${index}`}>{feature}</li>
              ))}
            </ul>

            <div className="plan-modal-actions">
              <button
                type="button"
                className="modal-save-button"
                onClick={() => setSelectedPlan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePlan && (
        <div className="plan-modal-overlay">
          <div
            className="plan-modal delete-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-plan-title"
          >
            <h2 id="delete-plan-title">Delete Plan</h2>
            <p>
              Are you sure you want to delete <strong>{deletePlan.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="plan-modal-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => setDeletePlan(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="plan-delete-button"
                onClick={handleDeletePlan}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
 