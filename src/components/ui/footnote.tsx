import React from "react";
const Footer: React.FC = () => {
  return (
    <footer style={{
      textAlign: "center",
      padding: "1rem",
      backgroundColor: "black",
      borderTop: "1px solid #ddd",
      marginTop: "2rem",
    }}>
      <div style={{ color: "white", margin: "0 auto" }}>
        &copy; {new Date().getFullYear()} EcoShare. All rights reserved.<br />
        Further contact: group 2 - tel: 0379864870
      </div>
    </footer>
  )
}
export default Footer;