import { Tooltip, QuestionCircleOutlined } from 'antd';
import { theme } from 'antd';

export default function HelpTooltip({ content, placement = 'top' }) {
  const { token } = theme.useToken();
  
  if (!content) return null;

  return (
    <Tooltip title={content} placement={placement}>
      <QuestionCircleOutlined
        style={{
          marginLeft: 8,
          color: token.colorTextSecondary,
          cursor: 'help',
          fontSize: 12,
        }}
      />
    </Tooltip>
  );
}

