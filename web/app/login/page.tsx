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
  const homepageDescription =
    loginPageData?.homepageDescription ||
    "I take on a limited number of projects and share details directly.";

  return <LoginForm heroTitle={heroTitle} homepageDescription={homepageDescription} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] min-h-screen w-full bg-background px-[2.5%] sm:px-6 pt-[22px]">
          <div className="font-soehne text-[26px] text-foreground/50">Loading…</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
