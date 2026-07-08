import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  BarChart3, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle
} from "lucide-react";
import { 
  getOrganizations, 
  createOrganization, 
  updateOrganization, 
  deleteOrganization, 
  getOrganizationAnalytics,
} from "../services/organizationApi";
import type {
  Organization,
  OrganizationAnalytics
} from "../services/organizationApi";



const ITEMS_PER_PAGE = 5;

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "delete" | "analytics" | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Forms state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [formError, setFormError] = useState("");

  const fetchOrgs = () => {
    setLoading(true);
    // Fetch a slightly larger batch to handle local pagination calculation, 
    // or run with skip & limit.
    const skip = (page - 1) * ITEMS_PER_PAGE;
    getOrganizations(search, skip, ITEMS_PER_PAGE + 1)
      .then((data) => {
        if (data.length > ITEMS_PER_PAGE) {
          setOrganizations(data.slice(0, ITEMS_PER_PAGE));
          setTotalPages(page + 1);
        } else {
          setOrganizations(data);
          setTotalPages(page);
        }
      })
      .catch((err) => console.error("Error fetching organizations:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, [search, page]);

  // Open modals
  const handleOpenAdd = () => {
    setName("");
    setAddress("");
    setEmail("");
    setPhone("");
    setContactPerson("");
    setFormError("");
    setActiveModal("add");
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setName(org.name);
    setAddress(org.address || "");
    setEmail(org.email || "");
    setPhone(org.phone || "");
    setContactPerson(org.contact_person || "");
    setFormError("");
    setActiveModal("edit");
  };

  const handleOpenDelete = (org: Organization) => {
    setSelectedOrg(org);
    setActiveModal("delete");
  };

  const handleOpenAnalytics = (org: Organization) => {
    setSelectedOrg(org);
    setAnalytics(null);
    setLoadingAnalytics(true);
    setActiveModal("analytics");
    getOrganizationAnalytics(org.id)
      .then(setAnalytics)
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoadingAnalytics(false));
  };

  // Submit operations
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Organization Name is required");
      return;
    }
    setFormError("");
    try {
      await createOrganization({
        name,
        address: address || undefined,
        email: email || undefined,
        phone: phone || undefined,
        contact_person: contactPerson || undefined
      });
      setActiveModal(null);
      fetchOrgs();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to create organization");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    if (!name.trim()) {
      setFormError("Organization Name is required");
      return;
    }
    setFormError("");
    try {
      await updateOrganization(selectedOrg.id, {
        name,
        address: address || undefined,
        email: email || undefined,
        phone: phone || undefined,
        contact_person: contactPerson || undefined
      });
      setActiveModal(null);
      fetchOrgs();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to update organization");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedOrg) return;
    try {
      await deleteOrganization(selectedOrg.id);
      setActiveModal(null);
      // Reset page if it was empty
      if (organizations.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchOrgs();
      }
    } catch (err) {
      console.error("Failed to delete organization", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Organizations
          </h1>
          <p className="text-gray-500 mt-2">Manage partner organizations and view spatial analytics</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Organization
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, address, contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="text-sm text-gray-500">
          Showing page {page}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center p-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No organizations found</h2>
            <p className="text-gray-500">Get started by adding a partner organization</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Address</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{org.name}</td>
                    <td className="p-4">{org.contact_person || "-"}</td>
                    <td className="p-4">{org.email || "-"}</td>
                    <td className="p-4">{org.phone || "-"}</td>
                    <td className="p-4 max-w-xs truncate">{org.address || "-"}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAnalytics(org)}
                          title="View Analytics"
                          className="p-2 border border-gray-100 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow transition-all"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(org)}
                          title="Edit"
                          className="p-2 border border-gray-100 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(org)}
                          title="Delete"
                          className="p-2 border border-gray-100 rounded-lg hover:bg-white hover:text-red-500 hover:shadow transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && organizations.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 pl-6 pr-6 bg-gray-55 text-sm">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 font-medium px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="text-gray-500">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages && totalPages === page}
              className="flex items-center gap-1 font-medium px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {activeModal === "add" && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center gap-3 p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                <Building2 className="w-5 h-5 text-blue-500" />
                Add New Organization
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GreenSpace Alliance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@greenspace.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Address</label>
                <input
                  type="text"
                  placeholder="123 Eco Way, Cityville"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
                >
                  Save Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {activeModal === "edit" && selectedOrg && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center gap-3 p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Edit Organization
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GreenSpace Alliance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@greenspace.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Address</label>
                <input
                  type="text"
                  placeholder="123 Eco Way, Cityville"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {activeModal === "delete" && selectedOrg && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Organization?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-850">"{selectedOrg.name}"</span>? 
                This action cannot be undone and will disassociate any items tied to this organization.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="flex-1 py-3 font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {activeModal === "analytics" && selectedOrg && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center gap-3 p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Spatial Analytics
                </h2>
                <p className="text-xs text-gray-500 mt-1">{selectedOrg.name}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {loadingAnalytics ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Compiling statistics...</p>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Mini cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Spaces Managed</p>
                      <p className="text-3xl font-extrabold text-blue-900 mt-2">{analytics.total_public_spaces}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 p-5 rounded-2xl">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Average Quality Score</p>
                      <p className="text-3xl font-extrabold text-green-900 mt-2">{analytics.average_survey_score} / 100</p>
                    </div>
                  </div>

                  {/* Condition breakdowns */}
                  <div className="border border-gray-105/60 p-5 rounded-2xl bg-white shadow-sm">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase">Condition Breakdown</h4>
                    
                    <div className="space-y-4">
                      {/* Good */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-green-600 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Good: {analytics.condition_breakdown.Good}
                          </span>
                          <span className="text-gray-500">
                            {analytics.total_public_spaces > 0 
                              ? Math.round((analytics.condition_breakdown.Good / analytics.total_public_spaces) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${analytics.total_public_spaces > 0 
                                ? (analytics.condition_breakdown.Good / analytics.total_public_spaces) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Fair */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-yellow-600 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Fair: {analytics.condition_breakdown.Fair}
                          </span>
                          <span className="text-gray-500">
                            {analytics.total_public_spaces > 0 
                              ? Math.round((analytics.condition_breakdown.Fair / analytics.total_public_spaces) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${analytics.total_public_spaces > 0 
                                ? (analytics.condition_breakdown.Fair / analytics.total_public_spaces) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Poor */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-red-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Poor: {analytics.condition_breakdown.Poor}
                          </span>
                          <span className="text-gray-500">
                            {analytics.total_public_spaces > 0 
                              ? Math.round((analytics.condition_breakdown.Poor / analytics.total_public_spaces) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${analytics.total_public_spaces > 0 
                                ? (analytics.condition_breakdown.Poor / analytics.total_public_spaces) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Unknown */}
                      {analytics.condition_breakdown.Unknown > 0 && (
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Unknown: {analytics.condition_breakdown.Unknown}
                            </span>
                            <span className="text-gray-500">
                              {analytics.total_public_spaces > 0 
                                ? Math.round((analytics.condition_breakdown.Unknown / analytics.total_public_spaces) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-gray-400 h-2 rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${analytics.total_public_spaces > 0 
                                  ? (analytics.condition_breakdown.Unknown / analytics.total_public_spaces) * 100 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-red-500">
                  Failed to load analytics data
                </div>
              )}
              
              <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-705 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
