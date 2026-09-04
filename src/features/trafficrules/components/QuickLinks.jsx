// These were inert anchors pointing at "#". They now seed the search box,
// which is what they always looked like they did.
const links = [
  { label: "Driver’s Licence", term: "licence" },
  { label: "Road Worthiness", term: "road worthiness" },
  { label: "Speed Limit", term: "speed" },
  { label: "Traffic Lights", term: "traffic light" },
  { label: "Impounding", term: "impound" },
];

export default function QuickLinks({ onSelect, activeTerm }) {
  return (
    <ul className="mt-4 flex flex-row flex-wrap gap-1.5">
      {links.map((link) => {
        const active = activeTerm === link.term;
        return (
          <li key={link.term}>
            <button
              type="button"
              onClick={() => onSelect(active ? "" : link.term)}
              aria-pressed={active}
              className={`text-xs font-medium underline transition-colors ${
                active
                  ? "text-[#2389E3]"
                  : "text-[#05243F]/40 hover:text-[#05243F]"
              }`}
            >
              {link.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
