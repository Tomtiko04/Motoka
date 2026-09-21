import { useState } from "react";
import TrafficRulesLayout from "./components/TrafficRulesLayout";
import SearchBar from "./components/SearchBar";
import QuickLinks from "./components/QuickLinks";
import Categories from "./components/Categories";
import TrafficRuleList from "./components/TrafficRuleList";

export default function TrafficRules() {
  const [selectedCategory, setSelectedCategory] = useState(
    "Licensing&Registration",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const formatCategory = (category) =>
    category
      .replace(/&/g, " & ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim();

  return (
    <TrafficRulesLayout
      title="Traffic Rules"
      subTitle="We have curated the traffic rules for you to help you for better understanding of Traffic Rules."
      heading={formatCategory(selectedCategory)}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[245px_1fr]">
        {/* Side 1 */}
        <div>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <QuickLinks onSelect={setSearchTerm} activeTerm={searchTerm} />
          <Categories
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
        {/* Side 2 */}
        <div>
          <TrafficRuleList
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </TrafficRulesLayout>
  );
}
