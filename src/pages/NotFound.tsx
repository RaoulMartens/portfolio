// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/common/Navigation";
import Footer from "../components/common/Footer";
import { useDocumentHead } from "../hooks/useDocumentHead";

const NotFound: React.FC = () => {
  useDocumentHead({
    title: "Page Not Found — Raoul Martens",
    description: "The page you're looking for doesn't exist.",
  });

  return (
    <div className="viewport-wrapper">
      <Navigation />
      <main
        id="main-content"
        className="not-found-main"
        tabIndex={-1}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", marginBottom: "1rem" }}>
          404
        </h1>
        <p style={{ fontSize: "1.125rem", opacity: 0.7, marginBottom: "2rem" }}>
          This page doesn't exist — but my work does.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            border: "1px solid currentColor",
            borderRadius: "2rem",
            textDecoration: "none",
            color: "inherit",
            fontSize: "0.9375rem",
            transition: "opacity 0.2s ease",
          }}
        >
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
