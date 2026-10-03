// src/pages/FacultyAnalytics.js

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FiActivity,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiRefreshCw,
  FiCalendar,
  FiTarget,
} from "react-icons/fi";

import "./FacultyAnalytics.css";


// ============================================================
// API
// ============================================================

// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || "";

import { API_BASE_URL } from "../config";

const emptyAnalytics = {
  summary: {
    totalPublications: 0,
    approvedUIDs: 0,
    pendingUIDs: 0,
    approvedPIDs: 0,
    pendingPIDs: 0,
    coAuthoredPapers: 0,
    researchYears: 0,
  },

  publicationTrend: [],

  publicationTypes: [],

  yearlyOutput: [],

  uidJourney: [],

  collaboration: [],

  researchGrowth: [],

  researchTypes: [],

  approvalStatus: [],

  monthlyActivity: [],

  growthRate: [],

  recentPublications: [],
};


// ============================================================
// SMALL HELPERS
// ============================================================

const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};


const percentage = (value) => {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(n)));
};


// ============================================================
// TOOLTIP
// ============================================================

const ChartTooltip = ({ active, payload, label }) => {

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="fa-tooltip">

      <div className="fa-tooltip-title">
        {label}
      </div>

      {payload.map((item, index) => (
        <div
          className="fa-tooltip-row"
          key={`${item.dataKey}-${index}`}
        >

          <span
            className="fa-tooltip-dot"
            style={{
              backgroundColor: item.color || "#6366f1",
            }}
          />

          <span className="fa-tooltip-label">
            {item.name || item.dataKey}
          </span>

          <strong>
            {item.value}
          </strong>

        </div>
      ))}

    </div>
  );
};


// ============================================================
// CUSTOM DONUT LABEL
// ============================================================

