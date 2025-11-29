import { Tag, Tooltip } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useCanWrite } from '../hooks/useFeatureGate';

/**
 * Read-Only Mode Indicator
 * Shows a badge when user is in read-only mode (license expired)
 */
export function ReadOnlyModeIndicator() {
  const { readOnly } = useCanWrite();

  if (!readOnly) {
    return null;
  }

  return (
    <Tooltip title="Your license has expired. You are in read-only mode. Please renew your license to continue creating and editing.">
      <Tag 
        icon={<LockOutlined />} 
        color="warning"
        style={{ 
          marginRight: 8,
          cursor: 'help'
        }}
      >
        Read-Only Mode
      </Tag>
    </Tooltip>
  );
}

