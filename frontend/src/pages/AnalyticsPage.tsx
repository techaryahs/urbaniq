import { useEffect, useState } from "react";

import ConditionPieChart from "../components/Charts/ConditionPieChart";
import OrganizationBarChart from "../components/Charts/OrganizationBarChart";
import BufferChart from "../components/Charts/BufferChart";
import SurveyLineChart from "../components/Charts/SurveyLineChart";
import StatCard from "../components/Card/StatCard";

import {
  getAnalyticsSummary,
  getAnalyticsMonthly,
  getAnalyticsBuffer,
} from "../services/analyticsApi";

import type { AnalyticsSummary } from "../services/analyticsApi";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsMonthly(),
      getAnalyticsBuffer(),
    ])
      .then(([summaryData]) => {
        setSummary(summaryData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          GIS Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Executive insights powered by PostgreSQL + PostGIS
        </p>
      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <StatCard
          title="Total Public Spaces"
          value={summary.total_public_spaces || summary.total_parks}
          icon="parks"
        />

        <StatCard title="Good Spaces" value={summary.good} icon="good" />

        <StatCard title="Fair Spaces" value={summary.fair} icon="fair" />

        <StatCard title="Poor Spaces" value={summary.poor} icon="poor" />

        <StatCard
          title="Organizations"
          value={summary.organizations}
          icon="organization"
        />

        <StatCard
          title="Avg Survey"
          value={`${summary.average_survey_score}%`}
          icon="survey"
        />
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 min-w-0">
          <h3 className="text-xl font-semibold mb-5 text-center">
            Public Space Condition Distribution
          </h3>

          <div className="h-64 sm:h-80">
            <ConditionPieChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 min-w-0">
          <h3 className="text-xl font-semibold mb-5 text-center">
            Public Spaces by Organization
          </h3>

          <div className="h-64 sm:h-80">
            <OrganizationBarChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 min-w-0">
          <h3 className="text-xl font-semibold mb-5 text-center">
            Citizen Survey Trends
          </h3>

          <div className="h-64 sm:h-80">
            <SurveyLineChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 min-w-0">
          <h3 className="text-xl font-semibold mb-5 text-center">
            Buffer Analysis Overview
          </h3>

          <div className="h-64 sm:h-80">
            <BufferChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
