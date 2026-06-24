export type AppIconName =
  | "profile"
  | "trophy"
  | "fish"
  | "records"
  | "plus"
  | "edit"
  | "trash"
  | "ruler"
  | "place"
  | "bait"
  | "eye"
  | "calendar"
  | "check";

export function AppIcon({ name, size = 20, className = "" }: { name: AppIconName; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: `app-icon ${className}`.trim(),
    "aria-hidden": true,
  };

  if (name === "profile") {
    return (
      <svg {...common}>
        <path d="M12 12.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4.7 20.2c.8-3.8 3.3-5.8 7.3-5.8s6.5 2 7.3 5.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "trophy") {
    return (
      <svg {...common}>
        <path d="M8 4h8v4.8c0 3-1.8 5.2-4 5.2S8 11.8 8 8.8V4Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M8 6H5.5C5.2 9.4 6.8 11.3 9 11.6M16 6h2.5c.3 3.4-1.3 5.3-3.5 5.6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 14v3.3M8.7 20h6.6M10 17.3h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "fish") {
    return (
      <svg {...common}>
        <path d="M3 12s3.2-5 8.4-5c3 0 5.5 1.4 7.6 5-2.1 3.6-4.6 5-7.6 5C6.2 17 3 12 3 12Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M19 12l3-3v6l-3-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M8.6 9.4c1.2 1.8 1.2 3.4 0 5.2M6.5 12h.01" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "records") {
    return (
      <svg {...common}>
        <path d="M5 19V9.5M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M5 9.5l4.2 2.8L12 5l3.5 4 3.5 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12.3 4.2 4.2L19.2 6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M4.5 19.5h4.1L19 9.1a2.7 2.7 0 0 0-3.8-3.8L4.8 15.7l-.3 3.8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M13.8 6.7l3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...common}>
        <path d="M5 7h14M10 11v5M14 11v5M8 7l.6 12h6.8L16 7M9.5 7V4.8h5V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "ruler") {
    return (
      <svg {...common}>
        <path d="M4 16.5 16.5 4 20 7.5 7.5 20 4 16.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M8 15l1.4 1.4M10.8 12.2l1.4 1.4M13.6 9.4l1.4 1.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "place") {
    return (
      <svg {...common}>
        <path d="M12 21s6-5.3 6-10.7a6 6 0 1 0-12 0C6 15.7 12 21 12 21Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 12.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  if (name === "bait") {
    return (
      <svg {...common}>
        <path d="M7 4v9a5 5 0 0 0 10 0v-1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M7 4c3.5 2.2 6 2.2 9.5 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M17 12c2.5-.4 3.5-1.8 3.5-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg {...common}>
        <path d="M3 12s3.2-5.5 9-5.5S21 12 21 12s-3.2 5.5-9 5.5S3 12 3 12Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M7 3.5v3M17 3.5v3M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V8a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
