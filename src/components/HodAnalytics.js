// src/components/HodAnalytics.js

import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_BASE_URL } from '../config';
import {
  ResponsiveContainer,
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
} from "recharts";

import "./HodAnalytics.css";

export default function HodAnalytics({
  facultyCount = 0,
  pendingUidCount = 0,
  approvedUidCount = 0,
  department,
}) {
  /* =========================================================
     STATE
  ========================================================= */

  const [uidRequests, setUidRequests] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH ANALYTICS DATA FROM COMMON BACKEND ROUTES
     
     Backend routes:
       GET /api/analytics/uid-requests/:department
       GET /api/analytics/publications/:department
  ========================================================= */

  useEffect(() => {
    if (!department) {
      setLoading(false);
      return;
    }

    const fetchAnalyticsData = async () => {
      setLoading(true);

      try {
        /* =====================================================
           UID REQUEST ANALYTICS
        ===================================================== */

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/analytics/uid-requests/${encodeURIComponent(
              department
            )}`
          );

          if (!response.ok) {
            console.warn(
              "UID analytics API returned:",
              response.status
            );

            setUidRequests([]);
          } else {
            const data = await response.json();

            /*
              Supports all of these backend response formats:

              [
                {...},
                {...}
              ]

              OR

              {
                requests: [...]
              }

              OR

              {
                uidRequests: [...]
              }

              OR

              {
                data: [...]
              }
            */

            const uidData = Array.isArray(data)
              ? data
              : data.requests ||
                data.uidRequests ||
                data.data ||
                [];

            setUidRequests(
              Array.isArray(uidData)
                ? uidData
                : []
            );
          }
        } catch (error) {
          console.error(
            "UID analytics fetch error:",
            error
          );

          setUidRequests([]);
        }

        /* =====================================================
           PUBLICATION ANALYTICS
        ===================================================== */

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/analytics/publications/${encodeURIComponent(
              department
            )}`
          );

          if (!response.ok) {
            console.warn(
              "Publication analytics API returned:",
              response.status
            );

            setPublications([]);
          } else {
            const data = await response.json();

            /*
              Supports:

              [
                {...},
                {...}
              ]

              OR

              {
                publications: [...]
              }

              OR

              {
                data: [...]
              }
            */

            const publicationData = Array.isArray(data)
              ? data
              : data.publications ||
                data.data ||
                [];

            setPublications(
              Array.isArray(publicationData)
                ? publicationData
                : []
            );
          }
        } catch (error) {
          console.error(
            "Publication analytics fetch error:",
            error
          );

          setPublications([]);
        }
      } catch (error) {
        console.error(
          "Analytics data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [department]);

  /* =========================================================
     BACKEND UID COUNTS
     
     If detailed UID data is available, calculate from it.
     Otherwise use dashboard counts passed through props.
  ========================================================= */

  const detailedApprovedUidCount = useMemo(() => {
    return uidRequests.filter((item) => {
      return (
        item.hodAccept === true &&
        item.principalAccept === true &&
        item.adminAccept === true
      );
    }).length;
  }, [uidRequests]);

  /* =========================================================
     REJECTED UID COUNT
  ========================================================= */

  const rejectedUidCount = useMemo(() => {
    return uidRequests.filter((item) => {
      return (
        item.status === "Rejected" ||
        item.status === "rejected" ||
        item.rejected === true ||
        item.isRejected === true
      );
    }).length;
  }, [uidRequests]);

  /* =========================================================
     DETAILED PENDING UID COUNT
  ========================================================= */

  const detailedPendingUidCount = useMemo(() => {
    return uidRequests.filter((item) => {
      const approved =
        item.hodAccept === true &&
        item.principalAccept === true &&
        item.adminAccept === true;

      const rejected =
        item.status === "Rejected" ||
        item.status === "rejected" ||
        item.rejected === true ||
        item.isRejected === true;

      return !approved && !rejected;
    }).length;
  }, [uidRequests]);

  /* =========================================================
     FINAL SUMMARY COUNTS
     
     Prefer detailed backend data when available.
     Otherwise use dashboard props.
  ========================================================= */

  const finalApprovedUidCount =
    uidRequests.length > 0
      ? detailedApprovedUidCount
      : Number(approvedUidCount || 0);

  const finalPendingUidCount =
    uidRequests.length > 0
      ? detailedPendingUidCount
      : Number(pendingUidCount || 0);

  const totalUidCount =
    finalApprovedUidCount +
    finalPendingUidCount +
    rejectedUidCount;

  /* =========================================================
     PUBLICATION COUNT
  ========================================================= */

  const totalPublicationCount =
    publications.length;

  /* =========================================================
     APPROVAL RATE
     
     Rejected requests are excluded from approved/pending
     workflow rate denominator.
  ========================================================= */

  const approvalBase =
    finalApprovedUidCount +
    finalPendingUidCount;

  const approvalRate =
    approvalBase > 0
      ? Math.round(
          (finalApprovedUidCount /
            approvalBase) *
            100
        )
      : 0;

  /* =========================================================
     UID STATUS CHART
  ========================================================= */

  const uidStatusData = useMemo(() => {
    const data = [
      {
        name: "Approved",
        value: finalApprovedUidCount,
      },
      {
        name: "Pending",
        value: finalPendingUidCount,
      },
    ];

    if (rejectedUidCount > 0) {
      data.push({
        name: "Rejected",
        value: rejectedUidCount,
      });
    }

    return data;
  }, [
    finalApprovedUidCount,
    finalPendingUidCount,
    rejectedUidCount,
  ]);

  /* =========================================================
     PUBLICATION TYPE DATA
  ========================================================= */

  const publicationTypeData = useMemo(() => {
    const counts = {};

    publications.forEach((publication) => {
      const type =
        publication.type ||
        publication.publicationType ||
        publication.category ||
        "Other";

      const cleanType =
        String(type).trim() || "Other";

      counts[cleanType] =
        (counts[cleanType] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [publications]);

  /* =========================================================
     RESEARCH TARGET DATA
  ========================================================= */

  const targetData = useMemo(() => {
    const counts = {};

    uidRequests.forEach((request) => {
      const target =
        request.target ||
        request.researchTarget ||
        "Other";

      const cleanTarget =
        String(target).trim() || "Other";

      counts[cleanTarget] =
        (counts[cleanTarget] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [uidRequests]);

  /* =========================================================
     MONTHLY UID REQUEST DATA
  ========================================================= */

  const monthlyUidData = useMemo(() => {
    const months = {};

    uidRequests.forEach((request) => {
      const dateValue =
        request.submittedAt ||
        request.createdAt ||
        request.date ||
        request.updatedAt;

      if (!dateValue) return;

      const date = new Date(dateValue);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const month =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );

      months[month] =
        (months[month] || 0) + 1;
    });

    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return monthOrder
      .filter(
        (month) =>
          months[month] !== undefined
      )
      .map((month) => ({
        month,
        requests: months[month],
      }));
  }, [uidRequests]);

  /* =========================================================
     APPROVAL PROGRESS
  ========================================================= */

 const approvalProgressData = useMemo(() => {

  return [
    {
      name: "UID Requests",

      "R&D Coordinator": uidRequests.filter(
        (item) =>
          item.RDCordinatorAccept === true
      ).length,

      HOD: uidRequests.filter(
        (item) =>
          item.hodAccept === true
      ).length,

      Principal: uidRequests.filter(
        (item) =>
          item.principalAccept === true
      ).length,

      Admin: uidRequests.filter(
        (item) =>
          item.adminAccept === true
      ).length,
    },
  ];

}, [uidRequests]);

  /* =========================================================
     COLORS
  ========================================================= */

  const uidColors = [
    "#10b981",
    "#f97316",
    "#ef4444",
  ];

  const publicationColors = [
    "#6366f1",
    "#06b6d4",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#14b8a6",
    "#ec4899",
    "#84cc16",
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="hod-analytics-page">
        <div className="analytics-loading">
          <div className="analytics-loading-icon">
            📊
          </div>

          <p>
            Loading research analytics...
          </p>
        </div>
      </div>
    );
  }

const downloadAnalytics = async () => {
  const analyticsElement = document.querySelector(
    ".hod-analytics-page"
  );

  if (!analyticsElement) {
    console.error("Analytics section not found");
    return;
  }

  // Your actual analytics header
  const topBar = analyticsElement.querySelector(
    ".analytics-page-header"
  );

  try {
    // Hide header before capturing
    if (topBar) {
      topBar.style.display = "none";
    }

    // Small delay so browser updates the layout
    await new Promise((resolve) =>
      setTimeout(resolve, 100)
    );

    const canvas = await html2canvas(analyticsElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
      logging: false,
      windowWidth: analyticsElement.scrollWidth,
      windowHeight: analyticsElement.scrollHeight,
    });

    // Restore header immediately after capture
    if (topBar) {
      topBar.style.display = "";
    }

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pdfHeight;

    // Remaining pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pdfHeight;
    }

    pdf.save(
      `HOD_Analytics_${
        department || "Department"
      }.pdf`
    );

  } catch (error) {

    // Always restore header if something goes wrong
    if (topBar) {
      topBar.style.display = "";
    }

    console.error(
      "Analytics PDF generation failed:",
      error
    );
  }
};

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="hod-analytics-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="analytics-page-header">

        <div>
          <div className="analytics-breadcrumb">
            HOD / Analytics
          </div>

          <h1>
            Research Analytics
          </h1>

          <p>
            Department research activity, UID requests and
            approval insights
          </p>
        </div>

          <button
            className="download-analytics-btn"
            onClick={downloadAnalytics}
        >
            ⬇ Download Analytics
        </button>

        <div className="analytics-header-right">

          <div className="analytics-department">
            <span>
              Department
            </span>

            <strong>
              {department || "Department"}
            </strong>
          </div>

          <div className="analytics-header-icon">
            📊
          </div>

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="analytics-summary-grid">

        {/* TOTAL UID */}

        <div className="analytics-stat-card blue">

          <div className="analytics-stat-icon">
            📄
          </div>

          <div>
            <span>
              Total UID Requests
            </span>

            <strong>
              {totalUidCount}
            </strong>
          </div>

        </div>

        {/* APPROVED */}

        <div className="analytics-stat-card green">

          <div className="analytics-stat-icon">
            ✓
          </div>

          <div>
            <span>
              Approved UIDs
            </span>

            <strong>
              {finalApprovedUidCount}
            </strong>
          </div>

        </div>

        {/* PENDING */}

        <div className="analytics-stat-card orange">

          <div className="analytics-stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending UIDs
            </span>

            <strong>
              {finalPendingUidCount}
            </strong>
          </div>

        </div>

        {/* PUBLICATIONS */}

        <div className="analytics-stat-card purple">

          <div className="analytics-stat-icon">
            📚
          </div>

          <div>
            <span>
              Publications
            </span>

            <strong>
              {totalPublicationCount}
            </strong>
          </div>

        </div>

        {/* APPROVAL RATE */}

        <div className="analytics-stat-card teal">

          <div className="analytics-stat-icon">
            %
          </div>

          <div>
            <span>
              UID Approval Rate
            </span>

            <strong>
              {approvalRate}%
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          ADDITIONAL INFORMATION
      ===================================================== */}

      <div className="analytics-info-row">

        {/* FACULTY */}

        <div className="analytics-mini-card">

          <span className="mini-icon">
            👥
          </span>

          <div>
            <small>
              Department Faculty
            </small>

            <strong>
              {facultyCount || 0}
            </strong>
          </div>

        </div>

        {/* REJECTED */}

        <div className="analytics-mini-card">

          <span className="mini-icon">
            ❌
          </span>

          <div>
            <small>
              Rejected Requests
            </small>

            <strong>
              {rejectedUidCount}
            </strong>
          </div>

        </div>

        {/* APPROVAL */}

        <div className="analytics-mini-card">

          <span className="mini-icon">
            📈
          </span>

          <div>
            <small>
              Approval Rate
            </small>

            <strong>
              {approvalRate}%
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          CHART GRID
      ===================================================== */}

      <div className="analytics-chart-grid">

       {/* =================================================
    UID STATUS
================================================= */}

<div className="analytics-panel">

  <div className="analytics-panel-header">

    <div>
      <h2>UID Request Status</h2>

      <p>
        Approved and pending UID requests
      </p>
    </div>

    <span>📊</span>

  </div>


  <div className="analytics-fixed-chart">

    {uidStatusData.some(
      (item) => item.value > 0
    ) ? (

      <BarChart
        width={520}
        height={300}
        data={uidStatusData}
        margin={{
          top: 20,
          right: 25,
          left: 10,
          bottom: 20
        }}
      >

        <CartesianGrid
          stroke="#d1d5db"
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="name"
          axisLine={true}
          tickLine={true}
          tick={{
            fill: "#111827",
            fontSize: 13,
            fontWeight: 600
          }}
        />

        <YAxis
          allowDecimals={false}
          axisLine={true}
          tickLine={true}
          width={40}
          tick={{
            fill: "#111827",
            fontSize: 12
          }}
        />

        <Tooltip
          cursor={{
            fill: "rgba(59,130,246,0.08)"
          }}
          contentStyle={{
            background: "#111827",
            border: "none",
            borderRadius: "10px",
            color: "#ffffff"
          }}
        />

        <Bar
          dataKey="value"
          barSize={65}
          radius={[8, 8, 0, 0]}
        >

          {uidStatusData.map(
            (entry, index) => (

              <Cell
                key={`uid-cell-${index}`}
                fill={
                  entry.name === "Approved"
                    ? "#10b981"
                    : "#f97316"
                }
              />

            )
          )}

        </Bar>

      </BarChart>

    ) : (

      <div className="no-chart-data">

        <span>📊</span>

        No UID data available

      </div>

    )}

  </div>


  {/* SUMMARY */}

  <div className="chart-summary">

    <div className="chart-summary-item">

      <span className="chart-dot approved-dot"></span>

      <div>

        <strong>
          {approvedUidCount || 0}
        </strong>

        <small>
          Approved
        </small>

      </div>

    </div>


    <div className="chart-summary-item">

      <span className="chart-dot pending-dot"></span>

      <div>

        <strong>
          {pendingUidCount || 0}
        </strong>

        <small>
          Pending
        </small>

      </div>

    </div>

  </div>

</div>
       

        {/* ===================================================
            PUBLICATION TYPES
        =================================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                Publication Types
              </h2>

              <p>
                Distribution of research publications
              </p>
            </div>

            <span>
              🥧
            </span>

          </div>

          <div className="analytics-chart-box">

            {publicationTypeData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={publicationTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    paddingAngle={3}
                  >

                    {publicationTypeData.map(
                      (entry, index) => (
                        <Cell
                          key={`pub-${index}`}
                          fill={
                            publicationColors[
                              index %
                                publicationColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="no-chart-data">

                <span>
                  📚
                </span>

                No publication data available

              </div>

            )}

          </div>

        </div>

        {/* ===================================================
            RESEARCH TARGETS
        =================================================== */}


<div className="analytics-panel wide-panel">

  <div className="analytics-panel-header">

    <div>
      <h2>
        Research Targets
      </h2>

      <p>
        UID requests grouped by research target
      </p>
    </div>

    <span>
      🎯
    </span>

  </div>


  <div className="analytics-chart-box analytics-target-chart">

    {targetData.length > 0 ? (

      <div className="target-chart-wrapper">

        <BarChart
          width={850}
          height={Math.max(
            300,
            targetData.length * 65
          )}
          data={targetData}
          layout="vertical"
          margin={{
            top: 15,
            right: 55,
            left: 20,
            bottom: 15
          }}
        >

          <CartesianGrid
            stroke="#d1d5db"
            strokeDasharray="3 3"
            horizontal={false}
          />


          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={true}
            tickLine={true}
            tick={{
              fill: "#191127",
              fontSize: 12,
              fontWeight: 600
            }}
          />


          <YAxis
            type="category"
            dataKey="name"
            width={170}
            axisLine={true}
            tickLine={true}
            tick={{
              fill: "#111827",
              fontSize: 12,
              fontWeight: 600
            }}
          />


          <Tooltip
            cursor={{
              fill: "rgba(99,102,241,0.08)"
            }}
            contentStyle={{
              background: "#111827",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              padding: "10px 14px"
            }}
            labelStyle={{
              color: "#ffffff",
              fontWeight: 600,
              marginBottom: "4px"
            }}
            itemStyle={{
              color: "#ffffff"
            }}
          />


          <Bar
  dataKey="value"
  radius={[0, 8, 8, 0]}
  barSize={35}
>
  {targetData.map((entry, index) => (
    <Cell
      key={`target-cell-${index}`}
      fill={
        [
          "#6366f1",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#14b8a6",
          "#f97316",
          "#84cc16",
        ][index % 10]
      }
    />
  ))}
</Bar>

        </BarChart>

      </div>

    ) : (

      <div className="no-chart-data">

        <span>
          🎯
        </span>

        {uidRequests.length === 0
          ? "Detailed UID request data unavailable"
          : "No research target data available"}

      </div>

    )}

  </div>


  {/* =================================================
      TARGET SUMMARY
  ================================================= */}

  {targetData.length > 0 && (

    <div className="target-summary">

      <div className="target-summary-title">
        <span>🎯</span>
        <strong>Target Overview</strong>
      </div>


      <div className="target-summary-list">

        {targetData.map((target, index) => (

          <div
  className="target-summary-item"
  key={`target-summary-${index}`}
  style={{
    "--target-color": [
      "#6366f1",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
      "#84cc16",
    ][index % 10],
  }}
>

            <span
  className="target-summary-number"
  style={{
    background: "var(--target-color)",
  }}
>
  {index + 1}
</span>

            <div className="target-summary-content">

              <strong>
                {target.name}
              </strong>

              <span>
                {target.value} UID request
                {target.value !== 1 ? "s" : ""}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  )}

</div>

        {/* <div className="analytics-panel wide-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                Research Targets
              </h2>

              <p>
                UID requests grouped by research target
              </p>
            </div>

            <span>
              🎯
            </span>

          </div>

       <div className="analytics-chart-box analytics-fixed-chart">

  {targetData.length > 0 ? (

    <BarChart
      width={850}
      height={320}
      data={targetData}
      layout="vertical"
      margin={{
        top: 10,
        right: 30,
        left: 20,
        bottom: 10
      }}
    >

      <CartesianGrid
        stroke="#d1d5db"
        strokeDasharray="3 3"
        horizontal={false}
      />

      <XAxis
        type="number"
        allowDecimals={false}
        axisLine={true}
        tickLine={true}
        tick={{
          fill: "#111827",
          fontSize: 12
        }}
      />

      <YAxis
        type="category"
        dataKey="name"
        width={150}
        tick={{
          fill: "#111827",
          fontSize: 12,
          fontWeight: 600
        }}
      />

      <Tooltip
        cursor={{
          fill: "rgba(99,102,241,0.08)"
        }}
        contentStyle={{
          background: "#111827",
          border: "none",
          borderRadius: "10px",
          color: "#ffffff"
        }}
      />

      <Bar
        dataKey="value"
        fill="#6366f1"
        radius={[0, 8, 8, 0]}
        barSize={35}
      />

    </BarChart>

  ) : (

    <div className="no-chart-data">

      <span>🎯</span>

      {uidRequests.length === 0
        ? "Detailed UID request data unavailable"
        : "No research target data available"}

    </div>

  )}

</div>

        </div> */}

        {/* ===================================================
            UID REQUEST TREND
        =================================================== */}

        <div className="analytics-panel wide-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                UID Request Trend
              </h2>

              <p>
                Monthly UID request activity
              </p>
            </div>

            <span>
              📈
            </span>

          </div>

          <div className="analytics-chart-box analytics-fixed-chart">

  {monthlyUidData.length > 0 ? (

    <LineChart
      width={850}
      height={320}
      data={monthlyUidData}
      margin={{
        top: 15,
        right: 25,
        left: 10,
        bottom: 10
      }}
    >

      <CartesianGrid
        stroke="#d1d5db"
        strokeDasharray="3 3"
        vertical={false}
      />

      <XAxis
        dataKey="month"
        axisLine={true}
        tickLine={true}
        tick={{
          fill: "#111827",
          fontSize: 12,
          fontWeight: 600
        }}
      />

      <YAxis
        allowDecimals={false}
        axisLine={true}
        tickLine={true}
        tick={{
          fill: "#111827",
          fontSize: 12
        }}
      />

      <Tooltip
        cursor={{
          fill: "rgba(99,102,241,0.08)"
        }}
        contentStyle={{
          background: "#111827",
          border: "none",
          borderRadius: "10px",
          color: "#ffffff"
        }}
      />

      <Line
        type="monotone"
        dataKey="requests"
        stroke="#6366f1"
        strokeWidth={4}
        dot={{
          r: 5,
          fill: "#6366f1"
        }}
        activeDot={{
          r: 7
        }}
      />

    </LineChart>

  ) : (

    <div className="no-chart-data">

      <span>📈</span>

      {uidRequests.length === 0
        ? "Detailed UID request data unavailable"
        : "No monthly request data available"}

    </div>

  )}

</div>

        </div>

        {/* ===================================================
            APPROVAL PROGRESS
        =================================================== */}

        <div className="analytics-panel wide-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                Approval Progress
              </h2>

              <p>
                Requests progressing through approval stages
              </p>
            </div>

            <span>
              📌
            </span>

          </div>

             <div className="analytics-chart-box analytics-fixed-chart">

                {uidRequests.length > 0 ? (

                    <BarChart
                    width={850}
                    height={320}
                    data={approvalProgressData}
                    barCategoryGap="35%"
                barGap={80}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 10
                    }}
                    >

                    <CartesianGrid
                        stroke="#d1d5db"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={true}
                        tickLine={true}
                        tick={{
                        fill: "#111827",
                        fontSize: 12,
                        fontWeight: 600
                        }}
                    />

                    <YAxis
                        allowDecimals={false}
                        axisLine={true}
                        tickLine={true}
                        tick={{
                        fill: "#111827",
                        fontSize: 12
                        }}
                    />

                    <Tooltip
                        cursor={{
                        fill: "rgba(99,102,241,0.08)"
                        }}
                        contentStyle={{
                        background: "#111827",
                        border: "none",
                        borderRadius: "10px",
                        color: "#ffffff"
                        }}
                    />

                    <Legend />

                    <Bar
                        dataKey="HOD"
                        fill="#6366f1"
                        barSize={55}
                        radius={[8, 8, 0, 0]}
                    />

                    <Bar
                        dataKey="R&D Coordinator"
                        fill="#8b5cf6"
                        barSize={55}
                        radius={[8, 8, 0, 0]}
                    />

                    <Bar
                        dataKey="Principal"
                        fill="#10b981"
                        barSize={55}
                        radius={[8, 8, 0, 0]}
                    />

                    <Bar
                        dataKey="Admin"
                        fill="#f97316"
                        barSize={55}
                        radius={[8, 8, 0, 0]}
                    />

                    </BarChart>

                ) : (

                    <div className="no-chart-data">

                    <span>📌</span>

                    Detailed approval data unavailable

                    </div>

                )}

                </div>
                {/* =====================================================
    APPROVAL PROGRESS OVERVIEW
===================================================== */}

<div className="approval-overview">

  <div className="approval-overview-item coordinator">
    <span className="approval-overview-dot"></span>

    <div>
      <strong>
        {
          uidRequests.filter(
            (item) => item.RDCordinatorAccept === true
          ).length
        }
      </strong>

      <small>
        R&D Coordinator
      </small>
    </div>
  </div>


  <div className="approval-overview-item hod">
    <span className="approval-overview-dot"></span>

    <div>
      <strong>
        {
          uidRequests.filter(
            (item) => item.hodAccept === true
          ).length
        }
      </strong>

      <small>
        HOD
      </small>
    </div>
  </div>


  <div className="approval-overview-item principal">
    <span className="approval-overview-dot"></span>

    <div>
      <strong>
        {
          uidRequests.filter(
            (item) => item.principalAccept === true
          ).length
        }
      </strong>

      <small>
        Principal
      </small>
    </div>
  </div>


  <div className="approval-overview-item admin">
    <span className="approval-overview-dot"></span>

    <div>
      <strong>
        {
          uidRequests.filter(
            (item) => item.adminAccept === true
          ).length
        }
      </strong>

      <small>
        Admin
      </small>
    </div>
  </div>

</div>

        </div>

      </div>

      {/* =====================================================
          DATA NOTE
      ===================================================== */}

      {uidRequests.length === 0 &&
        publications.length === 0 && (

        <div className="analytics-data-note">

          <span>
            ℹ️
          </span>

          <div>

            <strong>
              No detailed analytics data found
            </strong>

            <p>
              The analytics backend did not return
              detailed UID or publication records for
              {` ${department || "this department"}`}.
              Please verify the analytics API response
              in Postman.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}