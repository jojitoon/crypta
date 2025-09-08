import { Suspense } from 'react';
import { AdminResetPassword } from '../../components/AdminResetPassword';

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <AdminResetPassword />
    </Suspense>
  );
}
