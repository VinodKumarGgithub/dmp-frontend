import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin, Card, Typography } from 'antd';

const { Title } = Typography;

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={4}>Access Denied</Title>
          <p>You need administrator privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return children;
}

