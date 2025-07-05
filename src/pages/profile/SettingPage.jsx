import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProfilePage.css';

const SettingPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      emailUpdates: true,
      emailNews: false
    },
    privacy: {
      profileVisibility: 'public',
      activityVisibility: 'friends',
      contactInfo: 'private'
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false
    },
    language: {
      preferredLanguage: 'english',
      dateFormat: 'dd/mm/yyyy'
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleRadioChange = (category, setting, value) => {
    handleSettingChange(category, setting, value);
  };

  const handleSelectChange = (category, setting, e) => {
    handleSettingChange(category, setting, e.target.value);
  };

  const saveSettings = () => {
    // Here you would implement the API call to save settings
    console.log('Settings saved:', settings);
    // Show success message
    setMessage({
      text: 'Settings saved successfully!',
      type: 'success'
    });
  };

  const [message, setMessage] = useState({ text: '', type: '' });

  return (
    <div className="profile-container">
      {/* Header Banner */}
      <div className="profile-header-banner">
        <div className="profile-header-content">
          <h1>Settings</h1>
          <p>Customize your account settings and preferences</p>
        </div>
      </div>

      {/* Message notifications */}
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          <div className="message-icon">
            {message.type === 'success' ? (
              <FontAwesomeIcon icon="check" />
            ) : (
              <FontAwesomeIcon icon="times" />
            )}
          </div>
          <span>{message.text}</span>
          <button className="message-close" onClick={() => setMessage({ text: '', type: '' })}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      )}

      <div className="profile-layout">
        {/* Settings Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-menu">
            <div 
              className={`sidebar-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FontAwesomeIcon icon="bell" />
              Notification Settings
            </div>
            <div 
              className={`sidebar-menu-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <FontAwesomeIcon icon="shield-alt" />
              Privacy Settings
            </div>
            <div 
              className={`sidebar-menu-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <FontAwesomeIcon icon="palette" />
              Appearance
            </div>
            <div 
              className={`sidebar-menu-item ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              <FontAwesomeIcon icon="language" />
              Language & Region
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          <div className="content-header">
            <h2>
              {activeTab === 'notifications' && 'Notification Settings'}
              {activeTab === 'privacy' && 'Privacy Settings'}
              {activeTab === 'appearance' && 'Appearance Settings'}
              {activeTab === 'language' && 'Language & Region'}
            </h2>
            <button className="save-profile-btn" onClick={saveSettings}>
              <FontAwesomeIcon icon="save" />
              Save Settings
            </button>
          </div>

          <div className="profile-form">
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="profile-section-title">
                  <FontAwesomeIcon icon="bell" />
                  Email Notifications
                </div>
                <div className="settings-option">
                  <div className="setting-toggle">
                    <span className="setting-label">Email notifications</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.emailNotifications}
                        onChange={() => handleToggle('notifications', 'emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="setting-description">Receive email notifications about important updates</p>
                </div>

                <div className="settings-option">
                  <div className="setting-toggle">
                    <span className="setting-label">Email newsletters</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.emailNews}
                        onChange={() => handleToggle('notifications', 'emailNews')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="setting-description">Receive newsletters and promotional emails</p>
                </div>

                <div className="profile-section-title">
                  <FontAwesomeIcon icon="mobile-alt" />
                  Push Notifications
                </div>
                <div className="settings-option">
                  <div className="setting-toggle">
                    <span className="setting-label">Push notifications</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.pushNotifications}
                        onChange={() => handleToggle('notifications', 'pushNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="setting-description">Receive push notifications on your devices</p>
                </div>

                <div className="settings-option">
                  <div className="setting-toggle">
                    <span className="setting-label">SMS notifications</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.smsNotifications}
                        onChange={() => handleToggle('notifications', 'smsNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="setting-description">Receive SMS notifications for important updates</p>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <div className="profile-section-title">
                  <FontAwesomeIcon icon="user-shield" />
                  Profile Visibility
                </div>

                <div className="settings-option">
                  <span className="setting-label">Who can see your profile</span>
                  <div className="radio-options">
                    <label className={`radio-label ${settings.privacy.profileVisibility === 'public' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="profileVisibility" 
                        value="public"
                        checked={settings.privacy.profileVisibility === 'public'}
                        onChange={() => handleRadioChange('privacy', 'profileVisibility', 'public')}
                      />
                      <FontAwesomeIcon icon="globe" />
                      Public
                    </label>
                    <label className={`radio-label ${settings.privacy.profileVisibility === 'friends' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="profileVisibility" 
                        value="friends"
                        checked={settings.privacy.profileVisibility === 'friends'}
                        onChange={() => handleRadioChange('privacy', 'profileVisibility', 'friends')}
                      />
                      <FontAwesomeIcon icon="user-friends" />
                      Friends only
                    </label>
                    <label className={`radio-label ${settings.privacy.profileVisibility === 'private' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="profileVisibility" 
                        value="private"
                        checked={settings.privacy.profileVisibility === 'private'}
                        onChange={() => handleRadioChange('privacy', 'profileVisibility', 'private')}
                      />
                      <FontAwesomeIcon icon="lock" />
                      Private
                    </label>
                  </div>
                </div>

                <div className="settings-option">
                  <span className="setting-label">Contact information visibility</span>
                  <div className="radio-options">
                    <label className={`radio-label ${settings.privacy.contactInfo === 'public' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="contactInfo" 
                        value="public"
                        checked={settings.privacy.contactInfo === 'public'}
                        onChange={() => handleRadioChange('privacy', 'contactInfo', 'public')}
                      />
                      <FontAwesomeIcon icon="globe" />
                      Public
                    </label>
                    <label className={`radio-label ${settings.privacy.contactInfo === 'friends' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="contactInfo" 
                        value="friends"
                        checked={settings.privacy.contactInfo === 'friends'}
                        onChange={() => handleRadioChange('privacy', 'contactInfo', 'friends')}
                      />
                      <FontAwesomeIcon icon="user-friends" />
                      Friends only
                    </label>
                    <label className={`radio-label ${settings.privacy.contactInfo === 'private' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="contactInfo" 
                        value="private"
                        checked={settings.privacy.contactInfo === 'private'}
                        onChange={() => handleRadioChange('privacy', 'contactInfo', 'private')}
                      />
                      <FontAwesomeIcon icon="lock" />
                      Private
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="profile-section-title">
                  <FontAwesomeIcon icon="palette" />
                  Theme
                </div>
                <div className="settings-option">
                  <span className="setting-label">Choose your theme</span>
                  <div className="theme-options">
                    <label className={`theme-option ${settings.appearance.theme === 'light' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="light"
                        checked={settings.appearance.theme === 'light'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'light')}
                      />
                      <div className="theme-preview light-theme">
                        <FontAwesomeIcon icon="sun" />
                        Light
                      </div>
                    </label>
                    <label className={`theme-option ${settings.appearance.theme === 'dark' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="dark"
                        checked={settings.appearance.theme === 'dark'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'dark')}
                      />
                      <div className="theme-preview dark-theme">
                        <FontAwesomeIcon icon="moon" />
                        Dark
                      </div>
                    </label>
                    <label className={`theme-option ${settings.appearance.theme === 'system' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="system"
                        checked={settings.appearance.theme === 'system'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'system')}
                      />
                      <div className="theme-preview system-theme">
                        <FontAwesomeIcon icon="laptop" />
                        System
                      </div>
                    </label>
                  </div>
                </div>

                <div className="profile-section-title">
                  <FontAwesomeIcon icon="text-height" />
                  Text Size
                </div>
                <div className="settings-option">
                  <span className="setting-label">Font size</span>
                  <select 
                    className="settings-select"
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleSelectChange('appearance', 'fontSize', e)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                <div className="settings-option">
                  <div className="setting-toggle">
                    <span className="setting-label">Compact mode</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.appearance.compactMode}
                        onChange={() => handleToggle('appearance', 'compactMode')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="setting-description">Reduce spacing and show more content</p>
                </div>
              </div>
            )}

            {/* Language & Region Settings */}
            {activeTab === 'language' && (
              <div className="settings-section">
                <div className="profile-section-title">
                  <FontAwesomeIcon icon="language" />
                  Language
                </div>
                <div className="settings-option">
                  <span className="setting-label">Preferred language</span>
                  <select 
                    className="settings-select"
                    value={settings.language.preferredLanguage}
                    onChange={(e) => handleSelectChange('language', 'preferredLanguage', e)}
                  >
                    <option value="english">English</option>
                    <option value="vietnamese">Vietnamese</option>
                    <option value="french">French</option>
                    <option value="spanish">Spanish</option>
                    <option value="german">German</option>
                  </select>
                </div>

                <div className="profile-section-title">
                  <FontAwesomeIcon icon="calendar-alt" />
                  Date Format
                </div>
                <div className="settings-option">
                  <span className="setting-label">Date format</span>
                  <select 
                    className="settings-select"
                    value={settings.language.dateFormat}
                    onChange={(e) => handleSelectChange('language', 'dateFormat', e)}
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
