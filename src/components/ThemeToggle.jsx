import { Button, theme as antdTheme } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { token } = antdTheme.useToken();

  return (
    <Button
      type="text"
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      style={{ color: token.colorText }}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    />
  );
}

