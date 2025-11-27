import {
  BookOutlined,
  DatabaseOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  BuildOutlined,
  CrownOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

// Helper to check if user role has access to content
export const hasRoleAccess = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};

// Get all help content filtered by role
export const getHelpContentByRole = (userRole) => {
  const allContent = {
    'getting-started': {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOutlined,
      color: '#1890ff',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
      items: [
        {
          id: 'gs-1',
          title: 'Welcome to the Platform',
          description: 'Learn the basics of navigating and using the platform.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Welcome! This platform helps you manage multi-tenant data, create configurable pages, and access dashboards without coding.</p>
            <h4>Key Features:</h4>
            <ul>
              <li><strong>Multi-Tenant Switching:</strong> Switch between different tenant databases seamlessly</li>
              <li><strong>Configurable Pages:</strong> Access data views configured by administrators</li>
              <li><strong>Custom Views:</strong> Personalize your data views with column customization</li>
              <li><strong>Data Export:</strong> Download data in Excel or CSV format</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'gs-2',
          title: 'How to Switch Between Tenants',
          description: 'Learn how to switch between different tenant databases.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Switching tenants allows you to access different databases and their data.</p>
            <h4>Steps:</h4>
            <ol>
              <li>Look for the <strong>Tenant Selector</strong> in the top right corner of the header</li>
              <li>Click on the dropdown to see available tenants</li>
              <li>Select the tenant you want to access</li>
              <li>Wait for the system to load tenant-specific data (you'll see a loading indicator)</li>
              <li>All pages and data will now reflect the selected tenant</li>
            </ol>
            <p><strong>Note:</strong> Your tenant access depends on your role and permissions. Contact your administrator if you don't see expected tenants.</p>
          `,
          videoUrl: null,
          steps: [
            'Click tenant selector in header',
            'Select desired tenant',
            'Wait for data to load',
          ],
        },
        {
          id: 'gs-3',
          title: 'Understanding Pages',
          description: 'What are pages and how to use them.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Pages are configurable data views that display information from your tenant databases.</p>
            <h4>What Pages Include:</h4>
            <ul>
              <li><strong>Data Tables:</strong> View data in a table format with sortable columns</li>
              <li><strong>Filters:</strong> Narrow down data based on specific criteria</li>
              <li><strong>Search:</strong> Quick search across configured fields</li>
              <li><strong>Downloads:</strong> Export data (if permissions allow)</li>
            </ul>
            <h4>How to Access Pages:</h4>
            <ul>
              <li>From the <strong>Home</strong> page, click on any page card</li>
              <li>Use the floating <strong>Page Switcher</strong> button (bottom right) for quick navigation</li>
              <li>Pages are automatically filtered based on your permissions</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'gs-4',
          title: 'First Steps After Login',
          description: 'What to do when you first log in.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>After logging in, follow these steps to get started:</p>
            <ol>
              <li><strong>Select a Tenant:</strong> Choose the tenant database you want to work with</li>
              <li><strong>Explore Pages:</strong> Browse available pages from the Home dashboard</li>
              <li><strong>Customize Your View:</strong> Adjust columns and filters to match your needs</li>
              <li><strong>Save Preferences:</strong> Your customizations are saved automatically</li>
            </ol>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'data-management': {
      id: 'data-management',
      title: 'Data Management',
      icon: DatabaseOutlined,
      color: '#52c41a',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
      items: [
        {
          id: 'dm-1',
          title: 'How to Filter Data',
          description: 'Use filters to narrow down your data view.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Filters help you focus on specific data that matters to you.</p>
            <h4>Using Filters:</h4>
            <ol>
              <li>Navigate to any data page</li>
              <li>Look for the <strong>Filter</strong> panel (usually on the left or top)</li>
              <li>Select filter criteria from the available options</li>
              <li>Click <strong>Apply</strong> to see filtered results</li>
              <li>Use <strong>Clear</strong> to reset all filters</li>
            </ol>
            <p><strong>Tip:</strong> Multiple filters can be combined for more precise results.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'dm-2',
          title: 'Column Customization',
          description: 'Show, hide, and reorder columns to create your perfect view.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Customize columns to match your workflow and preferences.</p>
            <h4>Column Options:</h4>
            <ul>
              <li><strong>Show/Hide:</strong> Toggle column visibility</li>
              <li><strong>Reorder:</strong> Drag and drop columns to rearrange</li>
              <li><strong>Resize:</strong> Adjust column widths</li>
            </ul>
            <h4>How to Customize:</h4>
            <ol>
              <li>Click the <strong>Column Settings</strong> icon (usually in the table header)</li>
              <li>Check/uncheck columns to show or hide them</li>
              <li>Drag columns to reorder them</li>
              <li>Changes are saved automatically to your preferences</li>
            </ol>
            <p><strong>Note:</strong> Your column preferences are saved per page and persist across sessions.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'dm-3',
          title: 'Downloading Data',
          description: 'Export your data in Excel or CSV format.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Export data for offline analysis or reporting.</p>
            <h4>Download Options:</h4>
            <ul>
              <li><strong>Excel (.xlsx):</strong> Best for complex data with formatting</li>
              <li><strong>CSV:</strong> Lightweight format, compatible with most tools</li>
            </ul>
            <h4>How to Download:</h4>
            <ol>
              <li>Apply any filters you want (downloads respect current filters)</li>
              <li>Click the <strong>Download</strong> or <strong>Export</strong> button</li>
              <li>Select format (Excel or CSV)</li>
              <li>Wait for the file to generate and download</li>
            </ol>
            <p><strong>Important:</strong> Download limits may apply based on your role and permissions. Large datasets may take time to process.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'dm-4',
          title: 'Searching Data',
          description: 'Quick search across your data.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>Use the search feature to quickly find specific records.</p>
            <h4>Search Tips:</h4>
            <ul>
              <li>Search works across configured searchable fields</li>
              <li>Partial matches are supported</li>
              <li>Search is case-insensitive</li>
              <li>Combine with filters for more precise results</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'user-management': {
      id: 'user-management',
      title: 'User Management',
      icon: UserOutlined,
      color: '#722ed1',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      items: [
        {
          id: 'um-1',
          title: 'Creating New Users',
          description: 'How to add new users to the system.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Add new users and assign appropriate roles and permissions.</p>
            <h4>Steps:</h4>
            <ol>
              <li>Navigate to <strong>User Management</strong> from the sidebar</li>
              <li>Click <strong>Add User</strong> or <strong>Create User</strong> button</li>
              <li>Fill in user details:
                <ul>
                  <li>Username (required, unique)</li>
                  <li>Password (minimum 6 characters)</li>
                  <li>Name, Email, Phone (optional)</li>
                  <li>Role (USER, MANAGER, ADMIN, DEVELOPER)</li>
                </ul>
              </li>
              <li>Assign tenant access (if role requires it)</li>
              <li>Assign page permissions</li>
              <li>Click <strong>Save</strong> to create the user</li>
            </ol>
            <p><strong>Role Permissions:</strong></p>
            <ul>
              <li><strong>SUPER_ADMIN:</strong> Full system access, manages all organizations</li>
              <li><strong>ADMIN:</strong> Manages users and tenants within their organization</li>
              <li><strong>MANAGER:</strong> Access to all tenants and pages in organization</li>
              <li><strong>DEVELOPER:</strong> Can configure pages and access developer features</li>
              <li><strong>USER:</strong> Standard user with assigned tenant and page access</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'um-2',
          title: 'Managing User Permissions',
          description: 'Assign tenant and page access to users.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Control what users can access through permissions.</p>
            <h4>Permission Types:</h4>
            <ul>
              <li><strong>Tenant Access:</strong> Which tenant databases a user can access</li>
              <li><strong>Page Access:</strong> Which pages a user can view</li>
            </ul>
            <h4>How to Manage:</h4>
            <ol>
              <li>Go to <strong>User Management</strong></li>
              <li>Click <strong>Edit</strong> on the user you want to modify</li>
              <li>In the edit form, select:
                <ul>
                  <li>Tenants the user can access (for USER role)</li>
                  <li>Pages the user can view (for USER role)</li>
                </ul>
              </li>
              <li>Save changes</li>
            </ol>
            <p><strong>Note:</strong> ADMIN, MANAGER, and DEVELOPER roles typically have access to all tenants/pages within their organization.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'um-3',
          title: 'Blocking and Unblocking Users',
          description: 'How to block or unblock user accounts.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Block users to prevent access or unblock to restore access.</p>
            <h4>To Block a User:</h4>
            <ol>
              <li>Go to <strong>User Management</strong></li>
              <li>Find the user and click <strong>Block</strong></li>
              <li>Provide a reason for blocking (optional but recommended)</li>
              <li>Confirm the action</li>
            </ol>
            <h4>To Unblock a User:</h4>
            <ol>
              <li>Go to <strong>User Management</strong></li>
              <li>Find the blocked user (status will show as "Blocked")</li>
              <li>Click <strong>Unblock</strong></li>
              <li>Confirm the action</li>
            </ol>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'tenant-management': {
      id: 'tenant-management',
      title: 'Tenant Management',
      icon: TeamOutlined,
      color: '#fa8c16',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      items: [
        {
          id: 'tm-1',
          title: 'Adding New Tenants',
          description: 'How to register a new tenant database.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Register new tenant databases to make them available in the system.</p>
            <h4>Steps:</h4>
            <ol>
              <li>Navigate to <strong>Tenant Management</strong></li>
              <li>Click <strong>Add Tenant</strong> or <strong>Create Tenant</strong></li>
              <li>Fill in tenant details:
                <ul>
                  <li>Tenant ID (unique identifier)</li>
                  <li>Tenant Name</li>
                  <li>Database connection details (host, port, database name)</li>
                  <li>Database credentials (username, password)</li>
                  <li>Organization (if you're not SUPER_ADMIN)</li>
                </ul>
              </li>
              <li>Click <strong>Test Connection</strong> to verify database connectivity</li>
              <li>If test succeeds, click <strong>Save</strong> to register the tenant</li>
            </ol>
            <p><strong>Important:</strong> Always test the connection before saving to ensure the tenant database is accessible.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'tm-2',
          title: 'Testing Tenant Connections',
          description: 'Verify that tenant databases are accessible.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Test connections to ensure tenant databases are properly configured.</p>
            <h4>How to Test:</h4>
            <ol>
              <li>In <strong>Tenant Management</strong>, find the tenant</li>
              <li>Click <strong>Test Connection</strong> button</li>
              <li>Wait for the test to complete</li>
              <li>Review the result:
                <ul>
                  <li><strong>Success:</strong> Database is accessible and credentials are correct</li>
                  <li><strong>Failure:</strong> Check connection details and network access</li>
                </ul>
              </li>
            </ol>
            <p><strong>Common Issues:</strong></p>
            <ul>
              <li>Incorrect database credentials</li>
              <li>Network connectivity problems</li>
              <li>Database server not running</li>
              <li>Firewall blocking connections</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'page-configuration': {
      id: 'page-configuration',
      title: 'Page Configuration',
      icon: SettingOutlined,
      color: '#eb2f96',
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
      items: [
        {
          id: 'pc-1',
          title: 'Creating a New Page',
          description: 'Configure a new data page for users.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
          content: `
            <p>Create configurable pages that users can access to view data.</p>
            <h4>Steps:</h4>
            <ol>
              <li>Navigate to <strong>Page Config</strong> (Developer/Admin access required)</li>
              <li>Click <strong>Create Page</strong> or <strong>Add Page</strong></li>
              <li>Configure page settings:
                <ul>
                  <li><strong>Page Key:</strong> Unique identifier (e.g., "patient_records")</li>
                  <li><strong>Title:</strong> Display name for the page</li>
                  <li><strong>Data Source:</strong> Table or view name in the tenant database</li>
                  <li><strong>Columns:</strong> Select which columns to display</li>
                  <li><strong>Filters:</strong> Configure filterable fields</li>
                  <li><strong>Search Fields:</strong> Define searchable columns</li>
                  <li><strong>Download Permission:</strong> Enable/disable data downloads</li>
                </ul>
              </li>
              <li>Save the configuration</li>
              <li>Page will be immediately available to users with appropriate permissions</li>
            </ol>
            <p><strong>Tip:</strong> Use descriptive page keys and titles to help users find pages easily.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'pc-2',
          title: 'Configuring Page Filters',
          description: 'Set up filters for data pages.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
          content: `
            <p>Configure which fields users can filter on for each page.</p>
            <h4>Filter Types:</h4>
            <ul>
              <li><strong>Text Filters:</strong> For string fields (contains, equals, starts with)</li>
              <li><strong>Number Filters:</strong> For numeric fields (equals, greater than, less than)</li>
              <li><strong>Date Filters:</strong> For date fields (range, before, after)</li>
              <li><strong>Dropdown Filters:</strong> For fields with predefined values</li>
            </ul>
            <h4>How to Configure:</h4>
            <ol>
              <li>Edit an existing page or create a new one</li>
              <li>Go to the <strong>Filters</strong> section</li>
              <li>Select fields you want to make filterable</li>
              <li>Choose filter type for each field</li>
              <li>Set default values if needed</li>
              <li>Save configuration</li>
            </ol>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'organization-management': {
      id: 'organization-management',
      title: 'Organization Management',
      icon: CrownOutlined,
      color: '#f5222d',
      roles: ['SUPER_ADMIN'],
      items: [
        {
          id: 'om-1',
          title: 'Managing Organizations',
          description: 'Create and manage organizations (SUPER_ADMIN only).',
          roles: ['SUPER_ADMIN'],
          content: `
            <p>As a SUPER_ADMIN, you can manage all organizations in the system.</p>
            <h4>Organization Features:</h4>
            <ul>
              <li>Create new organizations</li>
              <li>Edit organization details</li>
              <li>Manage organization branding</li>
              <li>View organization statistics</li>
            </ul>
            <h4>How to Manage:</h4>
            <ol>
              <li>Navigate to <strong>Organization Management</strong></li>
              <li>View all organizations in the system</li>
              <li>Create new organizations or edit existing ones</li>
              <li>Configure organization-specific settings</li>
            </ol>
            <p><strong>Note:</strong> Only SUPER_ADMIN users can access this section.</p>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'audit-logs': {
      id: 'audit-logs',
      title: 'Audit Logs',
      icon: SafetyOutlined,
      color: '#13c2c2',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      items: [
        {
          id: 'al-1',
          title: 'Viewing Audit Logs',
          description: 'Monitor system activity and user actions.',
          roles: ['SUPER_ADMIN', 'ADMIN'],
          content: `
            <p>Audit logs track all important actions in the system for compliance and security.</p>
            <h4>What's Logged:</h4>
            <ul>
              <li>User login/logout events</li>
              <li>Data access and queries</li>
              <li>Configuration changes</li>
              <li>User management actions</li>
              <li>Tenant switching</li>
            </ul>
            <h4>How to View:</h4>
            <ol>
              <li>Navigate to <strong>Audit Logs</strong></li>
              <li>Use filters to narrow down logs:
                <ul>
                  <li>Date range</li>
                  <li>User</li>
                  <li>Action type</li>
                  <li>Tenant</li>
                </ul>
              </li>
              <li>Export logs if needed for compliance</li>
            </ol>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
    'troubleshooting': {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: ExclamationCircleOutlined,
      color: '#faad14',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
      items: [
        {
          id: 'ts-1',
          title: 'Page Not Loading?',
          description: 'What to do when a page fails to load.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>If a page isn't loading, try these steps:</p>
            <ol>
              <li><strong>Check Tenant Connection:</strong> Ensure you've selected a valid tenant</li>
              <li><strong>Refresh the Page:</strong> Press F5 or click the refresh button</li>
              <li><strong>Check Permissions:</strong> Verify you have access to the page</li>
              <li><strong>Clear Browser Cache:</strong> Sometimes cached data causes issues</li>
              <li><strong>Contact Administrator:</strong> If problems persist, reach out to your admin</li>
            </ol>
            <p><strong>Common Causes:</strong></p>
            <ul>
              <li>Tenant database connection issues</li>
              <li>Missing page permissions</li>
              <li>Network connectivity problems</li>
              <li>Browser compatibility issues</li>
            </ul>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'ts-2',
          title: 'Permission Denied Errors',
          description: 'Understanding and resolving permission issues.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>If you see "Permission Denied" errors, here's what to check:</p>
            <h4>Common Scenarios:</h4>
            <ul>
              <li><strong>Page Access:</strong> You may not have permission to view this page</li>
              <li><strong>Tenant Access:</strong> You may not have access to this tenant</li>
              <li><strong>Feature Access:</strong> Some features require specific roles</li>
            </ul>
            <h4>What to Do:</h4>
            <ol>
              <li>Verify your role and permissions with your administrator</li>
              <li>Check if you're accessing the correct tenant</li>
              <li>Contact your administrator to request additional permissions</li>
            </ol>
            <p><strong>Note:</strong> ADMIN and MANAGER roles typically have broader access than USER role.</p>
          `,
          videoUrl: null,
          steps: [],
        },
        {
          id: 'ts-3',
          title: 'Data Not Appearing',
          description: 'Why data might not show up in tables.',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'DEVELOPER'],
          content: `
            <p>If expected data isn't showing, check these:</p>
            <ol>
              <li><strong>Filters:</strong> Clear all filters to see all data</li>
              <li><strong>Search:</strong> Clear search terms</li>
              <li><strong>Tenant:</strong> Ensure you're viewing the correct tenant</li>
              <li><strong>Date Range:</strong> Check if date filters are too restrictive</li>
              <li><strong>Permissions:</strong> Verify you have access to view this data</li>
            </ol>
          `,
          videoUrl: null,
          steps: [],
        },
      ],
    },
  };

  // Filter content by role
  const filteredContent = {};
  Object.keys(allContent).forEach((categoryKey) => {
    const category = allContent[categoryKey];
    if (hasRoleAccess(userRole, category.roles)) {
      const filteredItems = category.items.filter((item) =>
        hasRoleAccess(userRole, item.roles)
      );
      if (filteredItems.length > 0) {
        filteredContent[categoryKey] = {
          ...category,
          items: filteredItems,
        };
      }
    }
  });

  return filteredContent;
};

// Get help items for search (flattened)
export const getSearchableHelpItems = (userRole) => {
  const content = getHelpContentByRole(userRole);
  const items = [];
  
  Object.values(content).forEach((category) => {
    category.items.forEach((item) => {
      items.push({
        ...item,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryIcon: category.icon,
        categoryColor: category.color,
      });
    });
  });
  
  return items;
};

