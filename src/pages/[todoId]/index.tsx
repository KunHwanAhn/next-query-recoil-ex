import React from 'react';
import { useRouter } from 'next/router';

export default function TodoDetail() {
  const router = useRouter();
  const { todoId } = router.query;

  return (
    <div>
      Detail Page / #
      {todoId}
    </div>
  );
}
