import { useState } from 'react';
import Navbar from './components/Navbar';
import Timeline from './components/Timeline';
import Footer from './components/Footer';
import KofiButton from './components/KofiButton';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-inter">
      <Navbar />
      <MusicPlayer />
      <Timeline onLightboxToggle={setIsLightboxOpen} />
      <Footer />
      <KofiButton isVisible={!isLightboxOpen} />
    </div>
  );
}

export default App;
