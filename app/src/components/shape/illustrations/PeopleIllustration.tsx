interface Props {
  size?: number;
}

export default function PeopleIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Overlapping organic forms — stones in a creek bed */}
      {/* Large central form */}
      <path
        d="M108 105 C98 88, 108 72, 126 72 C142 72, 150 88, 140 105 C130 120, 116 120, 108 105"
        stroke="#5C7A62"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="#8BAF8E"
        fillOpacity="0.1"
        opacity="0.7"
      />
      {/* Left form — slightly smaller */}
      <path
        d="M78 118 C70 104, 76 88, 92 86 C106 84, 114 98, 106 114 C100 126, 86 128, 78 118"
        stroke="#8BAF8E"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="#A8C4AA"
        fillOpacity="0.08"
        opacity="0.6"
      />
      {/* Right form */}
      <path
        d="M150 122 C144 108, 150 92, 164 90 C176 88, 182 102, 176 116 C170 128, 158 132, 150 122"
        stroke="#8BAF8E"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="#8BAF8E"
        fillOpacity="0.08"
        opacity="0.6"
      />
      {/* Small form — top right */}
      <path
        d="M146 78 C142 68, 148 58, 158 58 C168 58, 172 68, 166 78 C160 86, 150 86, 146 78"
        stroke="#A8C4AA"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      {/* Small form — bottom center */}
      <path
        d="M112 145 C108 138, 114 130, 124 130 C132 130, 136 138, 130 145 C124 152, 118 152, 112 145"
        stroke="#A8C4AA"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}
