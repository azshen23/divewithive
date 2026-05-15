import Navbar from './components/Navbar';
import Timeline from './components/Timeline';
import Footer from './components/Footer';
import KofiButton from './components/KofiButton';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-inter">
      <Navbar />
      <Timeline />
      <Footer />
      <KofiButton />
    </div>
  );
}

export default App;
