import { Skeleton, Card } from 'antd';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'form';
  rows?: number;
}

export default function LoadingSkeleton({ type = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: rows }} />
      </Card>
    );
  }

  return (
    <Card>
      <Skeleton active title={false} paragraph={{ rows: 1, width: '30%' }} />
      <div className="mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} active title={false} paragraph={{ rows: 1 }} className="mb-2" />
        ))}
      </div>
    </Card>
  );
}
