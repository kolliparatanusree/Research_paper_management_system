
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "./NotificationsSection.css";

export default function NotificationsSection({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
const notificationsPerPage = 5;

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/notifications/${userId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // =====================================================
  // NOTIFICATION TYPE
  // =====================================================
  const getNotificationType = (message = "") => {
    const text = message.toLowerCase();

    if (
      text.includes("rejected") &&
      text.includes("pid")
    ) {
      return "pid-rejected";
    }

    if (text.includes("rejected")) {
      return "rejected";
    }

    if (
      text.includes("pid") ||
      text.includes("generated")
    ) {
      return "pid";
    }

    if (text.includes("approved") || text.includes("accepted")) {
      return "approved";
    }

    return "other";
  };

  // =====================================================
  // NOTIFICATION INFORMATION
  // =====================================================
  const getNotificationInfo = (notification) => {
    const message = notification?.message || "";
    const type = getNotificationType(message);

    switch (type) {
      case "approved":
        return {
          label: "UID Approved",
          shortLabel: "Approved",
          icon: "✓",
          className: "notification-approved",
        };

      case "rejected":
        return {
          label: "UID Rejected",
          shortLabel: "Rejected",
          icon: "✕",
          className: "notification-rejected",
        };

      case "pid":
        return {
          label: "PID Generated",
          shortLabel: "PID Generated",
          icon: "ID",
          className: "notification-pid",
        };

      case "pid-rejected":
        return {
          label: "PID Rejected",
          shortLabel: "Rejected",
          icon: "✕",
          className: "notification-rejected",
        };

      default:
        return {
          label: "Research Update",
          shortLabel: "Update",
          icon: "i",
          className: "notification-other",
        };
    }
  };

  // =====================================================
  // EXTRACT DETAILS FROM MESSAGE
  // =====================================================
  const extractDetails = (message = "") => {
    let title = "";
    let uid = "";
    let pid = "";
    let reason = "";

    const titleMatch = message.match(/"(.*?)"/);
    if (titleMatch) {
      title = titleMatch[1];
    }

    const uidMatch = message.match(/UID:\s*([A-Za-z0-9-]+)/i);
    if (uidMatch) {
      uid = uidMatch[1];
    }

    const pidMatch = message.match(/PID:\s*([A-Za-z0-9-]+)/i);
    if (pidMatch) {
      pid = pidMatch[1];
    }

    const reasonMatch = message.match(/Reason:\s*(.*)/i);
    if (reasonMatch) {
      reason = reasonMatch[1].trim();
    }

    return {
      title: title || "Research Paper",
      uid,
      pid,
      reason,
    };
  };

  // =====================================================
  // RELATIVE DATE
  // =====================================================
  const formatRelativeDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return "Just now";
    }

    if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
    }

    if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    if (diff < 2 * day) {
      return "Yesterday";
    }

    if (diff < 7 * day) {
      const days = Math.floor(diff / day);
      return `${days} days ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // GET NOTIFICATION DATE
  // =====================================================
  const getNotificationDate = (notification) => {
    return (
      notification.createdAt ||
      notification.timestamp ||
      notification.date ||
      notification.updatedAt
    );
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================
  const markAsRead = async () => {
    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    if (unreadCount === 0) {
      return;
    }

    try {
      const res = await fetch(
        `/api/auth/notifications/mark-read/${userId}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error("Mark all as read error:", err);

      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Unable to mark notifications as read.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  // =====================================================
  // MARK INDIVIDUAL NOTIFICATION AS READ
  // =====================================================
  const markNotificationAsRead = async (notificationId) => {
    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification || notification.isRead) {
      return;
    }

    /*
      If your backend later provides an individual
      mark-as-read endpoint, call it here.

      For now we update the frontend state so the UI
      immediately reflects the read status.
    */

    setNotifications((prev) =>
      prev.map((item) =>
        item._id === notificationId
          ? { ...item, isRead: true }
          : item
      )
    );
  };

  // =====================================================
  // SHOW DETAILS
  // =====================================================
  const showDetails = async (notification) => {
    const message = notification?.message || "";
    const info = getNotificationInfo(notification);
    const details = extractDetails(message);

    // Mark as read when opened
    await markNotificationAsRead(notification._id);

    const isRejected =
      info.className === "notification-rejected";

    const statusText = isRejected
      ? "Rejected"
      : info.className === "notification-approved"
      ? "Approved"
      : info.className === "notification-pid"
      ? "PID Generated"
      : "Research Update";

    Swal.fire({
      title: info.label,
      html: `
        <div class="notification-popup">

          <div class="popup-status-icon ${isRejected ? "rejected" : "success"}">
            ${info.icon}
          </div>

          <div class="popup-status-badge ${
            isRejected ? "rejected-badge" : "success-badge"
          }">
            ${statusText}
          </div>

          <div class="popup-details">

            <div class="popup-detail-row">
              <span class="popup-detail-label">
                Paper Title
              </span>
              <span class="popup-detail-value">
                ${details.title}
              </span>
            </div>

            ${
              details.uid
                ? `
                <div class="popup-detail-row">
                  <span class="popup-detail-label">
                    UID
                  </span>
                  <span class="popup-detail-value popup-code">
                    ${details.uid}
                  </span>
                </div>
              `
                : ""
            }

            ${
              details.pid
                ? `
                <div class="popup-detail-row">
                  <span class="popup-detail-label">
                    PID
                  </span>
                  <span class="popup-detail-value popup-code">
                    ${details.pid}
                  </span>
                </div>
              `
                : ""
            }

            ${
              details.reason
                ? `
                <div class="popup-detail-row popup-reason-row">
                  <span class="popup-detail-label">
                    Reason
                  </span>
                  <span class="popup-detail-value">
                    ${details.reason}
                  </span>
                </div>
              `
                : ""
            }

          </div>

        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: "#6366f1",
      width: "520px",
      customClass: {
        popup: "notification-swal-popup",
        title: "notification-swal-title",
        confirmButton: "notification-swal-button",
      },
    });
  };

  // =====================================================
  // FILTERED NOTIFICATIONS
  // =====================================================
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const type = getNotificationType(notification.message);

      switch (activeFilter) {
        case "unread":
          return !notification.isRead;

        case "approved":
          return type === "approved";

        case "rejected":
          return (
            type === "rejected" ||
            type === "pid-rejected"
          );

        case "pid":
          return type === "pid";

        case "uid":
          return (
            type === "approved" ||
            type === "rejected"
          );

        default:
          return true;
      }
    });
  }, [notifications, activeFilter]);

  // =====================================================
// PAGINATION
// =====================================================

const totalPages = Math.ceil(
  filteredNotifications.length / notificationsPerPage
);

const startIndex =
  (currentPage - 1) * notificationsPerPage;

const endIndex =
  startIndex + notificationsPerPage;

const paginatedNotifications =
  filteredNotifications.slice(startIndex, endIndex);

// Reset page when filter changes
useEffect(() => {
  setCurrentPage(1);
}, [activeFilter]);

  // =====================================================
  // COUNTS
  // =====================================================
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const approvedCount = notifications.filter(
    (notification) =>
      getNotificationType(notification.message) === "approved"
  ).length;

  const rejectedCount = notifications.filter(
    (notification) => {
      const type = getNotificationType(notification.message);
      return (
        type === "rejected" ||
        type === "pid-rejected"
      );
    }
  ).length;

  const pidCount = notifications.filter(
    (notification) =>
      getNotificationType(notification.message) === "pid"
  ).length;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <section className="notifications-section">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="notifications-header">

        <div className="notifications-heading">

          <div className="notifications-title-row">
            <div className="notifications-main-icon">
              🔔
            </div>

            <div>
              <h2>Notifications</h2>

              <p>
                Stay updated with your research activity
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="unread-count">
              {unreadCount} Unread
            </span>
          )}

        </div>

        <button
          className={`mark-all-btn ${
            unreadCount === 0 ? "disabled" : ""
          }`}
          onClick={markAsRead}
          disabled={unreadCount === 0}
        >
          <span>✓</span>
          Mark All as Read
        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}
      <div className="notification-summary">

        <div className="summary-item summary-total">
          <div className="summary-icon">🔔</div>

          <div>
            <span className="summary-number">
              {notifications.length}
            </span>
            <span className="summary-label">
              Total
            </span>
          </div>
        </div>

        <div className="summary-item summary-unread">
          <div className="summary-icon">●</div>

          <div>
            <span className="summary-number">
              {unreadCount}
            </span>
            <span className="summary-label">
              Unread
            </span>
          </div>
        </div>

        <div className="summary-item summary-approved">
          <div className="summary-icon">✓</div>

          <div>
            <span className="summary-number">
              {approvedCount}
            </span>
            <span className="summary-label">
              Approved
            </span>
          </div>
        </div>

        <div className="summary-item summary-rejected">
          <div className="summary-icon">✕</div>

          <div>
            <span className="summary-number">
              {rejectedCount}
            </span>
            <span className="summary-label">
              Rejected
            </span>
          </div>
        </div>

        <div className="summary-item summary-pid">
          <div className="summary-icon">ID</div>

          <div>
            <span className="summary-number">
              {pidCount}
            </span>
            <span className="summary-label">
              PID Updates
            </span>
          </div>
        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}
      <div className="notification-toolbar">

        <div className="notification-filters">

          <button
            className={`filter-btn ${
              activeFilter === "all" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
            <span>{notifications.length}</span>
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "unread" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <span>{unreadCount}</span>
            )}
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "uid" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("uid")}
          >
            UID
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "pid" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("pid")}
          >
            PID
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "approved" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("approved")}
          >
            Approved
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "rejected" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("rejected")}
          >
            Rejected
          </button>

        </div>

      </div>

      {/* =================================================
          NOTIFICATION LIST
      ================================================= */}
      <div className="notifications-list">

        {loading ? (
          <div className="notifications-loading">

            <div className="loading-spinner"></div>

            <p>Loading notifications...</p>

          </div>
        ) : filteredNotifications.length === 0 ? (

          <div className="notifications-empty">

            <div className="empty-icon">
              🔔
            </div>

            <h3>
              {notifications.length === 0
                ? "You're all caught up"
                : "No notifications found"}
            </h3>

            <p>
              {notifications.length === 0
                ? "New research updates will appear here."
                : "Try selecting a different notification filter."}
            </p>

            {activeFilter !== "all" && (
              <button
                className="clear-filter-btn"
                onClick={() => setActiveFilter("all")}
              >
                View All Notifications
              </button>
            )}

          </div>

        ) : (

          paginatedNotifications.map((notification) => {

            const info = getNotificationInfo(notification);
            const details = extractDetails(
              notification.message
            );

            const isUnread = !notification.isRead;

            // const shortMessage =
            //   info.className === "notification-rejected"
            //     ? `Your UID request for "${details.title}" was rejected`
            //     : info.className === "notification-approved"
            //     ? `Your UID request for "${details.title}" was approved`
            //     : info.className === "notification-pid"
            //     ? `PID generated for "${details.title}"`
            //     : notification.message;

            const shortMessage = notification.message;

            return (
              <div
                key={notification._id}
                className={`notification-card ${
                  isUnread ? "unread" : "read"
                } ${info.className}`}
                onClick={() =>
                  showDetails(notification)
                }
              >

                {/* UNREAD DOT */}
                {isUnread && (
                  <span className="notification-unread-dot"></span>
                )}

                {/* ICON */}
                <div
                  className={`notification-type-icon ${info.className}`}
                >
                  {info.icon}
                </div>

                {/* CONTENT */}
                <div className="notification-content">

                  <div className="notification-top-row">

                    <span
                      className={`notification-type-badge ${info.className}`}
                    >
                      {info.label}
                    </span>

                    <span className="notification-time">
                      {formatRelativeDate(
                        getNotificationDate(notification)
                      )}
                    </span>

                  </div>

                  <h3>
                    {shortMessage}
                  </h3>

                  <p className="notification-paper-title">
                    {details.title}
                  </p>

                  {details.uid && (
                    <span className="notification-code">
                      UID: {details.uid}
                    </span>
                  )}

                  {details.pid && (
                    <span className="notification-code">
                      PID: {details.pid}
                    </span>
                  )}

                </div>

                {/* ACTION */}
                <div className="notification-actions">

                  <button
                    className="view-details-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      showDetails(notification);
                    }}
                  >
                    View Details
                    <span>→</span>
                  </button>

                </div>

              </div>
            );
          })

        )}

      </div>
      {/* =================================================
    PAGINATION
================================================= */}

