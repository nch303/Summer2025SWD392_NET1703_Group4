import React, { useState, useEffect } from 'react';
import {
  Card, Checkbox, Spin, message,
  Divider, Badge, Input, Select,
  Tag, Modal, Button
} from '../../utils/AntComponents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './SendAnnouncementPage.module.css';
import { sendAnnouncement, getAllAccounts } from '../../services/AdminService';

const { Option } = Select;

const SendAnnouncementPage = () => {
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Fetch all accounts when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setFetchingAccounts(true);
        const data = await getAllAccounts();
        setAccounts(data || []);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        message.error('Cannot load account list');
      } finally {
        setFetchingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Get unique roles from accounts
  const uniqueRoles = [...new Set(accounts.map(account => account.roleName))];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccountSelection = (accountId) => {
    setSelectedAccountIds(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAccountIds.length === filteredAccounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(filteredAccounts.map(account => account.id));
    }
  };

  const handleSelectAllByRole = (role) => {
    const accountsByRole = accounts.filter(account => account.roleName === role);
    const accountIdsByRole = accountsByRole.map(account => account.id);

    const allSelected = accountIdsByRole.every(id => selectedAccountIds.includes(id));

    if (allSelected) {
      setSelectedAccountIds(prev => prev.filter(id => !accountIdsByRole.includes(id)));
    } else {
      const idsToAdd = accountIdsByRole.filter(id => !selectedAccountIds.includes(id));
      setSelectedAccountIds(prev => [...prev, ...idsToAdd]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedAccountIds.length === 0) {
      message.warning('Please select at least one account to send announcement');
      return;
    }

    setLoading(true);
    try {
      const data = {
        accountIDs: selectedAccountIds,
        title: form.title,
        content: form.content
      };

      await sendAnnouncement(data);
      message.success('Announcement sent successfully');

      // Lưu số lượng tài khoản đã gửi và hiện modal
      setSentCount(selectedAccountIds.length);
      setSuccessModal(true);

      // Reset form và selections
      setForm({ title: '', content: '' });
      setSelectedAccountIds([]);
    } catch (error) {
      console.error('Error sending announcement:', error);
      message.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Filter accounts based on search term and selected role
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      (account.fullName && account.fullName.toLowerCase().includes(searchTerm)) ||
      (account.email && account.email.toLowerCase().includes(searchTerm)) ||
      (account.username && account.username.toLowerCase().includes(searchTerm));

    const matchesRole = selectedRole ? account.roleName === selectedRole : true;

    return matchesSearch && matchesRole;
  });

  const allSelected = filteredAccounts.length > 0 &&
    selectedAccountIds.length >= filteredAccounts.length &&
    filteredAccounts.every(account => selectedAccountIds.includes(account.id));

  const getRoleTagColor = (role) => {
    switch (role) {
      case 'Admin': return 'red';
      case 'Staff': return 'blue';
      case 'Teacher': return 'green';
      case 'Parent': return 'purple';
      default: return 'default';
    }
  };

  const getSelectedCountByRole = (role) => {
    const accountsByRole = accounts.filter(account => account.roleName === role);
    const selectedAccountsByRole = accountsByRole.filter(account =>
      selectedAccountIds.includes(account.id)
    );
    return selectedAccountsByRole.length;
  };

  const isAllRoleSelected = (role) => {
    const accountsByRole = accounts.filter(account => account.roleName === role);
    return accountsByRole.every(account => selectedAccountIds.includes(account.id));
  };

  return (
    <div className={`${styles.adminContent} ${styles.sendAnnouncementPage}`}>
      <Card className={styles.announcementCard}>
        <div className={styles.announcementHeader}>
          <h1 className={styles.announcementTitle}>
            <FontAwesomeIcon icon="paper-plane" className={styles.announcementIcon} />
            Send announcement
          </h1>
          <p className={styles.announcementSubtitle}>
            Create and send announcements to users in the system
          </p>
        </div>

        <Divider className={styles.sectionDivider}>
          <span className={styles.dividerText}>Announcement content</span>
        </Divider>

        <form className={styles.announcementForm} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon="heading" className={styles.labelIcon} />
              Announcement title
            </label>
            <Input
              className={styles.announcementInput}
              name="title"
              placeholder="Enter announcement title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon="file-alt" className={styles.labelIcon} />
              Announcement content
            </label>
            <Input.TextArea
              className={styles.announcementTextarea}
              name="content"
              placeholder="Enter detailed announcement content"
              value={form.content}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <Divider className={styles.sectionDivider}>
            <span className={styles.dividerText}>Select recipients</span>
          </Divider>

          <div className={styles.accountSelectionContainer}>
            <div className={styles.accountSelectionHeader}>
              <div className={styles.selectionStatus}>
                <FontAwesomeIcon icon="users" className={styles.usersIcon} />
                <Badge
                  count={selectedAccountIds.length}
                  className={styles.selectedBadge}
                  style={{ backgroundColor: selectedAccountIds.length ? '#ff7e29' : '#d9d9d9' }}
                  overflowCount={999}
                />
              </div>

              <div className={styles.filtersContainer}>
                <div className={styles.searchContainer}>
                  <Input
                    placeholder="Search account..."
                    prefix={<FontAwesomeIcon icon="search" className="search-icon" />}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.roleFilter}>
                  <Select
                    placeholder="Filter by role"
                    onChange={handleRoleChange}
                    allowClear
                    className={styles.roleSelect}
                    value={selectedRole}
                  >
                    {uniqueRoles.map(role => (
                      <Option key={role} value={role}>
                        <Tag color={getRoleTagColor(role)}>{role}</Tag>
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className={styles.selectAllContainer}>
              <Checkbox
                checked={allSelected}
                onChange={handleSelectAll}
                disabled={fetchingAccounts || filteredAccounts.length === 0}
                className={styles.selectAllCheckbox}
              >
                <span className={styles.selectAllText}>Select all accounts</span>
              </Checkbox>
              <span className={styles.accountCount}>
                <Badge count={selectedAccountIds.length} style={{ backgroundColor: '#ff7e29' }} />
                <span className={styles.countText}>{selectedAccountIds.length} / {filteredAccounts.length} accounts selected</span>
              </span>
            </div>

            {/* Role-based selection */}
            <div className={styles.roleSelectionContainer}>
              {uniqueRoles.map(role => (
                <div key={role} className={styles.roleSelectionItem}>
                  <Checkbox
                    checked={isAllRoleSelected(role)}
                    onChange={() => handleSelectAllByRole(role)}
                    className={styles.roleCheckbox}
                  >
                    <div className={styles.roleInfo}>
                      <Tag color={getRoleTagColor(role)}>{role}</Tag>
                      <span className={styles.roleCount}>
                        {getSelectedCountByRole(role)} / {accounts.filter(acc => acc.roleName === role).length} selected
                      </span>
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>

            <div className={styles.accountsList}>
              {fetchingAccounts ? (
                <div className={styles.loadingAccounts}>
                  <Spin size="large" />
                  <span>Loading account list...</span>
                </div>
              ) : filteredAccounts.length > 0 ? (
                <div className={styles.accountCheckboxes}>
                  {filteredAccounts.map(account => (
                    <div key={account.id} className={`${styles.accountCheckboxItem} ${selectedAccountIds.includes(account.id) ? styles.selected : ''}`}>
                      <Checkbox
                        checked={selectedAccountIds.includes(account.id)}
                        onChange={() => handleAccountSelection(account.id)}
                      >
                        <div className={styles.accountInfo}>
                          <span className={styles.accountName}>
                            <FontAwesomeIcon icon="user" className={styles.accountIcon} />
                            {account.fullName || "No name"}
                          </span>
                          {account.email && (
                            <span className={styles.accountEmail}>
                              <FontAwesomeIcon icon="envelope" className={styles.emailIcon} />
                              {account.email}
                            </span>
                          )}
                          <span className={styles.accountRole}>
                            <FontAwesomeIcon icon="id-badge" className={styles.roleIcon} />
                            <Tag color={getRoleTagColor(account.roleName)}>{account.roleName}</Tag>
                          </span>
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noAccounts}>
                  <FontAwesomeIcon icon="exclamation-circle" className={styles.emptyIcon} />
                  {searchTerm ? "No matching account found" : "No account found"}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.announcementBtn}
              type="submit"
              disabled={loading || selectedAccountIds.length === 0}
            >
              {loading ? (
                <>
                  <Spin size="small" className={styles.btnSpinner} /> Sending...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="paper-plane" className={styles.btnIcon} /> Send announcement
                </>
              )}
            </button>

            {selectedAccountIds.length > 0 && (
              <div className={styles.selectedInfo}>
                Announcement will be sent to {selectedAccountIds.length} accounts
              </div>
            )}
          </div>
        </form>
      </Card>

      <Modal
        title="Announcement sent successfully"
        open={successModal}
        onOk={() => setSuccessModal(false)}
        onCancel={() => setSuccessModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setSuccessModal(false)}>
            OK
          </Button>
        ]}
      >
        <div className={styles.successMessage}>
          <FontAwesomeIcon icon="check-circle" style={{ color: '#52c41a', fontSize: '32px', marginBottom: '16px' }} />
          <p>Announcement sent successfully to {sentCount} accounts!</p>
        </div>
      </Modal>
    </div>
  );
};

export default SendAnnouncementPage; 