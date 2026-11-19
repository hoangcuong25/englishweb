import { redirect } from 'next/navigation';

export default function AdminSpeakingGradingPage() {
  redirect('/admin/assessments?tab=speaking');
}
