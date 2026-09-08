import { Typography, Breadcrumb, Space, Flex } from 'antd';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const { Title } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, extra }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="mb-3"
          items={breadcrumbs.map((item) => ({
            title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
          }))}
        />
      )}
      <Flex justify="space-between" align="center">
        <div>
          <Title level={3} className="!mb-0">{title}</Title>
          {subtitle && (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          )}
        </div>
        {extra && <Space>{extra}</Space>}
      </Flex>
    </div>
  );
}
