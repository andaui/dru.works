import { Suspense } from 'react';
import { client, pageDataQuery } from '@/lib/sanity';
import LoginForm from './LoginForm';

async function getLoginPageData() {
  try {
    const pageData = await client.fetch(pageDataQuery('login'));
    return pageData || null;
  } catch (error) {
    console.error('Error fetching login page data:', error);
    return null;
  }
}

async function LoginPageContent() {
  const loginPageData = await getLoginPageData();
  const heroTitle = loginPageData?.heroTitle || "Design partner\nwith technical skills";
  const heroDescription = loginPageData?.heroDescription || "I take on a limited number of projects and share details directly.";

  return <LoginForm heroTitle={heroTitle} heroDescription={heroDescription} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden flex items-center justify-center px-[2.5%] sm:px-[24px]">
        <div className="w-full flex flex-col gap-[59px] items-center text-center">
          <div className="flex flex-col gap-[19px] items-center w-full">
            <h1 className="font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] w-full">
              <p className="mb-0">Design partner</p>
              <p className="mb-0">with technical skills</p>
            </h1>
            <p className="font-normal text-[12px] leading-[19px] not-italic text-[#989898] w-full">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
