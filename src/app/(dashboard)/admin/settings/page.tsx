"use client";

import { useState } from "react";
import { Settings, Save, Mail, Bell, Eye } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

interface SettingsState {
  platformName: string;
  platformDescription: string;
  emailNotifications: boolean;
  bidAlerts: boolean;
  auctionUpdates: boolean;
  itemsPerPage: number;
  dateFormat: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    platformName: "AuctionHub",
    platformDescription: "A modern online auction platform for buying and selling unique items.",
    emailNotifications: true,
    bidAlerts: true,
    auctionUpdates: false,
    itemsPerPage: 20,
    dateFormat: "MM/DD/YYYY",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    alert("Settings saved successfully!");
  };

  const toggleSetting = (key: keyof Pick<SettingsState, "emailNotifications" | "bidAlerts" | "auctionUpdates">) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <div className="text-indigo-500">{icon}</div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );

  const Toggle = ({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all ${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Settings size={22} />}
        title="Settings"
        description="Platform configuration"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Save size={16} className={saving ? "animate-spin" : ""} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="General Settings" icon={<Settings size={16} />}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings((prev) => ({ ...prev, platformName: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Description</label>
            <textarea
              value={settings.platformDescription}
              onChange={(e) => setSettings((prev) => ({ ...prev, platformDescription: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white resize-none"
            />
          </div>
        </Section>

        <Section title="Notification Settings" icon={<Bell size={16} />}>
          <Toggle
            label="Email Notifications"
            description="Send email notifications for important events"
            enabled={settings.emailNotifications}
            onToggle={() => toggleSetting("emailNotifications")}
          />
          <Toggle
            label="Bid Alerts"
            description="Notify users when they are outbid"
            enabled={settings.bidAlerts}
            onToggle={() => toggleSetting("bidAlerts")}
          />
          <Toggle
            label="Auction Updates"
            description="Send updates about auction status changes"
            enabled={settings.auctionUpdates}
            onToggle={() => toggleSetting("auctionUpdates")}
          />
        </Section>

        <Section title="Display Settings" icon={<Eye size={16} />}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Items Per Page</label>
            <select
              value={settings.itemsPerPage}
              onChange={(e) => setSettings((prev) => ({ ...prev, itemsPerPage: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
            >
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
              <option value={50}>50 items</option>
              <option value={100}>100 items</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings((prev) => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </Section>
      </div>
    </div>
  );
}
