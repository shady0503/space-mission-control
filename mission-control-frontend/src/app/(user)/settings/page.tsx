'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, Palette, Globe, Monitor, 
  Moon, Sun, Volume2, VolumeX, Eye, EyeOff,
  Save, RefreshCw, Download, Upload, Trash2,
  Settings as SettingsIcon, ChevronRight, Lock,
  Mail, Phone, MapPin, Calendar, Clock
} from 'lucide-react';

const SettingsSection = ({ icon: Icon, title, description, children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-slate-900/80 rounded-lg border border-slate-800 p-6 mb-6"
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mr-3">
          <Icon size={20} className="text-slate-900" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
};

const ToggleSwitch = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-slate-200 font-medium">{label}</p>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, description }) => {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
      {description && <p className="text-xs text-slate-400 mb-2">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", placeholder, description }) => {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
      {description && <p className="text-xs text-slate-400 mb-2">{description}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, variant = "primary", disabled = false }) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-indigo-500 hover:bg-indigo-400 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
};

const SettingsPage = () => {
  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState({
    username: 'john.doe',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    language: 'en'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    missionAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true,
    deviceTracking: true
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    colorScheme: 'indigo',
    fontSize: 'medium',
    sidebarCollapsed: false,
    animations: true,
    highContrast: false
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    dataRetention: '365',
    exportFormat: 'json',
    refreshRate: '5',
    cacheEnabled: true
  });

  const handleSaveSettings = () => {
    console.log('Saving settings...', {
      profile: profileSettings,
      notifications: notificationSettings,
      security: securitySettings,
      appearance: appearanceSettings,
      system: systemSettings
    });
    // In a real app, this would make an API call
  };

  const handleResetSettings = () => {
    console.log('Resetting settings to defaults...');
    // Reset to default values
  };

  const handleExportSettings = () => {
    console.log('Exporting settings...');
    // Export settings as JSON
  };

  const handleImportSettings = () => {
    console.log('Importing settings...');
    // Import settings from file
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen text-slate-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mr-3">
            <SettingsIcon size={20} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <p className="text-slate-400">Manage your account preferences and system configuration</p>
      </motion.div>

      {/* Profile Settings */}
      <SettingsSection
        icon={User}
        title="Profile Settings"
        description="Manage your personal information and account details"
        delay={0.1}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            value={profileSettings.username}
            onChange={(value) => setProfileSettings({...profileSettings, username: value})}
            description="Your unique identifier"
          />
          <InputField
            label="Email Address"
            value={profileSettings.email}
            onChange={(value) => setProfileSettings({...profileSettings, email: value})}
            type="email"
            description="Primary contact email"
          />
          <InputField
            label="Full Name"
            value={profileSettings.fullName}
            onChange={(value) => setProfileSettings({...profileSettings, fullName: value})}
            description="Your display name"
          />
          <InputField
            label="Phone Number"
            value={profileSettings.phone}
            onChange={(value) => setProfileSettings({...profileSettings, phone: value})}
            type="tel"
            description="Contact phone number"
          />
          <InputField
            label="Location"
            value={profileSettings.location}
            onChange={(value) => setProfileSettings({...profileSettings, location: value})}
            description="Your current location"
          />
          <SelectField
            label="Timezone"
            value={profileSettings.timezone}
            onChange={(value) => setProfileSettings({...profileSettings, timezone: value})}
            description="Your local timezone"
            options={[
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'America/Denver', label: 'Mountain Time (MT)' },
              { value: 'America/Chicago', label: 'Central Time (CT)' },
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'UTC', label: 'UTC' }
            ]}
          />
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection
        icon={Bell}
        title="Notification Settings"
        description="Configure how and when you receive notifications"
        delay={0.2}
      >
        <div className="space-y-2">
          <ToggleSwitch
            enabled={notificationSettings.emailNotifications}
            onChange={(value) => setNotificationSettings({...notificationSettings, emailNotifications: value})}
            label="Email Notifications"
            description="Receive notifications via email"
          />
          <ToggleSwitch
            enabled={notificationSettings.pushNotifications}
            onChange={(value) => setNotificationSettings({...notificationSettings, pushNotifications: value})}
            label="Push Notifications"
            description="Browser push notifications"
          />
          <ToggleSwitch
            enabled={notificationSettings.missionAlerts}
            onChange={(value) => setNotificationSettings({...notificationSettings, missionAlerts: value})}
            label="Mission Alerts"
            description="Critical mission status updates"
          />
          <ToggleSwitch
            enabled={notificationSettings.systemUpdates}
            onChange={(value) => setNotificationSettings({...notificationSettings, systemUpdates: value})}
            label="System Updates"
            description="System maintenance and updates"
          />
          <ToggleSwitch
            enabled={notificationSettings.weeklyReports}
            onChange={(value) => setNotificationSettings({...notificationSettings, weeklyReports: value})}
            label="Weekly Reports"
            description="Weekly activity summaries"
          />
          <ToggleSwitch
            enabled={notificationSettings.soundEnabled}
            onChange={(value) => setNotificationSettings({...notificationSettings, soundEnabled: value})}
            label="Sound Notifications"
            description="Play sounds for notifications"
          />
        </div>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection
        icon={Shield}
        title="Security Settings"
        description="Manage your account security and privacy"
        delay={0.3}
      >
        <div className="space-y-4">
          <ToggleSwitch
            enabled={securitySettings.twoFactorAuth}
            onChange={(value) => setSecuritySettings({...securitySettings, twoFactorAuth: value})}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
          />
          <ToggleSwitch
            enabled={securitySettings.loginAlerts}
            onChange={(value) => setSecuritySettings({...securitySettings, loginAlerts: value})}
            label="Login Alerts"
            description="Get notified of new login attempts"
          />
          <ToggleSwitch
            enabled={securitySettings.deviceTracking}
            onChange={(value) => setSecuritySettings({...securitySettings, deviceTracking: value})}
            label="Device Tracking"
            description="Track devices that access your account"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Session Timeout"
              value={securitySettings.sessionTimeout}
              onChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
              description="Automatic logout after inactivity"
              options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '240', label: '4 hours' },
                { value: '480', label: '8 hours' }
              ]}
            />
            <SelectField
              label="Password Expiry"
              value={securitySettings.passwordExpiry}
              onChange={(value) => setSecuritySettings({...securitySettings, passwordExpiry: value})}
              description="Force password change interval"
              options={[
                { value: '30', label: '30 days' },
                { value: '60', label: '60 days' },
                { value: '90', label: '90 days' },
                { value: '180', label: '6 months' },
                { value: 'never', label: 'Never' }
              ]}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Appearance Settings */}
      <SettingsSection
        icon={Palette}
        title="Appearance Settings"
        description="Customize the look and feel of your interface"
        delay={0.4}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Theme"
              value={appearanceSettings.theme}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}
              description="Choose your preferred theme"
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
            />
            <SelectField
              label="Color Scheme"
              value={appearanceSettings.colorScheme}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, colorScheme: value})}
              description="Primary color scheme"
              options={[
                { value: 'indigo', label: 'Indigo' },
                { value: 'blue', label: 'Blue' },
                { value: 'purple', label: 'Purple' },
                { value: 'green', label: 'Green' },
                { value: 'red', label: 'Red' }
              ]}
            />
            <SelectField
              label="Font Size"
              value={appearanceSettings.fontSize}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, fontSize: value})}
              description="Interface font size"
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <ToggleSwitch
              enabled={appearanceSettings.sidebarCollapsed}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, sidebarCollapsed: value})}
              label="Collapsed Sidebar"
              description="Start with sidebar collapsed"
            />
            <ToggleSwitch
              enabled={appearanceSettings.animations}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, animations: value})}
              label="Animations"
              description="Enable interface animations"
            />
            <ToggleSwitch
              enabled={appearanceSettings.highContrast}
              onChange={(value) => setAppearanceSettings({...appearanceSettings, highContrast: value})}
              label="High Contrast"
              description="Increase contrast for better visibility"
            />
          </div>
        </div>
      </SettingsSection>

      {/* System Settings */}
      <SettingsSection
        icon={Monitor}
        title="System Settings"
        description="Configure system behavior and data management"
        delay={0.5}
      >
        <div className="space-y-4">
          <ToggleSwitch
            enabled={systemSettings.autoSave}
            onChange={(value) => setSystemSettings({...systemSettings, autoSave: value})}
            label="Auto Save"
            description="Automatically save changes"
          />
          <ToggleSwitch
            enabled={systemSettings.cacheEnabled}
            onChange={(value) => setSystemSettings({...systemSettings, cacheEnabled: value})}
            label="Enable Caching"
            description="Cache data for better performance"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Data Retention"
              value={systemSettings.dataRetention}
              onChange={(value) => setSystemSettings({...systemSettings, dataRetention: value})}
              description="How long to keep data"
              options={[
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
                { value: '180', label: '6 months' },
                { value: '365', label: '1 year' },
                { value: 'forever', label: 'Forever' }
              ]}
            />
            <SelectField
              label="Export Format"
              value={systemSettings.exportFormat}
              onChange={(value) => setSystemSettings({...systemSettings, exportFormat: value})}
              description="Default export format"
              options={[
                { value: 'json', label: 'JSON' },
                { value: 'csv', label: 'CSV' },
                { value: 'xml', label: 'XML' },
                { value: 'pdf', label: 'PDF' }
              ]}
            />
            <SelectField
              label="Refresh Rate"
              value={systemSettings.refreshRate}
              onChange={(value) => setSystemSettings({...systemSettings, refreshRate: value})}
              description="Data refresh interval (seconds)"
              options={[
                { value: '1', label: '1 second' },
                { value: '5', label: '5 seconds' },
                { value: '10', label: '10 seconds' },
                { value: '30', label: '30 seconds' },
                { value: '60', label: '1 minute' }
              ]}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-slate-900/80 rounded-lg border border-slate-800 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            icon={Save}
            label="Save Settings"
            onClick={handleSaveSettings}
            variant="primary"
          />
          <ActionButton
            icon={RefreshCw}
            label="Reset to Defaults"
            onClick={handleResetSettings}
            variant="secondary"
          />
          <ActionButton
            icon={Download}
            label="Export Settings"
            onClick={handleExportSettings}
            variant="secondary"
          />
          <ActionButton
            icon={Upload}
            label="Import Settings"
            onClick={handleImportSettings}
            variant="secondary"
          />
          <ActionButton
            icon={Trash2}
            label="Clear All Data"
            onClick={() => console.log('Clear all data')}
            variant="danger"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
