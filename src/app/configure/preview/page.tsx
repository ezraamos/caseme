import { notFound } from 'next/navigation';
import DesignPreview from './DesignPreview';
import prisma from '@/db';
import { SessionProvider } from 'next-auth/react';
interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;

  if (!id || typeof id !== 'string') {
    return notFound();
  }

  const configuration = await prisma.configuration.findUnique({
    where: { id },
  });

  if (!configuration) {
    return notFound();
  }
  return (
    <SessionProvider>
      <DesignPreview configuration={configuration} />
    </SessionProvider>
  );
};

export default Page;
