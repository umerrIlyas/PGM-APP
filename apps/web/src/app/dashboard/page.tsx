import { DashboardGreeting } from '@/components/DashboardGreeting';
import { DashboardMetrics } from '@/components/DashboardMetrics';

export const metadata = {
  title: 'Dashboard - PGM App',
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <DashboardGreeting />
      </div>

      <DashboardMetrics />
    </div>
  );
}
