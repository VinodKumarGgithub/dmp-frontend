import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Typography,
  Space,
  Collapse,
  Tag,
  Tooltip,
  Divider,
} from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { message } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Error Display Component with Query Context
 * Shows enhanced error messages with SQL query preview and suggestions
 */
export default function ErrorDisplay({ error, config }) {
  const [showQuery, setShowQuery] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) {
    return null;
  }

  const queryContext = error?.queryContext || error?.response?.data?.queryContext;
  const errorMessage = error?.message || error?.response?.data?.message || 'An error occurred';
  const errorCode = error?.code || error?.response?.data?.code || error?.response?.data?.error?.code;
  const errorDetails = error?.details || error?.response?.data?.details || error?.response?.data?.error?.details;

  // Determine error category and icon
  const category = queryContext?.category || 'unknown';
  const errorType = queryContext?.type || 'UNKNOWN_ERROR';
  
  const getErrorTypeInfo = () => {
    // Check for dangerous SQL error code first
    if (errorCode === 'DANGEROUS_SQL_DETECTED') {
      return { color: 'red', label: 'Dangerous SQL Detected', icon: <ExclamationCircleOutlined /> };
    }
    
    switch (errorType) {
      case 'SQL_SYNTAX_ERROR':
        return { color: 'red', label: 'SQL Syntax Error', icon: <ExclamationCircleOutlined /> };
      case 'COLUMN_NOT_FOUND':
        return { color: 'orange', label: 'Column Not Found', icon: <InfoCircleOutlined /> };
      case 'TABLE_NOT_FOUND':
        return { color: 'red', label: 'Table Not Found', icon: <ExclamationCircleOutlined /> };
      case 'PERMISSION_DENIED':
        return { color: 'red', label: 'Permission Denied', icon: <ExclamationCircleOutlined /> };
      case 'QUERY_TIMEOUT':
        return { color: 'orange', label: 'Query Timeout', icon: <InfoCircleOutlined /> };
      case 'CONNECTION_ERROR':
        return { color: 'red', label: 'Connection Error', icon: <ExclamationCircleOutlined /> };
      default:
        return { color: 'default', label: 'Database Error', icon: <InfoCircleOutlined /> };
    }
  };

  const typeInfo = getErrorTypeInfo();
  const sanitizedSql = queryContext?.sanitizedSql;
  const executionTime = queryContext?.executionTime;
  const lineNumber = queryContext?.lineNumber;
  const column = queryContext?.column;
  const hints = queryContext?.hints || [];
  const availableColumns = config?.columns || [];

  // Get column suggestions for column not found errors
  const getColumnSuggestions = () => {
    if (errorType !== 'COLUMN_NOT_FOUND' || !column || !Array.isArray(availableColumns)) {
      return [];
    }

    const missingCol = column.toLowerCase();
    return availableColumns
      .map(col => {
        const colName = typeof col === 'string' ? col : (col.name || '');
        if (!colName) return null;

        const colNameLower = colName.toLowerCase();
        
        // Exact match (case insensitive)
        if (colNameLower === missingCol) {
          return { name: colName, score: 100 };
        }

        // Contains match
        if (colNameLower.includes(missingCol) || missingCol.includes(colNameLower)) {
          return { name: colName, score: 50 };
        }

        // Similarity check (simple)
        const similarity = calculateSimilarity(colNameLower, missingCol);
        if (similarity > 60) {
          return { name: colName, score: similarity };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.name);
  };

  const columnSuggestions = getColumnSuggestions();

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      message.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      message.error('Failed to copy');
    });
  };

  return (
    <Card 
      style={{ marginBottom: 16 }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message={
            <Space>
              {typeInfo.icon}
              <Text strong>{typeInfo.label}</Text>
              {errorCode && <Tag color={typeInfo.color}>{errorCode}</Tag>}
            </Space>
          }
          description={
            <div>
              {/* Show message with details in brackets if both exist */}
              <Paragraph style={{ marginBottom: 8 }}>
                {(() => {
                  let detailsText = null;
                  if (errorDetails) {
                    if (Array.isArray(errorDetails) && errorDetails.length > 0) {
                      detailsText = errorDetails.join('; ');
                    } else if (typeof errorDetails === 'string') {
                      detailsText = errorDetails;
                    }
                  }
                  
                  if (errorMessage && detailsText) {
                    return `${errorMessage} (${detailsText})`;
                  } else if (errorMessage) {
                    return errorMessage;
                  } else if (detailsText) {
                    return detailsText;
                  } else {
                    return 'An error occurred';
                  }
                })()}
              </Paragraph>
              {lineNumber && (
                <Text type="secondary" aria-label={`Error at line ${lineNumber}`}>
                  Error at line {lineNumber}
                </Text>
              )}
            </div>
          }
          type="error"
          showIcon
          style={{ width: '100%' }}
          role="alert"
        />

        {errorDetails && (
          <div>
            {/* Only show details if they provide additional information beyond the message */}
            {(() => {
              const detailsText = Array.isArray(errorDetails) 
                ? errorDetails.join(', ') 
                : String(errorDetails);
              // Only show details if they're different from the message
              if (detailsText !== errorMessage) {
                return (
                  <>
                    <Text strong>Details: </Text>
                    <Text type="secondary">{detailsText}</Text>
                  </>
                );
              }
              return null;
            })()}
          </div>
        )}

        {column && errorType === 'COLUMN_NOT_FOUND' && (
          <div>
            <Text strong>Missing Column: </Text>
            <Tag color="red">{column}</Tag>
            {columnSuggestions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Did you mean: </Text>
                <Space wrap>
                  {columnSuggestions.map((suggestion, idx) => (
                    <Tag key={idx} color="blue" style={{ cursor: 'pointer' }}>
                      {suggestion}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}

        {sanitizedSql && (
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Button
                type="text"
                icon={showQuery ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowQuery(!showQuery)}
                size="small"
                aria-label={showQuery ? 'Hide SQL query' : 'Show SQL query'}
                aria-expanded={showQuery}
              >
                {showQuery ? 'Hide' : 'Show'} Query
              </Button>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(sanitizedSql)}
                size="small"
                aria-label="Copy SQL query to clipboard"
              >
                Copy Query
              </Button>
            </Space>

            {showQuery && (
              <Collapse>
                <Panel header="Executed SQL Query" key="sql">
                  <div style={{ position: 'relative' }}>
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        margin: 0,
                        maxHeight: '300px',
                      }}
                    >
                      {sanitizedSql}
                    </pre>
                  </div>
                  {lineNumber && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Error location: Line {lineNumber}
                      </Text>
                    </div>
                  )}
                </Panel>
              </Collapse>
            )}
          </div>
        )}

        {hints.length > 0 && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Helpful Tips:</Text>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {hints.map((hint, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>{hint}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {queryContext?.sourceType === 'PROCEDURE' 
              ? 'This error occurred while executing a stored procedure query.'
              : 'This error occurred while executing a database query.'}
          </Text>
        </div>
      </Space>
    </Card>
  );
}

/**
 * Simple similarity calculation (Levenshtein distance based)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 100;
  
  // Simple character-based similarity
  let matches = 0;
  const minLen = Math.min(len1, len2);
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return (matches / maxLen) * 100;
}

