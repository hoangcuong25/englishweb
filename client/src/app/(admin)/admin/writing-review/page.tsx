import { redirect } from 'next/navigation';

export default function AdminWritingReviewPage() {
  redirect('/admin/assessments?tab=writing');
}
