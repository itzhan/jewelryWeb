import TopBanner from '@/components/TopBanner';
import Header from '@/components/Header';
import MainNav from '@/components/MainNav';
import Breadcrumb from '@/components/Breadcrumb';
import Reviews from '@/components/Reviews';
import OurCouples from '@/components/OurCouples';
import Newsletter from '@/components/Newsletter';
import Guarantees from '@/components/Guarantees';
import Footer from '@/components/Footer';
import StepExperience from '@/components/StepExperience';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <MainNav />
      <div className="page-width py-8">
        <Breadcrumb />
      </div>
      <StepExperience />
      <Reviews />
      <OurCouples />
      <Newsletter />
      <Guarantees />
      <Footer />
    </div>
  );
}