const DonutCenter = ({ total }) => {

  return (
    <div className="fa-donut-center">

      <strong>
        {total}
      </strong>

      <span>
        Publications
      </span>

    </div>
  );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FacultyAnalytics({ userId }) {

  const [analytics, setAnalytics] =
    useState(emptyAnalytics);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [period, setPeriod] =
    useState("monthly");


  // ==========================================================
  // FETCH FACULTY ANALYTICS
  // ==========================================================

  const fetchAnalytics = async () => {

    if (!userId) {
      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/faculty/analytics/${userId}`
      );

      const data = response?.data || {};

      setAnalytics({
        ...emptyAnalytics,
        ...data,

        summary: {
          ...emptyAnalytics.summary,
          ...(data.summary || {}),
        },

        publicationTrend:
          data.publicationTrend || [],

        publicationTypes:
          data.publicationTypes || [],

        yearlyOutput:
          data.yearlyOutput || [],

        uidJourney:
          data.uidJourney || [],

        collaboration:
          data.collaboration || [],

        researchGrowth:
          data.researchGrowth || [],

        researchTypes:
          data.researchTypes || [],

        approvalStatus:
          data.approvalStatus || [],

        monthlyActivity:
          data.monthlyActivity || [],

        growthRate:
          data.growthRate || [],

        recentPublications:
          data.recentPublications || [],
      });

    } catch (err) {

      console.error(
        "Faculty analytics error:",
        err
      );

      setError(
        "Unable to load your research analytics."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchAnalytics();

  }, [userId]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = analytics.summary || {};

  const totalPublications =
    number(summary.totalPublications);


  // ==========================================================
  // PUBLICATION TYPES
  // ==========================================================

  const publicationTypes =
    analytics.publicationTypes || [];

  const publicationTypeTotal =
    publicationTypes.reduce(
      (total, item) =>
        total + number(item.value),
      0
    );


  // ==========================================================
  // CURRENT TREND
  // ==========================================================

  const trendData =
    period === "yearly"
      ? analytics.yearlyOutput
      : analytics.publicationTrend;


  // ==========================================================
  // APPROVAL RATE
  // ==========================================================

  const totalApprovalItems =
    number(summary.approvedUIDs) +
    number(summary.pendingUIDs) +
    number(summary.approvedPIDs) +
    number(summary.pendingPIDs);

  const totalApproved =
    number(summary.approvedUIDs) +
    number(summary.approvedPIDs);

  const approvalRate =
    totalApprovalItems > 0
      ? Math.round(
          (totalApproved /
            totalApprovalItems) *
            100
        )
      : 0;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="faculty-analytics-page">

        <div className="fa-loading">

          <div className="fa-loading-spinner">
            <FiRefreshCw />
          </div>

          <h3>
            Preparing your analytics
          </h3>

          <p>
            Gathering your research activity...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="faculty-analytics-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="fa-header">

        <div className="fa-header-content">

          <div className="fa-eyebrow">
            <span className="fa-eyebrow-icon">
              <FiActivity />
            </span>

            PERSONAL RESEARCH ANALYTICS
          </div>

          <h1>
            My Research Analytics
          </h1>

          <p>
            Track your publications, research progress,
            collaborations and academic activity.
          </p>

        </div>


        <div className="fa-header-actions">

          <div className="fa-live-status">
            <span className="fa-live-dot" />
            Live Data
          </div>

          <button
            className="fa-refresh-btn"
            onClick={fetchAnalytics}
            title="Refresh analytics"
          >
            <FiRefreshCw />

            <span>
              Refresh
            </span>
          </button>

        </div>

      </section>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="fa-error-banner">

          <FiActivity />

          <span>
            {error}
          </span>

          <button
            onClick={fetchAnalytics}
          >
            Try Again
          </button>

        </div>

      )}


      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section className="fa-kpi-grid">


        {/* PUBLICATIONS */}

        <div className="fa-kpi-card fa-kpi-purple">

          <div className="fa-kpi-top">

            <span className="fa-kpi-icon">
              <FiBookOpen />
            </span>

            <span className="fa-kpi-caption">
              Research Output
            </span>

          </div>

          <strong className="fa-kpi-value">
            {totalPublications}
          </strong>

          <span className="fa-kpi-label">
            Total Publications
          </span>

          <div className="fa-kpi-decoration" />

        </div>


        {/* APPROVED UID */}

        <div className="fa-kpi-card fa-kpi-blue">

          <div className="fa-kpi-top">

            <span className="fa-kpi-icon">
              <FiCheckCircle />
            </span>

            <span className="fa-kpi-caption">
              Research Identity
            </span>

          </div>

          <strong className="fa-kpi-value">
            {number(summary.approvedUIDs)}
          </strong>

          <span className="fa-kpi-label">
            Approved UIDs
          </span>

          <div className="fa-kpi-decoration" />

        </div>


        {/* APPROVAL RATE */}

        <div className="fa-kpi-card fa-kpi-cyan">

          <div className="fa-kpi-top">

            <span className="fa-kpi-icon">
              <FiTarget />
            </span>

            <span className="fa-kpi-caption">
              Performance
            </span>

          </div>

          <strong className="fa-kpi-value">
            {approvalRate}%
          </strong>

          <span className="fa-kpi-label">
            Approval Rate
          </span>

          <div className="fa-kpi-decoration" />

        </div>


        {/* RESEARCH YEARS */}

        <div className="fa-kpi-card fa-kpi-orange">

          <div className="fa-kpi-top">

            <span className="fa-kpi-icon">
              <FiAward />
            </span>

            <span className="fa-kpi-caption">
              Academic Journey
            </span>

          </div>

          <strong className="fa-kpi-value">
            {number(summary.researchYears)}
          </strong>

          <span className="fa-kpi-label">
            Active Research Years
          </span>

          <div className="fa-kpi-decoration" />

        </div>

      </section>


      {/* ======================================================
          HERO ROW
      ====================================================== */}

      <section className="fa-main-grid">


        {/* ====================================================
            1. PUBLICATION ACTIVITY — WAVE CHART
        ==================================================== */}

        <div className="fa-card fa-trend-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                RESEARCH ACTIVITY
              </span>

              <h2>
                Publication Activity
              </h2>

              <p>
                Your research output over time
              </p>

            </div>


            <div className="fa-period-toggle">

              <button
                className={
                  period === "monthly"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPeriod("monthly")
                }
              >
                Monthly
              </button>

              <button
                className={
                  period === "yearly"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPeriod("yearly")
                }
              >
                Yearly
              </button>

            </div>

          </div>


          <div className="fa-wave-chart">

            {trendData.length > 0 ? (

              <AreaChart
                    width={760}
                    height={320}
                    data={trendData}
                  margin={{
                    top: 15,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="faPublicationWave"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.38}
                      />

                      <stop
                        offset="55%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.16}
                      />

                      <stop
                        offset="100%"
                        stopColor="#a78bfa"
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />


                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#8a93a5",
                      fontSize: 12,
                    }}
                  />


                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#8a93a5",
                      fontSize: 12,
                    }}
                  />


                  <Tooltip
                    content={<ChartTooltip />}
                  />


                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Publications"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#faPublicationWave)"
                    dot={{
                      r: 4,
                      fill: "#6366f1",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#6366f1",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                  />

                </AreaChart>


            ) : (

              <div className="fa-empty-chart">
                <FiBookOpen />
                <span>
                  No publication activity available yet.
                </span>
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            2. PUBLICATION MIX — DONUT
        ==================================================== */}

        <div className="fa-card fa-donut-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                PUBLICATION PROFILE
              </span>

              <h2>
                Publication Mix
              </h2>

              <p>
                Distribution of your research output
              </p>

            </div>

          </div>


          <div className="fa-donut-content">

            {publicationTypes.length > 0 ? (

              <div className="fa-donut-chart">

               <PieChart
  width={390}
  height={250}
>

                    <Pie
                      data={publicationTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={102}
                      paddingAngle={4}
                      stroke="none"
                    >

                      {publicationTypes.map(
                        (entry, index) => (

                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#6366f1",
                                "#ec4899",
                                "#06b6d4",
                                "#f59e0b",
                                "#10b981",
                              ][
                                index %
                                  5
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      content={<ChartTooltip />}
                    />

                  </PieChart>



                <DonutCenter
                  total={
                    publicationTypeTotal
                  }
                />

              </div>

            ) : (

              <div className="fa-empty-chart">
                <FiFileText />
                <span>
                  No publication type data available.
                </span>
              </div>

            )}


            <div className="fa-donut-legend">

              {publicationTypes.map(
                (item, index) => {

                  const colors = [
                    "#6366f1",
                    "#ec4899",
                    "#06b6d4",
                    "#f59e0b",
                    "#10b981",
                  ];

                  const itemValue =
                    number(item.value);

                  const itemPercentage =
                    publicationTypeTotal >
                    0
                      ? Math.round(
                          (itemValue /
                            publicationTypeTotal) *
                            100
                        )
                      : 0;

                  return (

                    <div
                      className="fa-legend-item"
                      key={`${item.name}-${index}`}
                    >

                      <span
                        className="fa-legend-dot"
                        style={{
                          background:
                            colors[
                              index %
                                colors.length
                            ],
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {itemPercentage}%
                      </strong>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          SECOND ROW
      ====================================================== */}

      <section className="fa-three-grid">


        {/* ====================================================
            3. YEARLY OUTPUT
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                OUTPUT
              </span>

              <h2>
                Yearly Research Output
              </h2>

            </div>

          </div>


          <div className="fa-small-chart">

            {analytics.yearlyOutput.length > 0 ? (

             <BarChart
  width={400}
  height={250}
  data={analytics.yearlyOutput}
>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Bar
                    dataKey="value"
                    name="Publications"
                    fill="#6366f1"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>


            ) : (

              <div className="fa-empty-chart">
                No yearly data available.
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            4. UID JOURNEY
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                WORKFLOW
              </span>

              <h2>
                UID Approval Journey
              </h2>

            </div>

          </div>


          <div className="fa-journey">

            {analytics.uidJourney.length > 0 ? (

              analytics.uidJourney.map(
                (item, index) => (

                  <div
                    className="fa-journey-item"
                    key={`${item.label}-${index}`}
                  >

                    <div className="fa-journey-number">
                      {index + 1}
                    </div>

                    <div className="fa-journey-content">

                      <div className="fa-journey-heading">

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {number(item.value)}
                        </strong>

                      </div>

                      <div className="fa-journey-track">

                        <div
                          className="fa-journey-fill"
                          style={{
                            width: `${percentage(
                              item.percentage
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                )
              )

            ) : (

              <div className="fa-empty-small">
                No UID journey data available.
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            5. COLLABORATION
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                COLLABORATION
              </span>

              <h2>
                Co-author Activity
              </h2>

            </div>

          </div>


          <div className="fa-small-chart">

            {analytics.collaboration.length >
            0 ? (

              <BarChart
  width={400}
  height={250}
                  data={
                    analytics.collaboration
                  }
                  layout="vertical"
                  margin={{
                    left: 15,
                    right: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#edf0f6"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="label"
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Bar
                    dataKey="value"
                    name="Papers"
                    fill="#ec4899"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />

                </BarChart>


            ) : (

              <div className="fa-empty-chart">
                <FiUsers />
                No collaboration data available.
              </div>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          THIRD ROW
      ====================================================== */}

      <section className="fa-main-grid">


        {/* ====================================================
            6. RESEARCH GROWTH — WAVE
        ==================================================== */}

        <div className="fa-card fa-trend-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                LONG-TERM PERFORMANCE
              </span>

              <h2>
                Research Growth
              </h2>

              <p>
                Cumulative growth of your research output
              </p>

            </div>

          </div>


          <div className="fa-wave-chart">

            {analytics.researchGrowth.length >
            0 ? (

             <AreaChart
  width={760}
  height={300}
  data={analytics.researchGrowth}
>

                  <defs>

                    <linearGradient
                      id="faGrowthWave"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#06b6d4"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="100%"
                        stopColor="#06b6d4"
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />


                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />


                  <Tooltip
                    content={<ChartTooltip />}
                  />


                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Research Output"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#faGrowthWave)"
                    dot={{
                      r: 3,
                      fill: "#06b6d4",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </AreaChart>


            ) : (

              <div className="fa-empty-chart">
                <FiTrendingUp />
                <span>
                  Research growth data will appear here.
                </span>
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            7. RESEARCH TYPES
        ==================================================== */}

        <div className="fa-card fa-type-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                RESEARCH PROFILE
              </span>

              <h2>
                Research Types
              </h2>

              <p>
                Your research distribution
              </p>

            </div>

          </div>


          <div className="fa-horizontal-bars">

            {analytics.researchTypes.length >
            0 ? (

              analytics.researchTypes.map(
                (item, index) => {

                  const maxValue =
                    Math.max(
                      ...analytics.researchTypes.map(
                        (x) =>
                          number(x.value)
                      ),
                      1
                    );

                  const width =
                    (number(item.value) /
                      maxValue) *
                    100;

                  return (

                    <div
                      className="fa-horizontal-item"
                      key={`${item.label}-${index}`}
                    >

                      <div className="fa-horizontal-heading">

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {number(item.value)}
                        </strong>

                      </div>

                      <div className="fa-horizontal-track">

                        <div
                          className="fa-horizontal-fill"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )

            ) : (

              <div className="fa-empty-small">
                No research type data available.
              </div>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FOURTH ROW — STATUS / ACTIVITY / GROWTH
      ====================================================== */}

      <section className="fa-three-grid">


        {/* ====================================================
            8. APPROVAL STATUS
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                WORKFLOW STATUS
              </span>

              <h2>
                Approval Status
              </h2>

            </div>

          </div>


          <div className="fa-small-chart">

            {analytics.approvalStatus.length >
            0 ? (

             <BarChart
  width={400}
  height={250}
  data={analytics.approvalStatus}
>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Bar
                    dataKey="approved"
                    name="Approved"
                    stackId="status"
                    fill="#10b981"
                  />

                  <Bar
                    dataKey="pending"
                    name="Pending"
                    stackId="status"
                    fill="#f59e0b"
                  />

                  <Bar
                    dataKey="rejected"
                    name="Rejected"
                    stackId="status"
                    fill="#ef4444"
                  />

                  <Legend />

                </BarChart>


            ) : (

              <div className="fa-empty-chart">
                No approval status data available.
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            9. MONTHLY ACTIVITY
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                ACTIVITY PATTERN
              </span>

              <h2>
                Monthly Activity
              </h2>

            </div>

          </div>


          <div className="fa-small-chart">

            {analytics.monthlyActivity.length >
            0 ? (

             <LineChart
  width={400}
  height={250}
  data={analytics.monthlyActivity}
>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Activity"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>


            ) : (

              <div className="fa-empty-chart">
                <FiCalendar />
                No monthly activity available.
              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            10. GROWTH RATE
        ==================================================== */}

        <div className="fa-card fa-small-chart-card">

          <div className="fa-card-header">

            <div>

              <span className="fa-card-kicker">
                PERFORMANCE TREND
              </span>

              <h2>
                Publication Growth
              </h2>

            </div>

          </div>


          <div className="fa-small-chart">

            {analytics.growthRate.length >
            0 ? (

              <LineChart
  width={400}
  height={250}
  data={analytics.growthRate}
>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f6"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `${value}%`
                    }
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Growth"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>


            ) : (

              <div className="fa-empty-chart">
                <FiTrendingUp />
                No growth data available.
              </div>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          RESEARCH SNAPSHOT
      ====================================================== */}

      <section className="fa-insight-grid">


        <div className="fa-insight-card fa-insight-purple">

          <div className="fa-insight-icon">
            <FiFileText />
          </div>

          <div>

            <span>
              Pending UIDs
            </span>

            <strong>
              {number(summary.pendingUIDs)}
            </strong>

            <p>
              Requests currently awaiting processing
            </p>

          </div>

        </div>


        <div className="fa-insight-card fa-insight-blue">

          <div className="fa-insight-icon">
            <FiClock />
          </div>

          <div>

            <span>
              Pending Submissions
            </span>

            <strong>
              {number(summary.pendingPIDs)}
            </strong>

            <p>
              Research submissions under processing
            </p>

          </div>

        </div>


        <div className="fa-insight-card fa-insight-orange">

          <div className="fa-insight-icon">
            <FiUsers />
          </div>

          <div>

            <span>
              Collaborative Papers
            </span>

            <strong>
              {number(summary.coAuthoredPapers)}
            </strong>

            <p>
              Publications involving co-authors
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          RECENT PUBLICATIONS
      ====================================================== */}

      <section className="fa-card fa-recent-card">

        <div className="fa-card-header">

          <div>

            <span className="fa-card-kicker">
              RESEARCH RECORD
            </span>

            <h2>
              Recent Publications
            </h2>

            <p>
              Your latest research publications
            </p>

          </div>


          <div className="fa-total-badge">

            <FiBookOpen />

            {totalPublications} Total

          </div>

        </div>


        <div className="fa-publication-table-wrapper">

          {analytics.recentPublications.length >
          0 ? (

            <table className="fa-publication-table">

              <thead>

                <tr>

                  <th>
                    Publication
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Year
                  </th>

                  <th>
                    UID
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {analytics.recentPublications.map(
                  (publication, index) => (

                    <tr
                      key={
                        publication._id ||
                        publication.uid ||
                        index
                      }
                    >

                      <td>

                        <div className="fa-publication-title">

                          <span className="fa-publication-icon">
                            <FiFileText />
                          </span>

                          <div>

                            <strong>
                              {
                                publication.title ||
                                "Untitled Publication"
                              }
                            </strong>

                            {publication.journal && (

                              <small>
                                {
                                  publication.journal
                                }
                              </small>

                            )}

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="fa-type-badge">
                          {
                            publication.type ||
                            "Research"
                          }
                        </span>

                      </td>


                      <td>

                        {
                          publication.year ||
                          "—"
                        }

                      </td>


                      <td>

                        <span className="fa-uid-value">
                          {
                            publication.uid ||
                            "Not Assigned"
                          }
                        </span>

                      </td>


                      <td>

                        <span
                          className={`fa-status-badge ${
                            publication.status
                              ?.toLowerCase()
                              .includes(
                                "approved"
                              )
                              ? "approved"
                              : publication.status
                                  ?.toLowerCase()
                                  .includes(
                                    "pending"
                                  )
                              ? "pending"
                              : "neutral"
                          }`}
                        >

                          <span />

                          {
                            publication.status ||
                            "Processing"
                          }

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          ) : (

            <div className="fa-no-publications">

              <div className="fa-no-publications-icon">
                <FiBookOpen />
              </div>

              <h3>
                No publications yet
              </h3>

              <p>
                Your published research will appear
                here once it is available.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="fa-footer">

        <span>
          <FiActivity />
          Personal research analytics
        </span>

        <span>
          Faculty ID: {userId}
        </span>

      </div>

    </div>
  );
}