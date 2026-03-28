import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function NotificationsSection({ userId }) {

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

 const markAsRead = async () => {
  try {
    await fetch(`http://localhost:5000/api/auth/notifications/mark-read/${userId}`, {
      method: "PUT"
    });

    // Update frontend state directly
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true
      }))
    );

  } catch (err) {
    console.error(err);
  }
};

  const showDetails = (message) => {

    let title = "";
    let uid = "";
    let pid = "";
    let reason = "";
    let popupTitle = "";

    const titleMatch = message.match(/"(.*?)"/);
    if (titleMatch) title = titleMatch[1];

    const uidMatch = message.match(/UID:\s*([A-Za-z0-9-]+)/);
    if (uidMatch) uid = uidMatch[1];

    const pidMatch = message.match(/PID:\s*([A-Za-z0-9-]+)/);
    if (pidMatch) pid = pidMatch[1];

    const reasonMatch = message.match(/Reason:\s*(.*)/);
    if (reasonMatch) reason = reasonMatch[1];

    if (message.toLowerCase().includes("approved")) {
      popupTitle = "UID Accepted";
    } 
    else if (message.toLowerCase().includes("rejected")) {
      popupTitle = "UID Rejected";
    } 
    else if (message.toLowerCase().includes("pid")) {
      popupTitle = "PID Generated";
    } 
    else {
      popupTitle = "Notification";
    }

    const isRejected = message.toLowerCase().includes("rejected");

    Swal.fire({
      title: popupTitle,
      html: `
        <div style="text-align:left;font-size:16px">

          <div style="font-size:35px;margin-bottom:10px;text-align:center">
            ${isRejected ? "❌" : "✅"}
          </div>

          <p><b>Title:</b> ${title}</p>

          ${uid ? `<p><b>UID:</b> ${uid}</p>` : ""}

          ${pid ? `<p><b>PID:</b> ${pid}</p>` : ""}

          ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}

        </div>
      `,
      confirmButtonColor: "#6366f1"
    });

  };

  // ⭐ Added line (only change)
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div style={{ padding: "20px" }}>

      <h2>Notifications</h2>

      <button
        onClick={markAsRead}
        style={{
          marginBottom: "20px",
          padding: "6px 14px",
          borderRadius: "6px",
          border: "none",
          background: "#6366f1",
          color: "white",
          cursor: "pointer"
        }}
      >
        Mark All as Read
      </button>

      {unreadNotifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        unreadNotifications.map((n) => {

          const titleMatch = n.message.match(/"(.*?)"/);
          const title = titleMatch ? titleMatch[1] : "Research Paper";

          const isRejected = n.message.toLowerCase().includes("rejected");

          const shortMessage = isRejected
            ? `Your UID request for "${title}" was rejected`
            : `Your UID request for "${title}" was approved`;

          return (
            <div
              key={n._id}
              style={{
                padding: "15px",
                marginBottom: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "#e0f2fe",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              <div>{shortMessage}</div>

              <button
                onClick={() => showDetails(n.message)}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                View Details
              </button>

            </div>
          );
        })
      )}

    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";

// export default function NotificationsSection({ userId }) {

//   const [notifications, setNotifications] = useState([]);

//   const fetchNotifications = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
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
//     await fetch(`http://localhost:5000/api/auth/notifications/mark-read/${userId}`, {
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

//       {notifications.length === 0 ? (
//         <p>No notifications</p>
//       ) : (
//         notifications.map((n) => {

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
//                 background: n.isRead ? "#f9fafb" : "#e0f2fe",
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