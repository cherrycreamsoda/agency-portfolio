"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

export default function BuyPage() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");

  return (
    <main style={{
      minHeight: "100vh",
      background: "#31302b",
      color: "#e3e3e3",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "inherit"
    }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>Buy Service</h1>
      <p style={{ fontSize: 24, marginTop: 0, letterSpacing: 0.5 }}>
        {service ? `You selected: ${service}` : "No service selected."}
      </p>
      {/* Add form or details here later */}
    </main>
  );
}
