import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import Steps from '@/components/Steps';
import { getSession } from '@/lib/getSession';
import { redirect } from 'next/navigation';

import { ReactNode } from 'react';

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <MaxWidthWrapper className='flex-1 w-full flex flex-col'>
      <Steps />
      {children}
    </MaxWidthWrapper>
  );
};

export default Layout;