{filteredNotifications.length > notificationsPerPage && (
  <div className="notifications-pagination">

    <button
      className="pagination-btn pagination-prev"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((prev) => Math.max(prev - 1, 1))
      }
    >
      ← Previous
    </button>

    <div className="pagination-pages">

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((page) => (
        <button
          key={page}
          className={`pagination-page ${
            currentPage === page ? "active" : ""
          }`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}

    </div>

    <button
      className="pagination-btn pagination-next"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
    >
      Next →
    </button>

  </div>
)}

    </section>
  );
}


// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";

// export default function NotificationsSection({ userId }) {

//   const [notifications, setNotifications] = useState([]);

//   const fetchNotifications = async () => {
//     try {
//       const res = await fetch(`/api/notifications/${userId}`);
//       const data = await res.json();
//       setNotifications(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, [userId]);

//  const markAsRead = async () => {
//   try {
//     await fetch(`/api/auth/notifications/mark-read/${userId}`, {
//       method: "PUT"
//     });

//     // Update frontend state directly
//     setNotifications((prev) =>
//       prev.map((n) => ({
//         ...n,
//         isRead: true
//       }))
//     );

//   } catch (err) {
//     console.error(err);
//   }
// };

//   const showDetails = (message) => {

//     let title = "";
//     let uid = "";
//     let pid = "";
//     let reason = "";
//     let popupTitle = "";

