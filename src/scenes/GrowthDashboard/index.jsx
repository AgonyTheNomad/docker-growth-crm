import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { RefreshCw, AlertCircle, Users, Building2, ChartBar, Calendar } from "lucide-react";
import { FRANCHISE_OPTIONS } from "../../scenes/GrowthTracker/constants/index";
import { constructUrl, authFetch } from "../../utils/apiUtils";

// Appointment Card Component
const AppointmentCard = ({ clientName, appointmentDate }) => (
  <div className="bg-[#1e293b] rounded-lg p-6">
    <div className="flex items-center justify-center space-x-2 mb-2">
      <Calendar className="h-4 w-4 text-gray-400" />
      <h3 className="text-sm text-gray-400">{clientName}</h3>
    </div>
    <div className="text-white text-center">
      {appointmentDate}
    </div>
  </div>
);

// Metric Card Component
const MetricCard = ({ title, value }) => (
  <div className="bg-[#1e293b] rounded-lg p-6">
    <div className="text-sm text-gray-400 mb-2 text-center">{title}</div>
    <div className="text-2xl font-bold text-white text-center">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

// Section Header Component
const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-start space-x-2 mb-4">
    {Icon && <Icon className="h-5 w-5 text-gray-900 mt-1" />}
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  </div>
);

// Metric Section Component
const MetricSection = ({ title, metrics, icon: Icon }) => {
  const itemCount = Object.keys(metrics).length;
  const gridCols = itemCount <= 2 ? 'md:grid-cols-2' : 
                   itemCount === 3 ? 'md:grid-cols-3' : 
                   'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <SectionHeader title={title} icon={Icon} />
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {Object.entries(metrics).map(([key, value]) => (
          <MetricCard key={key} title={key} value={value} />
        ))}
      </div>
    </div>
  );
};

// Main Growth Dashboard Component
const GrowthDashboard = () => {
  const [data, setData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFranchise, setSelectedFranchise] = useState(FRANCHISE_OPTIONS[0].value);
  const [activePeriod, setActivePeriod] = useState("Month");

  // Fetch growth metrics with updated path
  const fetchGrowthMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = constructUrl(`/api/analytics/growth-dashboard?franchise_code=${selectedFranchise}`);
      console.log('Growth metrics URL:', url); // For debugging
      const result = await authFetch(url, { method: 'GET' });
      setData(result);
    } catch (err) {
      console.error("Error fetching growth metrics:", err);
      setError("Failed to fetch growth metrics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming appointments with updated path
  const fetchUpcomingAppointments = async () => {
    try {
      const url = constructUrl(`/api/analytics/upcoming-appointments?franchise_code=${selectedFranchise}`);
      console.log('Appointments URL:', url); // For debugging
      const result = await authFetch(url, { method: 'GET' });
      setUpcomingAppointments(result);
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
    }
  };

  useEffect(() => {
    fetchGrowthMetrics();
    fetchUpcomingAppointments();
  }, [selectedFranchise]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0f172a]">
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw className="animate-spin h-5 w-5" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0f172a]">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const groupedMetrics = data?.growth_metrics ? {
    activeClients: {
      "Currently Paired Clients": data.growth_metrics["Currently Paired Clients"],
      "Currently Paired w/ Awaiting": data.growth_metrics["Currently Paired Clients w/ Awaiting Replacement"],
      "TOTAL no. of Clients Paying MSF": data.growth_metrics["TOTAL no. of Clients Paying MSF"],
    },
    clientTypes: {
      "MAPS Clients": data.growth_metrics["MAPS Clients"],
      "KW Clients": data.growth_metrics["KW Clients"],
      "Other Clients": data.growth_metrics["Other Clients"],
    },
    statusMetrics: {
      "Clients on Hold": data.growth_metrics["Clients on Hold"],
      "Suspended Clients": data.growth_metrics["Suspended Clients"],
      "Pending On Hold": data.growth_metrics["Pending On Hold"],
      "Pending Cancellation": data.growth_metrics["Pending Cancellation"],
      "TOTAL no. of Clients": data.growth_metrics["TOTAL no. of Clients"],
    },
  } : null;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Growth Dashboard</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleString()}</p>
        </div>

        {/* Franchise Selector */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="franchise-selector">
            Select Franchise
          </label>
          <select
            id="franchise-selector"
            value={selectedFranchise}
            onChange={(e) => setSelectedFranchise(e.target.value)}
            className="w-full p-2 bg-white text-black rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {FRANCHISE_OPTIONS.map((franchise) => (
              <option key={franchise.value} value={franchise.value}>
                {franchise.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution and Key Metrics */}
          <div className="bg-white rounded-lg p-6">
            <SectionHeader title="Status Distribution & Key Metrics" icon={ChartBar} />
            
            {/* Period Filter Buttons */}
            <div className="flex gap-2 mb-6">
              {["Week", "Month", "Year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    activePeriod === period
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Status Table */}
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.status_metrics?.[activePeriod]?.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 ${
                        item.status === "Key Target Demographics" || 
                        item.status === "Knows Cyberbacker" 
                          ? "bg-blue-50" 
                          : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {item.status}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!data?.status_metrics?.[activePeriod] || data.status_metrics[activePeriod].length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No status data available for this period.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg p-6">
            <SectionHeader title="Upcoming Appointments" icon={Calendar} />
            <div className="grid grid-cols-1 gap-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment, index) => (
                  <AppointmentCard
                    key={index}
                    clientName={appointment.client_name}
                    appointmentDate={appointment.appointment_set_date}
                  />
                ))
              ) : (
                <p className="text-gray-500">No upcoming appointments available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        {groupedMetrics && (
          <>
            <MetricSection 
              title="Active Clients" 
              metrics={groupedMetrics.activeClients}
              icon={Users}
            />
            <MetricSection 
              title="Client Types" 
              metrics={groupedMetrics.clientTypes}
              icon={Building2}
            />
            <MetricSection 
              title="Status Metrics" 
              metrics={groupedMetrics.statusMetrics}
              icon={ChartBar}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default GrowthDashboard;