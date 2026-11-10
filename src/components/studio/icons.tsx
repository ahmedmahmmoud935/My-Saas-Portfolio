import React from 'react'

/**
 * The line icons the studio template uses — Lucide's, copied from the
 * reference site so they are drawn exactly as it draws them.
 */

type El = [string, Record<string, string>]

const ICONS: Record<string, El[]> = {
  "arrow-down": [
    [
      "path",
      {
        "d": "M12 5v14"
      }
    ],
    [
      "path",
      {
        "d": "m19 12-7 7-7-7"
      }
    ]
  ],
  "arrow-left": [
    [
      "path",
      {
        "d": "m12 19-7-7 7-7"
      }
    ],
    [
      "path",
      {
        "d": "M19 12H5"
      }
    ]
  ],
  "arrow-right": [
    [
      "path",
      {
        "d": "M5 12h14"
      }
    ],
    [
      "path",
      {
        "d": "m12 5 7 7-7 7"
      }
    ]
  ],
  "arrow-up-right": [
    [
      "path",
      {
        "d": "M7 7h10v10"
      }
    ],
    [
      "path",
      {
        "d": "M7 17 17 7"
      }
    ]
  ],
  "check": [
    [
      "path",
      {
        "d": "M20 6 9 17l-5-5"
      }
    ]
  ],
  "clapperboard": [
    [
      "path",
      {
        "d": "m12.296 3.464 3.02 3.956"
      }
    ],
    [
      "path",
      {
        "d": "M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"
      }
    ],
    [
      "path",
      {
        "d": "M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      }
    ],
    [
      "path",
      {
        "d": "m6.18 5.276 3.1 3.899"
      }
    ]
  ],
  "code-xml": [
    [
      "path",
      {
        "d": "m18 16 4-4-4-4"
      }
    ],
    [
      "path",
      {
        "d": "m6 8-4 4 4 4"
      }
    ],
    [
      "path",
      {
        "d": "m14.5 4-5 16"
      }
    ]
  ],
  "external-link": [
    [
      "path",
      {
        "d": "M15 3h6v6"
      }
    ],
    [
      "path",
      {
        "d": "M10 14 21 3"
      }
    ],
    [
      "path",
      {
        "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      }
    ]
  ],
  "graduation-cap": [
    [
      "path",
      {
        "d": "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
      }
    ],
    [
      "path",
      {
        "d": "M22 10v6"
      }
    ],
    [
      "path",
      {
        "d": "M6 12.5V16a6 3 0 0 0 12 0v-3.5"
      }
    ]
  ],
  "layers": [
    [
      "path",
      {
        "d": "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
      }
    ],
    [
      "path",
      {
        "d": "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
      }
    ],
    [
      "path",
      {
        "d": "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
      }
    ]
  ],
  "layout-dashboard": [
    [
      "rect",
      {
        "width": "7",
        "height": "9",
        "x": "3",
        "y": "3",
        "rx": "1"
      }
    ],
    [
      "rect",
      {
        "width": "7",
        "height": "5",
        "x": "14",
        "y": "3",
        "rx": "1"
      }
    ],
    [
      "rect",
      {
        "width": "7",
        "height": "9",
        "x": "14",
        "y": "12",
        "rx": "1"
      }
    ],
    [
      "rect",
      {
        "width": "7",
        "height": "5",
        "x": "3",
        "y": "16",
        "rx": "1"
      }
    ]
  ],
  "mail": [
    [
      "path",
      {
        "d": "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
      }
    ],
    [
      "rect",
      {
        "x": "2",
        "y": "4",
        "width": "20",
        "height": "16",
        "rx": "2"
      }
    ]
  ],
  "menu": [
    [
      "path",
      {
        "d": "M4 5h16"
      }
    ],
    [
      "path",
      {
        "d": "M4 12h16"
      }
    ],
    [
      "path",
      {
        "d": "M4 19h16"
      }
    ]
  ],
  "monitor": [
    [
      "rect",
      {
        "width": "20",
        "height": "14",
        "x": "2",
        "y": "3",
        "rx": "2"
      }
    ],
    [
      "line",
      {
        "x1": "8",
        "x2": "16",
        "y1": "21",
        "y2": "21"
      }
    ],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "17",
        "y2": "21"
      }
    ]
  ],
  "moon": [
    [
      "path",
      {
        "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      }
    ]
  ],
  "palette": [
    [
      "path",
      {
        "d": "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"
      }
    ],
    [
      "circle",
      {
        "cx": "13.5",
        "cy": "6.5",
        "r": ".5",
        "fill": "currentColor"
      }
    ],
    [
      "circle",
      {
        "cx": "17.5",
        "cy": "10.5",
        "r": ".5",
        "fill": "currentColor"
      }
    ],
    [
      "circle",
      {
        "cx": "6.5",
        "cy": "12.5",
        "r": ".5",
        "fill": "currentColor"
      }
    ],
    [
      "circle",
      {
        "cx": "8.5",
        "cy": "7.5",
        "r": ".5",
        "fill": "currentColor"
      }
    ]
  ],
  "phone": [
    [
      "path",
      {
        "d": "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
      }
    ]
  ],
  "play": [
    [
      "path",
      {
        "d": "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
      }
    ]
  ],
  "quote": [
    [
      "path",
      {
        "d": "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"
      }
    ],
    [
      "path",
      {
        "d": "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"
      }
    ]
  ],
  "send": [
    [
      "path",
      {
        "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      }
    ],
    [
      "path",
      {
        "d": "m21.854 2.147-10.94 10.939"
      }
    ]
  ],
  "sparkles": [
    [
      "path",
      {
        "d": "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
      }
    ],
    [
      "path",
      {
        "d": "M20 2v4"
      }
    ],
    [
      "path",
      {
        "d": "M22 4h-4"
      }
    ],
    [
      "circle",
      {
        "cx": "4",
        "cy": "20",
        "r": "2"
      }
    ]
  ],
  "star": [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ],
  "sun": [
    [
      "circle",
      {
        "cx": "12",
        "cy": "12",
        "r": "4"
      }
    ],
    [
      "path",
      {
        "d": "M12 2v2"
      }
    ],
    [
      "path",
      {
        "d": "M12 20v2"
      }
    ],
    [
      "path",
      {
        "d": "m4.93 4.93 1.41 1.41"
      }
    ],
    [
      "path",
      {
        "d": "m17.66 17.66 1.41 1.41"
      }
    ],
    [
      "path",
      {
        "d": "M2 12h2"
      }
    ],
    [
      "path",
      {
        "d": "M20 12h2"
      }
    ],
    [
      "path",
      {
        "d": "m6.34 17.66-1.41 1.41"
      }
    ],
    [
      "path",
      {
        "d": "m19.07 4.93-1.41 1.41"
      }
    ]
  ],
  "x": [
    [
      "path",
      {
        "d": "M18 6 6 18"
      }
    ],
    [
      "path",
      {
        "d": "m6 6 12 12"
      }
    ]
  ]
}

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 24, fill, className }: { name: string; size?: number; fill?: string; className?: string }) {
  const els = ICONS[name]
  if (!els) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-${name}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {els.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  )
}
