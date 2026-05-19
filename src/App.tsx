import Timeline from './components/Timeline';
import KofiButton from './components/KofiButton';
import MusicPlayer from './components/MusicPlayer';

function App() {
  //const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-inter">
      <MusicPlayer />
      <Timeline />
      <KofiButton isVisible={false} />
    </div>
  );
}

export default App;
