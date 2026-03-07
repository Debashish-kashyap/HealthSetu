import { useEffect } from "react";

export default function Toast({ message, type = "info", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return <div className={`toast ${type}`}>{message}</div>;
}