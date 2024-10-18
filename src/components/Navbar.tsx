import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import { Button, buttonVariants } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { getSession } from '@/lib/getSession';
import { signout } from '@/lib/actions/user.actions';

const Navbar = async () => {
  const session = await getSession();
  const isAdmin = session?.user.role === 'admin';

  return (
    <nav className='sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link href='/' className='flex z-40 text-lg font-semibold  '>
            Case
            <span className='text-[#30D5C8] text-lg'>Me</span>
          </Link>
          <div className='h-full flex items-center space-x-4'>
            {session ? (
              <>
                {isAdmin && (
                  <Link
                    href='/admin/dashboard'
                    className={buttonVariants({
                      variant: 'ghost',
                    })}
                  >
                    Dashboard
                  </Link>
                )}
                <form action={signout}>
                  <Button type='submit' variant='ghost'>
                    Logout
                  </Button>
                </form>

                {!isAdmin && (
                  <Link
                    href='/configure/upload'
                    className={buttonVariants({
                      size: 'sm',
                      className: 'hidden sm:flex items-center gap-1',
                    })}
                  >
                    Create Case
                    <ArrowRight className='ml-1.5 h-5 w-5' />
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href='/register'
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  })}
                >
                  Sign up
                </Link>
                <Link
                  href='/login'
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  })}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
