import React from "react";
import TrafficRuleCard from "./TrafficRuleCard";
import trafficRules from "../../../Data/trafficRules";

export default function TrafficRuleList({ selectedCategory, searchTerm }) {
  const term = searchTerm.trim().toLowerCase();

  // Search reaches the additional-penalty text too: people look up "impound"
  // or "community service" as often as they look up an offence by name.
  const filteredRules = trafficRules.filter((rule) => {
    if (rule.category !== selectedCategory) return false;
    if (!term) return true;
    return (
      rule.title.toLowerCase().includes(term) ||
      rule.additional.toLowerCase().includes(term) ||
      rule.fine.toLowerCase().includes(term)
    );
  });

  return (
    <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto pr-4">
      {filteredRules.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredRules.map((rule) => (
              <TrafficRuleCard
                key={rule.id}
                title={rule.title}
                points={rule.points}
                fine={rule.fine}
                additional={rule.additional}
                authority={rule.authority}
              />
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[#05243F]/40">
            {filteredRules.length} of {trafficRules.length} offences. Penalties
            are as gazetted in the Lagos State Transport Sector Reform Law;
            amounts may have been amended since. Confirm before relying on a
            figure.
          </p>
        </>
      ) : (
        <p className="text-sm text-[#05243F]/60">
          {term
            ? `No offences match “${searchTerm}” in this category.`
            : "No traffic rules found for this category."}
        </p>
      )}
    </div>
  );
}
