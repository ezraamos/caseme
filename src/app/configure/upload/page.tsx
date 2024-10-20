'use client';

import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/actions/s3.actions';

import { cn } from '@/lib/utils';
import { Image, Loader2, MousePointerSquareDashed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const router = useRouter();

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;

    setIsDragOver(false);
    if (rejectedFiles.length > 1) {
      toast({
        title: `Multiple Files Uploaded`,
        description: 'Please upload 1 image instead.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: `${file.file.type} type is not supported.`,
        description: 'Please choose a PNG, JPG, or JPEG image instead.',
        variant: 'destructive',
      });
    }
  };

  const onDropAccepted = async (acceptedFiles: File[]) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      const { configId } = await uploadFile(formData);
      setIsLoading(false);
      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });

      setIsDragOver(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        'relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center',
        {
          'ring-blue-900/25 bg-blue-900/10': isDragOver,
        }
      )}
    >
      <div className='relative flex flex-1 flex-col items-center justify-center w-full'>
        <Dropzone
          maxFiles={1}
          maxSize={5242880}
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
          }}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className='h-full w-full flex-1 flex flex-col items-center justify-center'
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragOver ? (
                <MousePointerSquareDashed className='h-6 w-6 text-zinc-500 mb-2' />
              ) : isLoading || isPending ? (
                <Loader2 className='animate-spin h-6 w-6 text-zinc-500 mb-2' />
              ) : (
                <Image className='h-6 w-6 text-zinc-500 mb-2' />
              )}
              <div className='flex flex-col justify-center mb-2 text-sm text-zinc-700'>
                {isLoading ? (
                  <div className='flex flex-col items-center'>
                    <p>Uploading...</p>
                    <Progress className='mt-2 w-40 h-2 bg-gray-300' />
                  </div>
                ) : isPending ? (
                  <div className='flex flex-col items-center'>
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isDragOver ? (
                  <p>
                    <span className='font-semibold'>Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className='font-semibold'>Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>

              {isPending ? null : (
                <p className='text-xs text-zinc-500'>PNG, JPG, JPEG</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
};

export default Page;
