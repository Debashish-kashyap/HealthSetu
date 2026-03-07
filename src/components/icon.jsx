// Usage: <Icon name="sync" size={18} color="white" />
const PATHS = {
    user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    activity:    "M22 12h-4l-3 9L9 3l-3 9H2",
    map:         "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16",
    sync:        "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    plus:        "M12 5v14M5 12h14",
    syringe:     "m18 2 4 4-14 14H4v-4L18 2zM14 6l4 4",
    wifiOff:     "M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
    alert:       "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    check:       "M20 6 9 17l-5-5",
    edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    thermometer: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z",
    droplets:    "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",
    close:       "M18 6 6 18M6 6l12 12",
    search:      "m21 21-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z",
  };
  
  export default function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.8 }) {
    const d = PATHS[name];
    if (!d) return null;
    return (
      <svg
        width={size} height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    );
  }