//     const titleMatch = message.match(/"(.*?)"/);
//     if (titleMatch) title = titleMatch[1];

//     const uidMatch = message.match(/UID:\s*([A-Za-z0-9-]+)/);
//     if (uidMatch) uid = uidMatch[1];

//     const pidMatch = message.match(/PID:\s*([A-Za-z0-9-]+)/);
//     if (pidMatch) pid = pidMatch[1];

//     const reasonMatch = message.match(/Reason:\s*(.*)/);
//     if (reasonMatch) reason = reasonMatch[1];

//     if (message.toLowerCase().includes("approved")) {
//       popupTitle = "UID Accepted";
//     } 
//     else if (message.toLowerCase().includes("rejected")) {
//       popupTitle = "UID Rejected";
//     } 
//     else if (message.toLowerCase().includes("pid")) {
//       popupTitle = "PID Generated";
//     } 
//     else {
//       popupTitle = "Notification";
//     }

//     const isRejected = message.toLowerCase().includes("rejected");

//     Swal.fire({
//       title: popupTitle,
//       html: `
//         <div style="text-align:left;font-size:16px">

//           <div style="font-size:35px;margin-bottom:10px;text-align:center">
//             ${isRejected ? "❌" : "✅"}
//           </div>

//           <p><b>Title:</b> ${title}</p>

