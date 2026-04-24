-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.908880
-- Table: core.permission

INSERT INTO core.permission (permission_id, permission_code, module, resource, action, description) VALUES
('9f2401c4-3c66-50fb-bc6b-b3d59fc2ad57', 'perm_cmd_read', 'command_center', 'dashboard', 'read', 'read access to dashboard in command_center'),
('598e9561-bcb1-5615-9c3f-1f081f0381dd', 'perm_rec_read', 'record', 'scope1', 'read', 'read access to scope1 in record'),
('cbcc356d-c25d-5ff4-b438-66c51ea2aad7', 'perm_rec_write', 'record', 'scope1', 'write', 'write access to scope1 in record'),
('7981e3f2-5280-50ad-b425-730dfe0f9885', 'perm_rec_approve', 'record', 'scope1', 'approve', 'approve access to scope1 in record'),
('af56aa5b-6135-5aee-a2fb-462b765b983f', 'perm_red_read', 'reduce', 'initiative', 'read', 'read access to initiative in reduce'),
('d81132e9-40b3-5961-a37b-d75bae402026', 'perm_red_write', 'reduce', 'initiative', 'write', 'write access to initiative in reduce'),
('aebb0548-b175-5f0b-995a-4cfc0caedeeb', 'perm_rep_read', 'report', 'report', 'read', 'read access to report in report'),
('a26f813b-cc10-5713-9f07-32ec4c8d8b7f', 'perm_rep_write', 'report', 'report', 'write', 'write access to report in report'),
('fb8c0795-2858-5e57-9f65-610fe3f26c12', 'perm_rep_export', 'report', 'report', 'export', 'export access to report in report'),
('4adb574e-70db-5e0d-bcd2-8bc94195a51f', 'perm_gov_read', 'govern', 'audit_trail', 'read', 'read access to audit_trail in govern'),
('b5395833-6586-52fb-bd21-acc71a609467', 'perm_gov_approve', 'govern', 'approval', 'approve', 'approve access to approval in govern'),
('6abf4a0c-b692-5ae9-83fe-0f5364976bf5', 'perm_set_admin', 'settings', 'all', 'admin', 'admin access to all in settings');
