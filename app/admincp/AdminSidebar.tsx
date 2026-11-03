import {
  FaGavel,
  FaHistory,
  FaProjectDiagram,
  FaSmile,
  FaSitemap,
  FaStar,
  FaSyncAlt,
  FaTag,
  FaTachometerAlt,
  FaTerminal,
  FaUserShield,
} from "react-icons/fa";
import NavigationItem from "./NavigationItem";
import NavigationSection from "./NavigationSection";

export default function AdminSidebar() {
  return (
    <aside className="fixed top-12 bottom-0 left-0 z-30 flex w-56 shrink-0 select-none flex-col justify-between overflow-y-auto border-r border-[#e2e5e9] bg-white py-3">
      <div className="space-y-4 px-3">
        <NavigationSection title="Administration">
          <NavigationItem
            icon={FaTachometerAlt}
            label="Overview & Stats"
            href="/admincp"
          />
          <NavigationItem
            icon={FaSitemap}
            label="Nodes & Categories"
            href="#"
          />
          <NavigationItem
            icon={FaUserShield}
            label="Moderation Queue"
            href="#"
            badge="4"
          />
          <NavigationItem
            icon={FaGavel}
            label="Ban Management"
            href="#"
          />
        </NavigationSection>

        <NavigationSection title="Social & Post Ratings">
          <NavigationItem
            icon={FaSmile}
            label="Rating Configuration"
            href="#"
          />
          <NavigationItem icon={FaStar} label="VIP Users" href="#" />
          <NavigationItem icon={FaTag} label="Thread Prefixes" href="#" />
        </NavigationSection>

        <NavigationSection title="Tools & Daemon">
          <NavigationItem
            icon={FaProjectDiagram}
            label="Background Workers"
            href="#"
          />
          <NavigationItem
            icon={FaSyncAlt}
            label="Cache & Indexes"
            href="#"
          />
          <NavigationItem
            icon={FaTerminal}
            label="Server Environment"
            href="#"
          />
          <NavigationItem
            icon={FaHistory}
            label="Event & Error Logs"
            href="#"
          />
        </NavigationSection>
      </div>

      <div className="border-t border-gray-100 px-3 pt-3">
        <div className="space-y-1 rounded border border-gray-200/90 bg-gray-50 p-2.5 font-mono text-[11px]">
          <div className="flex justify-between text-gray-500">
            <span>stat:</span>
            <span className="font-semibold text-gray-800">0.18, 0.22</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>stat:</span>
            <span className="font-semibold text-emerald-600">14 / 150</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>stat:</span>
            <span className="font-semibold text-blue-600">99.4%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