//           ${uid ? `<p><b>UID:</b> ${uid}</p>` : ""}

//           ${pid ? `<p><b>PID:</b> ${pid}</p>` : ""}

//           ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}

//         </div>
//       `,
//       confirmButtonColor: "#6366f1"
//     });

//   };

//   // ⭐ Added line (only change)
//   const unreadNotifications = notifications.filter(n => !n.isRead);

//   return (
//     <div style={{ padding: "20px" }}>

//       <h2>Notifications</h2>

//       <button
//         onClick={markAsRead}
//         style={{
//           marginBottom: "20px",
//           padding: "6px 14px",
//           borderRadius: "6px",
//           border: "none",
//           background: "#6366f1",
//           color: "white",
//           cursor: "pointer"
//         }}
//       >
//         Mark All as Read
//       </button>

//       {unreadNotifications.length === 0 ? (
//         <p>No notifications</p>
//       ) : (
//         unreadNotifications.map((n) => {

//           const titleMatch = n.message.match(/"(.*?)"/);
//           const title = titleMatch ? titleMatch[1] : "Research Paper";

//           const isRejected = n.message.toLowerCase().includes("rejected");

//           const shortMessage = isRejected
//             ? `Your UID request for "${title}" was rejected`
//             : `Your UID request for "${title}" was approved`;

//           return (
//             <div
//               key={n._id}
//               style={{
//                 padding: "15px",
//                 marginBottom: "12px",
//                 borderRadius: "10px",
//                 border: "1px solid #ddd",
//                 background: "#e0f2fe",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}
//             >

//               <div>{shortMessage}</div>

//               <button
//                 onClick={() => showDetails(n.message)}
//                 style={{
//                   background: "#10b981",
//                   color: "white",
//                   border: "none",
//                   padding: "6px 12px",
//                   borderRadius: "5px",
//                   cursor: "pointer"
//                 }}
//               >
//                 View Details
//               </button>

//             </div>
//           );
//         })
//       )}

//     </div>
//   );
// }

// // import React, { useEffect, useState } from "react";
// // import Swal from "sweetalert2";

// // export default function NotificationsSection({ userId }) {

// //   const [notifications, setNotifications] = useState([]);

