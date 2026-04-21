import React, { useEffect, useState, useMemo } from "react";
import "./DepartmentPublicationsSection.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function DepartmentPublicationsSection({ department }) {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [deptComparison, setDeptComparison] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [trendData, setTrendData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
  const fetchComparison = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/faculty/department-comparison");
      const data = await res.json();
      setDeptComparison(data || []);
    } catch (err) {
      console.error("Comparison fetch error", err);
      setDeptComparison([]);
    }
  };

  fetchComparison();
}, []);

useEffect(() => {
  const fetchTrend = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/faculty/department-trends"
      );
      const data = await res.json();
      setTrendData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTrendData([]);
    }
  };

  fetchTrend();
}, []);

  // FETCH
  const fetchPublications = async () => {
    try {
      let url = `http://localhost:5000/api/faculty/department-publications/${department}?`;

      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (searchText) url += `search=${encodeURIComponent(searchText)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setPublications(data.publicationHistory || []);
    } catch {
      setPublications([]);
    }
  };

useEffect(() => {
  if (!department) return;

  const delayDebounce = setTimeout(() => {
    fetchPublications();
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [searchText, startDate, endDate, department]);


  useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/faculty/college-leaderboard"
      );
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      setLeaderboard([]);
    }
  };

  fetchLeaderboard();
}, []);

  // FILTERED DATA
  const filteredPublications = publications.filter((p) => {
    const yearMatch = selectedYear === "all" || p.year === selectedYear;
    const facultyMatch =
      selectedFaculty === "all" || p.userId === selectedFaculty;
    return yearMatch && facultyMatch;
  });

  // FACULTY STATS
  const facultyStats = useMemo(() => {
  const map = {};

  publications.forEach((p) => {
    const id = String(p.userId || "Unknown"); // clean ID

    map[id] = (map[id] || 0) + 1; // ONLY number addition
  });

  return Object.entries(map)
    .map(([faculty, count]) => ({
      faculty,
      count: Number(count),
    }))
    .sort((a, b) => b.count - a.count);
}, [publications]);

  // TOP 5
  const topFaculty = facultyStats.slice(0, 5);

  // RANKINGS
  const rankings = facultyStats.map((f, i) => ({
    ...f,
    rank: i + 1,
  }));

  // RISK ALERT
  const riskAlert = useMemo(() => {
    if (!facultyStats.length) {
      return {
        level: "high",
        message: "No publication data found. Immediate attention required.",
      };
    }

    const avg =
      facultyStats.reduce((a, b) => a + b.count, 0) / facultyStats.length;

    const low = facultyStats.filter((f) => f.count < avg * 0.5);

    if (low.length >= facultyStats.length / 2) {
      return {
        level: "high",
        message: "Majority faculty have low research output.",
      };
    }

    if (low.length > 0) {
      return {
        level: "medium",
        message: `${low.length} faculty below expected output.`,
      };
    }

    return {
      level: "low",
      message: "Research output is healthy.",
    };
  }, [facultyStats]);

  // AI INSIGHT
  const aiInsight = useMemo(() => {
    if (!publications.length)
      return { status: "No Data", message: "No insights available" };

    const years = {};
    publications.forEach((p) => {
      years[p.year] = (years[p.year] || 0) + 1;
    });

    const vals = Object.values(years);
    const diff = vals[vals.length - 1] - vals[vals.length - 2];

    if (diff > 2)
      return { status: "Improving 🚀", message: "Publication trend rising." };

    if (diff < -2)
      return { status: "Declining ⚠️", message: "Drop in research output." };

    return { status: "Stable", message: "Consistent performance." };
  }, [publications]);

  // CHART DATA
  const facultyData = facultyStats.map((f) => ({
    faculty: f.faculty,
    count: f.count,
  }));

  const typeData = useMemo(() => {
    const t = { Journal: 0, Conference: 0, Book: 0, Patent: 0 };

    filteredPublications.forEach((p) => {
      const type = p.type || "Journal";
      if (t[type] !== undefined) t[type]++;
    });

    return Object.keys(t).map((k) => ({ name: k, value: t[k] }));
  }, [filteredPublications]);

  const COLORS = ["#1f6feb", "#ff7f50", "#28a745", "#a855f7"];

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Department Publications`, 14, 20);

    autoTable(doc, {
      head: [["Title", "Faculty", "Type", "Year"]],
      body: publications.map((p) => [
        p.title,
        p.userId,
        p.type,
        p.year,
      ]),
    });

    doc.save("dept.pdf");
  };

  const comparisonData = Array.isArray(deptComparison)
  ? deptComparison.map((d) => ({
      department: d.department,
      publications: d.count,
    }))
  : [];

  return (
    <div className="publications-container">

     <div className="leaderboard-box">
  <h3>🏫 College Leaderboard</h3>

  <div className="leaderboard-list">
    {leaderboard
      .sort((a, b) => b.publications - a.publications)
      .map((d, i) => (
        <div key={i} className="leaderboard-row">
          <div className="rank">
  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
</div>

          <div className="dept-name">
            {d.department}
          </div>

          <div className="score">
            {d.publications}
          </div>
        </div>
      ))}
  </div>
</div>

      {/* SUMMARY DASHBOARD (OUTSIDE ANALYTICS) */}
<div className="summary-container">

  <div className="summary-card ai">
    <h4>🤖 AI Insight</h4>
    <p>{aiInsight.status}</p>
    <small>{aiInsight.message}</small>
  </div>

  <div className={`summary-card risk ${riskAlert.level}`}>
    <h4>⚠️ Risk Analysis</h4>
    <p>{riskAlert.message}</p>
  </div>

  <div className="summary-card">
    <h4>📊 Total Publications</h4>
    <h2>{filteredPublications.length}</h2>
  </div>

  <div className="summary-card">
    <h4>🏆 Top Faculty</h4>
    <h3>{topFaculty[0]?.faculty || "N/A"}</h3>
  </div>

</div>

      <h2>📚 Department Publications</h2>

      {/* FILTERS */}
      <div className="filter-container">
        <label>From:</label>
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <input
          placeholder="Search..."
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button onClick={downloadPDF}> <Download size={18} />PDF</button>
        <button onClick={() => setShowAnalytics(true)}>
          📊 Analytics
        </button>
      </div>

      {/* LIST */}
      {publications.map((p, i) => (
        <div key={i} className="publication-item">
          <span>{p.title}</span>
          <button onClick={() => setSelectedPub(p)}>View</button>
        </div>
      ))}

      {/* ================= ANALYTICS ================= */}
      {showAnalytics && (
        <div className="analytics-overlay">
          <motion.div
            className="analytics-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >

            <div className="analytics-header">
              <h3>📊 Dashboard</h3>
              <button onClick={() => setShowAnalytics(false)}>✖</button>
            </div>

            <div className="analytics-scroll">

              {/* AI INSIGHT */}
              {/* <div className={`ai-insight`}>
                <h3>🤖 AI Insight</h3>
                <h2>{aiInsight.status}</h2>
                <p>{aiInsight.message}</p>
              </div> */}

              {/* RISK */}
              {/* <div className={`risk-card ${riskAlert.level}`}>
                <h3>⚠️ Risk Analysis</h3>
                <p>{riskAlert.message}</p>
              </div> */}

              {/* LIVE CARDS */}
              {/* <div className="live-cards">
                <div className="live-card">
                  <h4>Total</h4>
                  <h2>{filteredPublications.length}</h2>
                </div>

                <div className="live-card">
                  <h4>Top Faculty</h4>
                  <h2>{topFaculty[0]?.faculty || "N/A"}</h2>
                </div>
              </div> */}

              {/* DEPARTMENT COMPARISON */}
                 {/* RANKING */}
              <div className="ranking-box">
  <h3>🏅 Faculty Ranking</h3>

  <table className="ranking-table">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Faculty ID</th>
        <th>Publications</th>
      </tr>
    </thead>

    <tbody>
      {rankings.map((f) => (
        <tr key={f.faculty}>
          <td>#{f.rank}</td>
          <td>{f.faculty}</td>
          <td>{f.count}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div className="comparison-box">
  <h3>🏫 Department Comparison</h3>

  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={comparisonData}>
      <XAxis dataKey="department" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="publications" fill="#ff7f50" />
    </BarChart>
  </ResponsiveContainer>
</div>
          
              {/* BAR */}
              <h3>📈 Faculty Productivity Chart</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={facultyData}>
                  <XAxis dataKey="faculty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1f6feb" />
                </BarChart>
              </ResponsiveContainer>

              {/* PIE */}
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" outerRadius={80}>
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-box">
  <h3>📈 Department Trends</h3>

  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={trendData}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="CSE" fill="#1f6feb" />
      <Bar dataKey="ECE" fill="#ff7f50" />
    </BarChart>
  </ResponsiveContainer>
</div>

{/* <div className="chart-box">
  <h3>🏆 College Leaderboard</h3>

  {leaderboard
    .sort((a, b) => b.publications - a.publications)
    .map((d, i) => (
      <div key={i} className="rank-row">
        <span>
          #{i + 1} {d.department}
        </span>
        <b>{d.publications}</b>
      </div>
    ))}
</div> */}

           

            </div>
          </motion.div>
        </div>
      )}

      {/* POPUP */}
      {selectedPub && (
  <div className="popup-overlay">
    <div className="popup-card">
      <button className="close-btn" onClick={() => setSelectedPub(null)}>✖</button>

      <h3>{selectedPub.title || "No Title"}</h3>

      <p><strong>Faculty ID:</strong> {selectedPub.userId || "Unknown"}</p>
      <p><strong>Journal / Conference:</strong> {selectedPub.journal || "Not Available"}</p>
      <p><strong>Year:</strong> {selectedPub.year || "N/A"}</p>
      <p><strong>PID:</strong> {selectedPub.pid || "Not Assigned"}</p>

      {selectedPub.abstract && (
        <p><strong>Abstract:</strong> {selectedPub.abstract}</p>
      )}

      {selectedPub.uploadedAt && (
        <p>
          <strong>Uploaded Date:</strong>{" "}
          {new Date(selectedPub.uploadedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  </div>
)}

    </div>
  );
}