// //   const fetchNotifications = async () => {
// //     try {
// //       const res = await fetch(`/api/notifications/${userId}`);
// //       const data = await res.json();
// //       setNotifications(data);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchNotifications();
// //   }, [userId]);

// //  const markAsRead = async () => {
// //   try {
// //     await fetch(`/api/auth/notifications/mark-read/${userId}`, {
// //       method: "PUT"
// //     });

// //     // Update frontend state directly
// //     setNotifications((prev) =>
// //       prev.map((n) => ({
// //         ...n,
// //         isRead: true
// //       }))
// //     );

// //   } catch (err) {
// //     console.error(err);
// //   }
// // };

// //   const showDetails = (message) => {

// //     let title = "";
// //     let uid = "";
// //     let pid = "";
// //     let reason = "";
// //     let popupTitle = "";

// //     const titleMatch = message.match(/"(.*?)"/);
// //     if (titleMatch) title = titleMatch[1];

// //     const uidMatch = message.match(/UID:\s*([A-Za-z0-9-]+)/);
// //     if (uidMatch) uid = uidMatch[1];

// //     const pidMatch = message.match(/PID:\s*([A-Za-z0-9-]+)/);
// //     if (pidMatch) pid = pidMatch[1];

// //     const reasonMatch = message.match(/Reason:\s*(.*)/);
// //     if (reasonMatch) reason = reasonMatch[1];

// //     if (message.toLowerCase().includes("approved")) {
// //       popupTitle = "UID Accepted";
// //     } 
// //     else if (message.toLowerCase().includes("rejected")) {
// //       popupTitle = "UID Rejected";
// //     } 
// //     else if (message.toLowerCase().includes("pid")) {
// //       popupTitle = "PID Generated";
// //     } 
// //     else {
// //       popupTitle = "Notification";
// //     }

// //     const isRejected = message.toLowerCase().includes("rejected");

// //     Swal.fire({
// //       title: popupTitle,
// //       html: `
// //         <div style="text-align:left;font-size:16px">

// //           <div style="font-size:35px;margin-bottom:10px;text-align:center">
// //             ${isRejected ? "❌" : "✅"}
// //           </div>

// //           <p><b>Title:</b> ${title}</p>

// //           ${uid ? `<p><b>UID:</b> ${uid}</p>` : ""}

// //           ${pid ? `<p><b>PID:</b> ${pid}</p>` : ""}

// //           ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}

// //         </div>
// //       `,
// //       confirmButtonColor: "#6366f1"
// //     });

// //   };

// //   return (
// //     <div style={{ padding: "20px" }}>

// //       <h2>Notifications</h2>

// //       <button
// //         onClick={markAsRead}
// //         style={{
// //           marginBottom: "20px",
// //           padding: "6px 14px",
// //           borderRadius: "6px",
// //           border: "none",
// //           background: "#6366f1",
// //           color: "white",
// //           cursor: "pointer"
// //         }}
// //       >
// //         Mark All as Read
// //       </button>

// //       {notifications.length === 0 ? (
// //         <p>No notifications</p>
// //       ) : (
// //         notifications.map((n) => {

// //           const titleMatch = n.message.match(/"(.*?)"/);
// //           const title = titleMatch ? titleMatch[1] : "Research Paper";

// //           const isRejected = n.message.toLowerCase().includes("rejected");

// //           const shortMessage = isRejected
// //             ? `Your UID request for "${title}" was rejected`
// //             : `Your UID request for "${title}" was approved`;

// //           return (
// //             <div
// //               key={n._id}
// //               style={{
// //                 padding: "15px",
// //                 marginBottom: "12px",
// //                 borderRadius: "10px",
// //                 border: "1px solid #ddd",
// //                 background: n.isRead ? "#f9fafb" : "#e0f2fe",
// //                 display: "flex",
// //                 justifyContent: "space-between",
// //                 alignItems: "center"
// //               }}
// //             >

// //               <div>{shortMessage}</div>

// //               <button
// //                 onClick={() => showDetails(n.message)}
// //                 style={{
// //                   background: "#10b981",
// //                   color: "white",
// //                   border: "none",
// //                   padding: "6px 12px",
// //                   borderRadius: "5px",
// //                   cursor: "pointer"
// //                 }}
// //               >
// //                 View Details
// //               </button>

// //             </div>
// //           );
// //         })
// //       )}

// //     </div>
// //   );
// // }